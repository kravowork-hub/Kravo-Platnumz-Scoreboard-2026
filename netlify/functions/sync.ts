// Serverless sync handler for Netlify deployments
const serverlessCache = new Map<string, any>();

export async function handler(event: { httpMethod: string; path: string; body: string | null }) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const pathParts = (event.path || '').split('/');
  const room = decodeURIComponent(pathParts[pathParts.length - 1] || 'platnumz-live-match');

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

  if (event.httpMethod === 'POST') {
    try {
      const incoming = event.body ? JSON.parse(event.body) : {};
      const existing = serverlessCache.get(room) || defaultState;
      const merged = {
        ...existing,
        ...incoming,
        room,
        updatedAt: incoming?.updatedAt || Date.now()
      };
      serverlessCache.set(room, merged);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, state: merged })
      };
    } catch (e: any) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, state: defaultState })
      };
    }
  }

  // GET
  const state = serverlessCache.get(room) || defaultState;
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, state })
  };
}
