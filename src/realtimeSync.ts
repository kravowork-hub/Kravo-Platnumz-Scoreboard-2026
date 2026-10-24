import Paho from 'paho-mqtt';
import { ScoreState } from './App';

export type SyncStatus = 'connected' | 'syncing' | 'offline';

export interface SyncEngineOptions {
  onStateReceived: (state: ScoreState) => void;
  onStatusChange?: (status: SyncStatus) => void;
}

const BROKERS = [
  { host: 'broker.emqx.io', port: 8084, path: '/mqtt' },
  { host: 'broker.hivemq.com', port: 8884, path: '/mqtt' }
];

export class RealtimeSyncEngine {
  private client: Paho.Client | null = null;
  private currentRoom: string = '';
  private currentBrokerIndex = 0;
  private isConnected = false;
  private reconnectTimer: any = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private onStateReceived: (state: ScoreState) => void;
  private onStatusChange?: (status: SyncStatus) => void;
  private pendingPublishState: ScoreState | null = null;
  private clientId: string;
  private destroyed = false;

  constructor(options: SyncEngineOptions) {
    this.onStateReceived = options.onStateReceived;
    this.onStatusChange = options.onStatusChange;
    this.clientId = 'platnumz_' + Math.random().toString(36).substring(2, 10);

    // Setup Local BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('platnumz_scoreboard_bus');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            this.onStateReceived(event.data);
          }
        };
      }
    } catch (e) {
      // BroadcastChannel not supported in some older environments
    }

    // Setup LocalStorage listener
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);
    }
  }

  private handleStorageEvent = (e: StorageEvent) => {
    if (e.key === 'platnumz-scoreboard-state' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && typeof parsed === 'object') {
          this.onStateReceived(parsed);
        }
      } catch (err) {}
    }
  };

  public setRoom(roomName: string) {
    const cleanRoom = (roomName || 'platnumz-live-match').trim();
    if (this.currentRoom === cleanRoom) return;

    if (this.isConnected && this.client && this.currentRoom) {
      try {
        this.client.unsubscribe(`platnumz/scoreboard/v2/${this.currentRoom}`);
      } catch (e) {}
    }

    this.currentRoom = cleanRoom;
    this.connect();
  }

  private getTopic(room: string): string {
    return `platnumz/scoreboard/v2/${encodeURIComponent(room || 'platnumz-live-match')}`;
  }

  public connect() {
    if (this.destroyed || typeof window === 'undefined') return;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Disconnect existing client if any
    if (this.client) {
      try {
        if (this.client.isConnected()) {
          this.client.disconnect();
        }
      } catch (e) {}
      this.client = null;
    }

    this.isConnected = false;
    this.onStatusChange?.('syncing');

    const broker = BROKERS[this.currentBrokerIndex % BROKERS.length];

    try {
      const client = new Paho.Client(broker.host, broker.port, broker.path, this.clientId);
      this.client = client;

      client.onConnectionLost = (responseObject) => {
        this.isConnected = false;
        if (responseObject.errorCode !== 0) {
          console.log('[RealtimeSync] Connection lost:', responseObject.errorMessage);
        }
        this.onStatusChange?.('offline');
        this.scheduleReconnect();
      };

      client.onMessageArrived = (message) => {
        try {
          const payload = message.payloadString;
          if (payload) {
            const data = JSON.parse(payload);
            if (data && typeof data === 'object') {
              this.onStateReceived(data);
              this.onStatusChange?.('connected');
            }
          }
        } catch (e) {
          console.warn('[RealtimeSync] Could not parse incoming payload');
        }
      };

      client.connect({
        useSSL: true,
        timeout: 4,
        keepAliveInterval: 30,
        cleanSession: true,
        onSuccess: () => {
          this.isConnected = true;
          this.onStatusChange?.('connected');
          const topic = this.getTopic(this.currentRoom);
          try {
            client.subscribe(topic, { qos: 1 });
            console.log(`[RealtimeSync] Connected to ${broker.host} · Subscribed to ${topic}`);
          } catch (e) {}

          // If there was an unsent state while connecting, send it now
          if (this.pendingPublishState) {
            const state = this.pendingPublishState;
            this.pendingPublishState = null;
            this.publish(state);
          }
        },
        onFailure: (err) => {
          console.warn(`[RealtimeSync] Failed to connect to ${broker.host}:`, err.errorMessage);
          this.isConnected = false;
          this.onStatusChange?.('offline');
          // Switch to fallback broker
          this.currentBrokerIndex++;
          this.scheduleReconnect();
        }
      });
    } catch (err) {
      console.warn('[RealtimeSync] Initialization error:', err);
      this.currentBrokerIndex++;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.destroyed || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  public publish(state: ScoreState) {
    if (!state) return;
    const room = state.room || this.currentRoom || 'platnumz-live-match';

    // 1. Permanent LocalStorage
    try {
      localStorage.setItem('platnumz-scoreboard-state', JSON.stringify(state));
    } catch (e) {}

    // 2. Local BroadcastChannel
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(state);
      }
    } catch (e) {}

    // 3. Realtime Cloud Pub/Sub via WebSocket (Cross-device, Vercel, Netlify)
    const topic = this.getTopic(room);
    if (this.isConnected && this.client && this.client.isConnected()) {
      try {
        const message = new Paho.Message(JSON.stringify(state));
        message.destinationName = topic;
        message.qos = 1;
        message.retained = true;
        this.client.send(message);
        this.onStatusChange?.('connected');
      } catch (err) {
        console.warn('[RealtimeSync] Publish failed, buffering:', err);
        this.pendingPublishState = state;
      }
    } else {
      this.pendingPublishState = state;
    }

    // 4. Fallback HTTP POST for local Node.js / Express or serverless function
    fetch(`/api/sync/${encodeURIComponent(room)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    }).catch(() => {
      // Gracefully ignore network or 404 errors on static hosts
    });
  }

  public destroy() {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    if (this.client) {
      try {
        if (this.client.isConnected()) this.client.disconnect();
      } catch (e) {}
      this.client = null;
    }
  }
}
