export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  timestamp: string;
}

export interface PaymentProvider {
  sendPayout(farmerUpi: string, amountPaise: number, note: string): Promise<PaymentResult>;
  isSimulated(): boolean;
}

export class SimulatedUPIProvider implements PaymentProvider {
  private shouldFailNext: boolean = false;

  public setShouldFailNext(fail: boolean) {
    this.shouldFailNext = fail;
  }

  public async sendPayout(farmerUpi: string, amountPaise: number, note: string): Promise<PaymentResult> {
    const timestamp = new Date().toISOString();
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return {
        success: false,
        errorMessage: 'SIMULATED_GATEWAY_TIMEOUT: Farmer bank server did not respond.',
        timestamp,
      };
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const transactionId = `UPI-SIM-${Date.now()}-${randomSuffix}`;
    return {
      success: true,
      transactionId,
      timestamp,
    };
  }

  public isSimulated(): boolean {
    return true;
  }
}

export const defaultPaymentProvider = new SimulatedUPIProvider();
