export interface ScaleDevice {
  getLiveReadingGrams(): number;
  captureWeightGrams(targetGrams?: number): number;
  isSimulated(): boolean;
}

export class SimulatedScaleDevice implements ScaleDevice {
  private currentWeightGrams: number = 120_000; // 120.0 kg default for Meena's Lot #214

  public setWeight(grams: number) {
    this.currentWeightGrams = grams;
  }

  public getLiveReadingGrams(): number {
    // Slight simulated sensor flutter: ±50 grams
    const jitter = Math.floor(Math.random() * 100) - 50;
    return Math.max(0, this.currentWeightGrams + jitter);
  }

  public captureWeightGrams(targetGrams?: number): number {
    if (targetGrams !== undefined) {
      this.currentWeightGrams = targetGrams;
    }
    return this.currentWeightGrams;
  }

  public isSimulated(): boolean {
    return true;
  }
}

export const defaultScaleDevice = new SimulatedScaleDevice();
