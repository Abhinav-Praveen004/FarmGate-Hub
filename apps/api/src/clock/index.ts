/**
 * Injectable Simulation Clock (Section 6.9)
 * All time throughout the API and simulated devices derives from this clock.
 */

export type ClockListener = (currentIsoTime: string, offsetHours: number) => void;

export class Clock {
  private baseEpochMs: number;
  private offsetMs: number;
  private listeners: Set<ClockListener> = new Set();

  constructor(initialIsoString: string = '2026-11-18T06:00:00.000Z', initialOffsetHours: number = 0) {
    this.baseEpochMs = new Date(initialIsoString).getTime();
    this.offsetMs = initialOffsetHours * 3600 * 1000;
  }

  /**
   * Returns current simulated Date.
   */
  public now(): Date {
    return new Date(this.baseEpochMs + this.offsetMs);
  }

  /**
   * Returns current simulated ISO timestamp string.
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
    return this.setOffsetHours(initialOffsetHours);
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
