/**
 * Injectable Simulation Clock (Section 6.9)
 * All time throughout the API and simulated devices derives from this clock.
 */

export type ClockListener = (currentIsoTime: string, offsetHours: number) => void;

export class Clock {
  private baseEpochMs: number;
  private offsetMs: number;
  private startedAtMs: number;
  private mode: 'simulated' | 'actual' = 'simulated';
  private listeners: Set<ClockListener> = new Set();

  constructor(initialIsoString: string = '2026-11-18T10:00:00.000Z', initialOffsetHours: number = 0) {
    this.baseEpochMs = new Date(initialIsoString).getTime();
    this.offsetMs = initialOffsetHours * 3600 * 1000;
    this.startedAtMs = Date.now();
  }

  public setMode(mode: 'simulated' | 'actual') {
    this.mode = mode;
    this.notify(this.toISOString(), this.getOffsetHours());
  }

  public getMode(): 'simulated' | 'actual' {
    return this.mode;
  }

  /**
   * Returns current active Date (dynamic ticking).
   */
  public now(): Date {
    if (this.mode === 'actual') {
      return new Date();
    }
    const elapsedMs = Date.now() - this.startedAtMs;
    return new Date(this.baseEpochMs + this.offsetMs + elapsedMs);
  }

  /**
   * Returns current active ISO timestamp string.
   */
  public toISOString(): string {
    return this.now().toISOString();
  }

  /**
   * Advances the clock by a given number of hours.
   */
  public advance(hours: number): string {
    this.offsetMs += hours * 3600 * 1000;
    const current = this.toISOString();
    this.notify(current, this.getOffsetHours());
    return current;
  }

  /**
   * Sets the clock to a specific offset in hours from the base epoch.
   */
  public setOffsetHours(hours: number): string {
    this.offsetMs = hours * 3600 * 1000;
    const current = this.toISOString();
    this.notify(current, hours);
    return current;
  }

  public getOffsetHours(): number {
    return this.offsetMs / (3600 * 1000);
  }

  public reset(initialOffsetHours: number = 0): string {
    this.startedAtMs = Date.now();
    this.offsetMs = initialOffsetHours * 3600 * 1000;
    const current = this.toISOString();
    this.notify(current, initialOffsetHours);
    return current;
  }

  public subscribe(listener: ClockListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(current: string, offset: number) {
    for (const listener of this.listeners) {
      try {
        listener(current, offset);
      } catch (err) {
        console.error('Error in clock listener:', err);
      }
    }
  }
}

export const systemClock = new Clock();
