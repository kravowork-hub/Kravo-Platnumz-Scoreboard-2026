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

  // Real-time synchronization memory hub with disk persistence
  const roomStates = new Map<string, any>();
  const roomListeners = new Map<string, Set<express.Response>>();
  const STATE_FILE = path.join(__dirname, '.match-state.json');

  // Load persisted rooms from disk if available
  try {
    const fs = await import('fs/promises');
    const raw = await fs.readFile(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      Object.entries(parsed).forEach(([k, v]) => {
        roomStates.set(k, v);
      });
      console.log('Loaded persisted match states from disk:', Object.keys(parsed));
    }
  } catch (e) {
    // File not found or invalid on first start
  }

  // If default room has not been loaded from disk, set with initial baseline updatedAt: 1
  // so any client-entered details with real timestamps take immediate priority
  if (!roomStates.has('platnumz-live-match')) {
    roomStates.set('platnumz-live-match', {
      name1: 'CHAIRMAN TINDO',
      name2: 'BOSS OWIZA',
      score1: 2,
      score2: 1,
      br1: 0,
      br2: 0,
      raceTo: 3,
      flag1: '🇿🇼',
      flag2: '🇿🇼',
      tournament: 'PLATINUM SKILLS OPEN',
      venue: 'HARARE, ZIMBABWE',
      pot: '$500',
      brand: 'KRAVO PLATNUMZ OFFICIAL',
      room: 'platnumz-live-match',
      overlayPosition: 'bottom',
      updatedAt: 1
    });
  }

  // Debounced persistence helper to write state to disk
  let saveTimeout: NodeJS.Timeout | null = null;
  const persistStates = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      try {
        const fs = await import('fs/promises');
        const obj: Record<string, any> = {};
        roomStates.forEach((val, key) => {
          obj[key] = val;
        });
        await fs.writeFile(STATE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
      } catch (err) {
        console.error('Failed to write match-state.json:', err);
      }
    }, 200);
  };

  // Get current state of a room
  app.get('/api/sync/:room', (req, res) => {
    const room = req.params.room || 'platnumz-live-match';
    const state = roomStates.get(room) || roomStates.get('platnumz-live-match');
    res.json({ success: true, state });
  });

  // Publish state update to a room
  app.post('/api/sync/:room', (req, res) => {
    const room = req.params.room || 'platnumz-live-match';
    const incoming = req.body;
    if (incoming && typeof incoming === 'object') {
      const existing = roomStates.get(room) || {};
      const incomingTime = Number(incoming.updatedAt) || 0;
      const existingTime = Number(existing.updatedAt) || 0;

      // Reject stale and tied writes. Equal timestamps can arrive out of order
      // when two controller updates are posted in the same millisecond.
      if (incomingTime > existingTime || existingTime <= 1) {
        const merged = {
          ...existing,
          ...incoming,
          updatedAt: incomingTime > 0 ? incomingTime : Date.now()
        };
        roomStates.set(room, merged);
        persistStates();

        const listeners = roomListeners.get(room);
        if (listeners) {
          const payload = `data: ${JSON.stringify(merged)}\n\n`;
          listeners.forEach((clientRes) => {
            try {
              clientRes.write(payload);
            } catch (err) {}
          });
        }
      }
    }
    res.json({ success: true, state: roomStates.get(room) });
  });

  // Real-time Server-Sent Events stream for instant OBS overlay updates
  app.get('/api/sync/:room/events', (req, res) => {
    const room = req.params.room || 'platnumz-live-match';
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders?.();

    if (!roomListeners.has(room)) {
      roomListeners.set(room, new Set());
    }
    roomListeners.get(room)!.add(res);

    const currentState = roomStates.get(room) || roomStates.get('platnumz-live-match');
    if (currentState) {
      res.write(`data: ${JSON.stringify(currentState)}\n\n`);
    }

    const pingInterval = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch (e) {}
    }, 20000);

    req.on('close', () => {
      clearInterval(pingInterval);
      roomListeners.get(room)?.delete(res);
    });
  });

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

  // Linux Mint Installation Script with dynamic origin injection
  app.get('/install-linux-mint.sh', async (req, res) => {
    try {
      const fs = await import('fs/promises');
      const scriptPath = path.join(__dirname, 'public', 'install-linux-mint.sh');
      let scriptContent = await fs.readFile(scriptPath, 'utf-8');
      
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = req.headers.host || 'localhost:3000';
      const currentOrigin = `${proto}://${host}`;

      scriptContent = scriptContent.replace(
        /DEFAULT_URL="[^"]*"/,
        `DEFAULT_URL="${currentOrigin}"`
      );

      res.setHeader('Content-Type', 'text/x-shellscript; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline; filename="install-linux-mint.sh"');
      res.send(scriptContent);
    } catch (e: any) {
      res.status(500).send(`echo "Error generating Linux Mint installer: ${e.message}"`);
    }
  });

  // Linux Mint Desktop Entry Launcher with dynamic origin injection
  app.get('/platnumz-scoreboard.desktop', async (req, res) => {
    try {
      const fs = await import('fs/promises');
      const desktopPath = path.join(__dirname, 'public', 'platnumz-scoreboard.desktop');
      let desktopContent = await fs.readFile(desktopPath, 'utf-8');

      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = req.headers.host || 'localhost:3000';
      const currentOrigin = `${proto}://${host}`;

      desktopContent = desktopContent.replace(
        /https:\/\/ais-dev-yxnie2e36phjg3qeo7atdj-703565137561\.europe-west2\.run\.app/g,
        currentOrigin
      );

      res.setHeader('Content-Type', 'application/x-desktop; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="platnumz-scoreboard.desktop"');
      res.send(desktopContent);
    } catch (e: any) {
      res.status(500).send(`Error generating desktop entry: ${e.message}`);
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
      let installScriptContent = '';
      try {
        installScriptContent = await fs.readFile(path.join(__dirname, 'public', 'install-linux-mint.sh'), 'utf-8');
      } catch (err) {}
      res.json({
        success: true,
        files: {
          'index.html': indexContent,
          'overlay.html': overlayContent,
          'README.md': readmeContent,
          'install-linux-mint.sh': installScriptContent
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Mount Vite dev server with HMR disabled (disabled in AI Studio environment)
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false,
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
