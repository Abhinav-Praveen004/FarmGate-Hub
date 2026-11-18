import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface Persona {
  id: string;
  name: string;
  role: 'farmer' | 'operator' | 'buyer' | 'investor';
  phone: string;
  landholdingAcres?: number;
  primaryCrop?: string;
  vpa?: string;
  description: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'FARMER-001',
    name: 'Ramesh Chandra',
    role: 'farmer',
    phone: '+91 98450 12345',
    landholdingAcres: 2.0,
    primaryCrop: 'tomato',
    vpa: 'ramesh@okhdfcbank',
    description: 'Smallholder (2 acres), Lot #214 in Cool Pod',
  },
  {
    id: 'FARMER-002',
    name: 'Murugan K.',
    role: 'farmer',
    phone: '+91 98450 67890',
    landholdingAcres: 5.0,
    primaryCrop: 'tomato',
    vpa: 'murugan@upi',
    description: 'Medium farmer (5 acres), 2 lots scheduled',
  },
  {
    id: 'FARMER-003',
    name: 'Lakshmi Devi',
    role: 'farmer',
    phone: '+91 98450 11223',
    landholdingAcres: 1.5,
    primaryCrop: 'chilli',
    vpa: 'lakshmi@axl',
    description: 'Woman smallholder (1.5 acres), chili & tomato',
  },
];

interface DemoContextType {
  activePersona: Persona;
  setPersona: (persona: Persona) => void;
  clockTime: Date;
  advanceClock: (hours: number) => Promise<void>;
  resetDemo: () => Promise<void>;
  isSSEConnected: boolean;
  isWarping: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  const [clockTime, setClockTime] = useState<Date>(new Date('2026-11-18T10:00:00.000Z'));
  const [isSSEConnected, setIsSSEConnected] = useState(false);
  const [isWarping, setIsWarping] = useState(false);

  // Fetch initial clock time
  useEffect(() => {
    fetch('/api/demo/state')
      .then((res) => res.json())
      .then((data) => {
        if (data.clock?.currentTime) {
          setClockTime(new Date(data.clock.currentTime));
        }
      })
      .catch(() => {
        // Fallback local clock if API is not yet running
      });
  }, []);

  // Listen to Server-Sent Events
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connectSSE() {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setIsSSEConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'time_warp' && data.currentTime) {
              setClockTime(new Date(data.currentTime));
              queryClient.invalidateQueries();
            } else if (data.type === 'reset') {
              if (data.currentTime) setClockTime(new Date(data.currentTime));
              queryClient.invalidateQueries();
            } else {
              // Invalidate specific queries
              queryClient.invalidateQueries();
            }
          } catch {
            // Ignore parse errors on ping/keep-alive
          }
        };

        eventSource.onerror = () => {
          setIsSSEConnected(false);
          eventSource?.close();
          // Attempt reconnect after 5s
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch {
        setIsSSEConnected(false);
      }
    }

    connectSSE();

    return () => {
      clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, [queryClient]);

  const advanceClock = useCallback(
    async (hours: number) => {
      setIsWarping(true);
      try {
        const res = await fetch('/api/demo/clock/advance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hours }),
        });
        const data = await res.json();
        if (data.currentTime) {
          setClockTime(new Date(data.currentTime));
        }
        await queryClient.invalidateQueries();
      } catch (err) {
        console.error('Time warp error:', err);
      } finally {
        setIsWarping(false);
      }
    },
    [queryClient]
  );

  const resetDemo = useCallback(async () => {
    setIsWarping(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (data.currentTime) {
        setClockTime(new Date(data.currentTime));
      }
      await queryClient.invalidateQueries();
    } catch (err) {
      console.error('Demo reset error:', err);
    } finally {
      setIsWarping(false);
    }
  }, [queryClient]);

  return (
    <DemoContext.Provider
      value={{
        activePersona,
        setPersona: setActivePersona,
        clockTime,
        advanceClock,
        resetDemo,
        isSSEConnected,
        isWarping,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export function useDemo(): DemoContextType {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
