import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  // Serve static files from public
  app.use(express.static(path.join(__dirname, 'public')));

  // Git Status API
  app.get('/api/git-status', async (_req, res) => {
    try {
      const repoPath = path.join(__dirname, 'repo_src');
      const { stdout: logOut } = await execAsync('git log -n 5 --oneline', { cwd: repoPath });
      const { stdout: statusOut } = await execAsync('git status -s', { cwd: repoPath });
      const { stdout: branchOut } = await execAsync('git branch --show-current', { cwd: repoPath });
      res.json({
        success: true,
        branch: branchOut.trim(),
        log: logOut.trim(),
        status: statusOut.trim() || 'Working tree clean (Ready to push)'
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Git Push API with Personal Access Token
  app.post('/api/git-push', async (req, res) => {
    const { token, branch = 'main' } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'GitHub Personal Access Token is required.' });
    }
    try {
      const cleanToken = token.trim();
      const repoPath = path.join(__dirname, 'repo_src');
      // Push via authenticated HTTPS
      const pushUrl = `https://${cleanToken}@github.com/kravowork-hub/Platnumz-Scoreboard.git`;
      const { stdout, stderr } = await execAsync(`git push "${pushUrl}" ${branch}`, { cwd: repoPath });
      res.json({
        success: true,
        message: 'Successfully pushed to github.com/kravowork-hub/Platnumz-Scoreboard',
        output: stdout || stderr
      });
    } catch (e: any) {
      // Mask token in output for security
      const safeError = (e.message || '').replace(new RegExp(token, 'g'), '***TOKEN***');
      res.status(500).json({ success: false, error: safeError });
    }
  });

  // Export files as text payload API
  app.get('/api/repo-files', async (_req, res) => {
    try {
      const fs = await import('fs/promises');
      const repoPath = path.join(__dirname, 'repo_src');
      const indexContent = await fs.readFile(path.join(repoPath, 'index.html'), 'utf-8');
      const overlayContent = await fs.readFile(path.join(repoPath, 'overlay.html'), 'utf-8');
      const readmeContent = await fs.readFile(path.join(repoPath, 'README.md'), 'utf-8');
      res.json({
        success: true,
        files: {
          'index.html': indexContent,
          'overlay.html': overlayContent,
          'README.md': readmeContent
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Mount Vite dev server
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  const port = process.env.PORT || 3000;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
