import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Lot,
  Receipt,
  BuyerOrder,
  CollectiveLoad,
} from '@farmgate/shared';

// API Advance response
export interface Advance {
  id: string;
  lotId: string;
  farmerId: string;
  amountRupees: number;
  feeRupees: number;
  netDisbursedRupees: number;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'SETTLED' | 'DECLINED';
  requestedAt: string;
  disbursedAt?: string;
  transactionReference?: string;
}

export interface ClientLot {
  id: string;
  lotNumber: number;
  farmerId: string;
  farmerName?: string;
  crop: string;
  variety?: string;
  weightGrams: number;
  cratesCount?: number;
  grade: 'A' | 'B' | 'C';
  status: string;
  intakePriceEstimatePaise?: number;
  finalSalePricePaisePerKg?: number;
  hoursInPod?: number;
  holdingLimitHours?: number;
  qrCode: string;
  matchedBuyerName?: string;
  matchedOrderId?: string;
  buyerMatchScore?: number;
  buyerMatchBreakdown?: {
    gradeFit: number;
    quantityFit: number;
    priceFit: number;
    deliveryWindowFit: number;
    reliabilityFit: number;
  };
  timeline?: Array<{
    timestamp: string;
    status: string;
    actor: string;
    note?: string;
  }>;
}

// Base fetcher with error handling
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }
  return res.json();
}

// 1. Today's Prices
export function useTodayPrice(crop = 'tomato') {
  return useQuery<{
    crop: string;
    mandiPriceRupees: number;
    buyerBidRupees: number;
    floorPriceRupees: number;
    forecastLowRupees: number;
    forecastHighRupees: number;
    adviceSentence: string;
    recommendedAction: 'SELL' | 'HOLD' | 'CLOSE_CALL';
  }>({
    queryKey: ['price', crop],
    queryFn: () => fetchJson(`/api/prices/today?crop=${encodeURIComponent(crop)}`),
    staleTime: 10_000,
  });
}

// 2. Farmer Lots
export function useFarmerLots(farmerId?: string) {
  return useQuery<ClientLot[]>({
    queryKey: ['lots', farmerId],
    queryFn: () => fetchJson(`/api/lots${farmerId ? `?farmerId=${encodeURIComponent(farmerId)}` : ''}`),
    staleTime: 5_000,
  });
}

export function useLot(lotId: string) {
  return useQuery<ClientLot>({
    queryKey: ['lot', lotId],
    queryFn: () => fetchJson(`/api/lots/${encodeURIComponent(lotId)}`),
    enabled: Boolean(lotId),
  });
}

// 3. Make Lot Decision (Sell now vs Hold)
export function useMakeLotDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      lotId,
      decision,
      holdHours,
      autoSellAtExpiry,
    }: {
      lotId: string;
      decision: 'SELL' | 'HOLD';
      holdHours?: number;
      autoSellAtExpiry?: boolean;
    }) =>
      fetchJson(`/api/lots/${lotId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, holdHours, autoSellAtExpiry }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots'] });
    },
  });
}

// 4. Advances
export function useFarmerAdvances(farmerId: string) {
  return useQuery<Advance[]>({
    queryKey: ['advances', farmerId],
    queryFn: () => fetchJson(`/api/advances/farmer/${encodeURIComponent(farmerId)}`),
    enabled: Boolean(farmerId),
  });
}

export function useRequestAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      farmerId: string;
      lotId: string;
      percentage: number;
      destinationVpa: string;
    }) =>
      fetchJson<{ advance: Advance; transactionReference: string }>('/api/advances/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advances'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
    },
  });
}

// 5. Receipts
export function useReceipt(receiptId: string) {
  return useQuery<Receipt>({
    queryKey: ['receipt', receiptId],
    queryFn: () => fetchJson(`/api/receipts/${encodeURIComponent(receiptId)}`),
    enabled: Boolean(receiptId),
  });
}

export function useReceiptByLot(lotId: string) {
  return useQuery<Receipt>({
    queryKey: ['receiptByLot', lotId],
    queryFn: () => fetchJson(`/api/receipts/lot/${encodeURIComponent(lotId)}`),
    enabled: Boolean(lotId),
  });
}

// 6. WhatsApp Simulator
export interface WhatsAppMessage {
  id: string;
  sender: 'FARMER' | 'BOT';
  body: string;
  timestamp: string;
  actionPayload?: any;
}

export function useWhatsAppMessages(farmerId: string) {
  return useQuery<WhatsAppMessage[]>({
    queryKey: ['whatsapp', farmerId],
    queryFn: () => fetchJson(`/api/channels/whatsapp/messages?farmerId=${encodeURIComponent(farmerId)}`),
    enabled: Boolean(farmerId),
    refetchInterval: 3000,
  });
}

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ farmerId, body, lang }: { farmerId: string; body: string; lang?: string }) =>
      fetchJson<{ success: boolean; reply: string; timestamp: string }>('/api/channels/whatsapp/incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId, body, lang }),
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', vars.farmerId] });
    },
  });
}
