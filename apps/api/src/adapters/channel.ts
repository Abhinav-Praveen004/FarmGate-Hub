export interface ChannelMessagePayload {
  farmerId: string;
  phone: string;
  channel: 'whatsapp' | 'voice' | 'app';
  text: string;
  templateType?: 'lot_received' | 'price_alert' | 'sale_confirmed' | 'payout_sent' | 'pod_excursion';
  language?: 'en' | 'hi' | 'ta';
}

export interface ChannelProvider {
  sendMessage(payload: ChannelMessagePayload): Promise<{ delivered: boolean; messageId: string }>;
  isSimulated(): boolean;
}

export class SimulatedChannelProvider implements ChannelProvider {
  private messageLog: Array<ChannelMessagePayload & { id: string; timestamp: string }> = [];

  public async sendMessage(payload: ChannelMessagePayload): Promise<{ delivered: boolean; messageId: string }> {
    const messageId = `MSG-SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();
    this.messageLog.push({ ...payload, id: messageId, timestamp });
    return { delivered: true, messageId };
  }

  public getHistory(farmerId?: string) {
    if (!farmerId) return this.messageLog;
    return this.messageLog.filter((m) => m.farmerId === farmerId);
  }

  public isSimulated(): boolean {
    return true;
  }
}

export const defaultChannelProvider = new SimulatedChannelProvider();
