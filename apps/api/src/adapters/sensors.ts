import { PodTelemetry } from '@farmgate/shared';

export interface SensorFeed {
  getTelemetry(): PodTelemetry;
  triggerPowerCut(): void;
  triggerDoorOpen(open: boolean): void;
  restoreGrid(): void;
  isSimulated(): boolean;
}

export class SimulatedSensorFeed implements SensorFeed {
  private capacityKg: number = 10000;
  private currentOccupancyKg: number = 4200;
  private temperatureCelsius: number = 11.4;
  private setpointCelsius: number = 11.5;
  private humidityPercent: number = 88;
  private solarWatts: number = 4250;
  private thermalBackupPercent: number = 96;
  private gridActive: boolean = true;
  private doorOpen: boolean = false;

  public getTelemetry(): PodTelemetry {
    // If power is cut, thermal backup drains and temperature drifts upwards
    if (!this.gridActive) {
      this.thermalBackupPercent = Math.max(0, this.thermalBackupPercent - 1.2);
      this.temperatureCelsius = Math.min(22.0, this.temperatureCelsius + 0.15);
    }
    if (this.doorOpen) {
      this.temperatureCelsius = Math.min(25.0, this.temperatureCelsius + 0.3);
      this.humidityPercent = Math.max(60, this.humidityPercent - 0.5);
    }

    return {
      capacityKg: this.capacityKg,
      currentOccupancyKg: this.currentOccupancyKg,
      temperatureCelsius: Math.round(this.temperatureCelsius * 10) / 10,
      setpointCelsius: this.setpointCelsius,
      humidityPercent: Math.round(this.humidityPercent),
      solarOutputWatts: this.gridActive ? Math.round(this.solarWatts + (Math.random() * 200 - 100)) : 0,
      thermalBackupPercent: Math.round(this.thermalBackupPercent),
      gridActive: this.gridActive,
      doorOpen: this.doorOpen,
      simulated: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  public triggerPowerCut(): void {
    this.gridActive = false;
  }

  public restoreGrid(): void {
    this.gridActive = true;
    this.temperatureCelsius = this.setpointCelsius;
    this.thermalBackupPercent = 96;
  }

  public triggerDoorOpen(open: boolean): void {
    this.doorOpen = open;
  }

  public addProduce(kg: number): void {
    this.currentOccupancyKg = Math.min(this.capacityKg, this.currentOccupancyKg + kg);
  }

  public removeProduce(kg: number): void {
    this.currentOccupancyKg = Math.max(0, this.currentOccupancyKg - kg);
  }

  public isSimulated(): boolean {
    return true;
  }
}

export const defaultSensorFeed = new SimulatedSensorFeed();
