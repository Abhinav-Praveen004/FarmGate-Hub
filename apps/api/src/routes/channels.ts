import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { systemClock } from '../clock/index.js';
import { defaultChannelProvider } from '../adapters/index.js';

export const channelsRouter = new Hono();

channelsRouter.post('/whatsapp/inbound', async (c) => {
  const body = await c.req.json();
  const { farmerId, messageText } = body;
  const fId = farmerId || 'farmer_meena';
  const cleanCmd = (messageText || '').trim().toUpperCase();
  const nowIso = systemClock.toISOString();

  // Save inbound message
  const inMsgId = `msg_in_${Date.now()}`;
  db.insert(schema.channelMessages).values({
    id: inMsgId,
    farmerId: fId,
    channel: 'whatsapp',
    direction: 'inbound',
    messageText: messageText || '',
    timestamp: nowIso,
  }).run();

  // Find farmer preferred language
  const farmer = db.select().from(schema.farmers).where(eq(schema.farmers.id, fId)).get();
  const lang = farmer?.preferredLanguage || 'en';

  let replyText = '';

  if (cleanCmd.includes('PRICE') || cleanCmd.includes('விலை') || cleanCmd.includes('भाव')) {
    if (lang === 'ta') {
      replyText = 'இன்றைய தக்காளி மண்டி விலை ₹9/கிலோ. சிறந்த கொள்முதல் விலை ₹14/கிலோ. பரிந்துரை: இப்போதே விற்கவும் (SELL).';
    } else if (lang === 'hi') {
      replyText = 'आज का टमाटर मंडी भाव ₹9/किग्रा। सर्वोत्तम खरीदार बोली ₹14/किग्रा। सिफारिश: अभी बेचें (SELL)।';
    } else {
      replyText = "Today's Tomato Mandi Price is ₹9/kg. Best Buyer Bid is ₹14/kg. Recommendation: SELL NOW.";
    }
  } else if (cleanCmd.includes('LOT') || cleanCmd.includes('லாட்') || cleanCmd.includes('लॉट')) {
    if (lang === 'ta') {
      replyText = 'லாட் #214: 120 கிலோ தரம் A தக்காளிகள் குளிர்பதன அறையில் 14 மணிநேரமாக சேமிப்பில் உள்ளது. வாங்குபவர் பொருத்தம்: 78%.';
    } else if (lang === 'hi') {
      replyText = 'लॉट #214: 120 किग्रा ग्रेड A टमाटर कूल पॉड में 14 घंटे से सुरक्षित। खरीदार मिलान: 78%।';
    } else {
      replyText = 'Lot #214: 120 kg Grade A in cool pod for 14 hours. Buyer match score: 78%.';
    }
  } else if (cleanCmd.includes('RECEIPT') || cleanCmd.includes('ரசீது') || cleanCmd.includes('रसीद')) {
    if (lang === 'ta') {
      replyText = 'லாட் #198 ரசீது: நுகர்வோர் விலை ₹30/கிலோ. விற்பனை விலை ₹13.50/கிலோ. ஹப் கட்டணம் ₹1.9/கிலோ. நிகர தொகை ₹1,159.50 UPI மூலம் செலுத்தப்பட்டது.';
    } else if (lang === 'hi') {
      replyText = 'लॉट #198 रसीद: ग्राहक दर ₹30/किग्रा। विक्रय मूल्य ₹13.50/किग्रा। हब शुल्क ₹1.9/किग्रा। ₹1,159.50 यूपीआई से भुगतान संपन्न।';
    } else {
      replyText = 'Receipt for Lot #198: Consumer price ₹30/kg. Sale price ₹13.50/kg. Hub fee ₹1.9/kg. Net ₹1,159.50 transferred via UPI.';
    }
  } else {
    if (lang === 'ta') {
      replyText = 'வணக்கம்! ஃபார்ம்கேட் ஹப் சேவை. PRICE (விலை), LOTS (விளைச்சல்), அல்லது RECEIPT (ரசீது) என தட்டச்சு செய்யவும்.';
    } else if (lang === 'hi') {
      replyText = 'नमस्ते! फार्मगेट हब में आपका स्वागत है। PRICE, LOTS या RECEIPT टाइप करें।';
    } else {
      replyText = 'Welcome to FarmGate Hub! Reply with PRICE, LOTS, or RECEIPT for quick updates.';
    }
  }

  // Save outbound reply
  const outMsgId = `msg_out_${Date.now()}`;
  db.insert(schema.channelMessages).values({
    id: outMsgId,
    farmerId: fId,
    channel: 'whatsapp',
    direction: 'outbound',
    messageText: replyText,
    timestamp: new Date().toISOString(),
  }).run();

  await defaultChannelProvider.sendMessage({
    farmerId: fId,
    phone: farmer?.phone || '+91 00000 00001',
    channel: 'whatsapp',
    text: replyText,
  });

  return c.json({
    success: true,
    reply: replyText,
    timestamp: nowIso,
  });
});

channelsRouter.get('/threads', async (c) => {
  const fId = c.req.query('farmerId') || 'farmer_meena';
  const messages = db
    .select()
    .from(schema.channelMessages)
    .where(eq(schema.channelMessages.farmerId, fId))
    .all();

  return c.json({
    farmerId: fId,
    messages,
    simulated: true,
  });
});
