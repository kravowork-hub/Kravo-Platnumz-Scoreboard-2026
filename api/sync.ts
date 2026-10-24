// Serverless sync handler for Vercel deployments
import type { IncomingMessage, ServerResponse } from 'http';

// In-memory fallback cache for serverless instance lifetime
const serverlessCache = new Map<string, any>();

export default async function handler(req: IncomingMessage & { query?: any; body?: any }, res: ServerResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = req.url || '';
  const match = url.match(/\/api\/sync\/?([^\/?#]*)/);
  const room = (match && match[1]) ? decodeURIComponent(match[1]) : 'platnumz-live-match';

  const defaultState = {
    name1: 'CHAIRMAN TINDO',
    name2: 'BOSS OWIZA',
    score1: 2,
    score2: 1,
    br1: 0,
    br2: 0,
    appleRed1: 0,
    appleGreen1: 0,
    appleRed2: 0,
    appleGreen2: 0,
    raceTo: 3,
    flag1: '🇿🇼',
    flag2: '🇿🇼',
    tournament: 'PLATINUM SKILLS OPEN',
    venue: 'HARARE, ZIMBABWE',
    pot: '$500',
    brand: 'KRAVO PLATNUMZ OFFICIAL',
    room: room,
    overlayPosition: 'bottom',
    updatedAt: 1
  };

  if (req.method === 'POST') {
    try {
      let bodyData = req.body;
      if (!bodyData) {
        const buffers: Buffer[] = [];
        for await (const chunk of req) {
          buffers.push(Buffer.from(chunk));
        }
        const raw = Buffer.concat(buffers).toString('utf-8');
        bodyData = raw ? JSON.parse(raw) : {};
      }

      const existing = serverlessCache.get(room) || defaultState;
      const merged = {
        ...existing,
        ...bodyData,
        room,
        updatedAt: bodyData?.updatedAt || Date.now()
      };
      serverlessCache.set(room, merged);

      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, state: merged }));
    } catch (e: any) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, state: defaultState }));
    }
    return;
  }

  // GET handler
  const state = serverlessCache.get(room) || defaultState;
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ success: true, state }));
}
