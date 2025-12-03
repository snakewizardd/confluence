// Session tracking for user listening history

export interface Session {
  instrument: string;
  duration: number; // seconds
  timestamp: string;
}

export interface SessionData {
  sessions: Session[];
  totalTime: number;
  lastVisit: string;
}

const STORAGE_KEY = 'confluence_sessions';

export class SessionTracker {
  private startTime: number | null = null;
  private currentInstrument: string | null = null;

  // Start tracking a session
  start(instrument: string) {
    this.startTime = Date.now();
    this.currentInstrument = instrument;
  }

  // End tracking and save to localStorage
  end() {
    if (!this.startTime || !this.currentInstrument) return;

    const duration = Math.floor((Date.now() - this.startTime) / 1000);

    if (duration > 0) {
      this.saveSession({
        instrument: this.currentInstrument,
        duration,
        timestamp: new Date().toISOString(),
      });
    }

    this.startTime = null;
    this.currentInstrument = null;
  }

  // Save a session to localStorage
  private saveSession(session: Session) {
    if (typeof window === 'undefined') return;

    const data = this.getData();
    data.sessions.push(session);
    data.totalTime += session.duration;
    data.lastVisit = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Get all session data
  getData(): SessionData {
    if (typeof window === 'undefined') {
      return { sessions: [], totalTime: 0, lastVisit: '' };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { sessions: [], totalTime: 0, lastVisit: '' };
    }

    try {
      return JSON.parse(stored);
    } catch {
      return { sessions: [], totalTime: 0, lastVisit: '' };
    }
  }

  // Get most listened instrument
  getMostListened(): string | null {
    const data = this.getData();
    if (data.sessions.length === 0) return null;

    const counts: Record<string, number> = {};
    data.sessions.forEach((session) => {
      counts[session.instrument] = (counts[session.instrument] || 0) + session.duration;
    });

    let maxInstrument: string | null = null;
    let maxDuration = 0;

    Object.entries(counts).forEach(([instrument, duration]) => {
      if (duration > maxDuration) {
        maxDuration = duration;
        maxInstrument = instrument;
      }
    });

    return maxInstrument;
  }

  // Format duration as human-readable string
  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return 'less than a minute';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${minutes} minutes`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 1 && remainingMinutes === 0) return '1 hour';
    if (hours === 1) return `1 hour ${remainingMinutes} minutes`;
    if (remainingMinutes === 0) return `${hours} hours`;
    return `${hours} hours ${remainingMinutes} minutes`;
  }

  // Check if user favors chaos instruments
  favorsChaos(): boolean {
    const data = this.getData();
    if (data.sessions.length === 0) return false;

    const chaosInstruments = ['lorenz', 'automaton'];
    const chaosTime = data.sessions
      .filter((s) => chaosInstruments.includes(s.instrument))
      .reduce((sum, s) => sum + s.duration, 0);

    return chaosTime > data.totalTime / 2;
  }

  // Check if user favors order instruments
  favorsOrder(): boolean {
    const data = this.getData();
    if (data.sessions.length === 0) return false;

    const orderInstruments = ['fibonacci', 'spectrum'];
    const orderTime = data.sessions
      .filter((s) => orderInstruments.includes(s.instrument))
      .reduce((sum, s) => sum + s.duration, 0);

    return orderTime > data.totalTime / 2;
  }

  // Is this a new user?
  isNewUser(): boolean {
    return this.getData().sessions.length === 0;
  }
}

// Global singleton instance
export const sessionTracker = new SessionTracker();
