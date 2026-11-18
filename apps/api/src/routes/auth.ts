import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const authRouter = new Hono();

// Global in-memory active persona for demo session
let activePersonaId: string = 'farmer_meena';

export function getActivePersonaId(): string {
  return activePersonaId;
}

export function setActivePersonaId(id: string) {
  activePersonaId = id;
}

authRouter.post('/login', async (c) => {
  const body = await c.req.json();
  const { personaId } = body;
  if (!personaId) {
    return c.json({ error: 'personaId is required' }, 400);
  }
  setActivePersonaId(personaId);
  return c.json({ success: true, activePersonaId });
});

authRouter.get('/me', async (c) => {
  const personaId = getActivePersonaId();

  if (personaId === 'farmer_meena') {
    const farmer = db.select().from(schema.farmers).where(eq(schema.farmers.id, 'farmer_meena')).get();
    return c.json({
      personaId,
      role: 'farmer',
      name: farmer?.name || 'Meena',
      details: farmer,
    });
  }

  if (personaId === 'operator_ravi') {
    return c.json({
      personaId,
      role: 'hub_operator',
      name: 'Ravi',
      hubId: 'hub_annur_cluster',
      hubName: 'Annur Cluster Hub (FPO)',
    });
  }

  if (personaId === 'buyer_annapurna') {
    const buyer = db.select().from(schema.buyers).where(eq(schema.buyers.id, 'buyer_annapurna')).get();
    return c.json({
      personaId,
      role: 'buyer',
      name: buyer?.name || 'Annapurna Kirana Network',
      details: buyer,
    });
  }

  return c.json({
    personaId: 'investor',
    role: 'investor',
    name: 'Impact Investor / Evaluator',
  });
});
