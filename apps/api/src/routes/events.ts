import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { systemClock } from '../clock/index.js';

export const eventsRouter = new Hono();

type SSEClient = (data: string) => void;
const sseClients = new Set<SSEClient>();

export function broadcastEvent(eventType: string, payload: any) {
  const message = JSON.stringify({ type: eventType, payload, timestamp: systemClock.toISOString() });
  for (const send of sseClients) {
    try {
      send(message);
    } catch (err) {
      // client disconnected
    }
  }
}

// Broadcast time shifts whenever system clock advances
systemClock.subscribe((currentIso, offset) => {
  broadcastEvent('clock_tick', { currentIso, offsetHours: offset });
});

eventsRouter.get('/', (c) => {
  return streamSSE(c, async (stream) => {
    const client: SSEClient = (data: string) => {
      stream.writeSSE({ data });
    };

    sseClients.add(client);

    // Initial greeting event
    await stream.writeSSE({
      data: JSON.stringify({
        type: 'connected',
        payload: {
          currentSimulatedTime: systemClock.toISOString(),
          offsetHours: systemClock.getOffsetHours(),
        },
      }),
    });

    stream.onAbort(() => {
      sseClients.delete(client);
    });

    // Keep connection alive
    while (true) {
      await stream.sleep(15000);
      try {
        await stream.writeSSE({ data: JSON.stringify({ type: 'heartbeat', timestamp: systemClock.toISOString() }) });
      } catch {
        break;
      }
    }
  });
});
