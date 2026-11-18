import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { systemClock } from '../clock/index.js';
import { defaultChannelProvider } from '../adapters/index.js';

export const channelsRouter = new Hono();

export function normalizeFarmerId(id?: string): string {
  if (!id) return 'farmer_ramesh';
  const clean = id.trim().toLowerCase();
  if (clean === 'farmer-001' || clean === 'farmer_001' || clean.includes('ramesh')) return 'farmer_ramesh';
  if (clean === 'farmer-002' || clean === 'farmer_002' || clean.includes('murugan')) return 'farmer_murugan';
  if (clean === 'farmer-003' || clean === 'farmer_003' || clean.includes('lakshmi')) return 'farmer_lakshmi';
  if (clean === 'farmer_meena' || clean.includes('meena')) return 'farmer_meena';
  if (clean === 'farmer_selvam' || clean.includes('selvam')) return 'farmer_selvam';
  return id;
}

async function handleInboundWhatsApp(c: any) {
  const body = await c.req.json();
  const rawFarmerId = body.farmerId || 'FARMER-001';
  const normalizedId = normalizeFarmerId(rawFarmerId);
  const rawText = (body.body || body.messageText || body.text || '').trim();
  const nowIso = systemClock.toISOString();

  if (!rawText) {
    return c.json({ error: 'Message body is required' }, 400);
  }

  // 1. Save inbound message
  const inMsgId = `msg_in_${Date.now()}`;
  db.insert(schema.channelMessages).values({
    id: inMsgId,
    farmerId: rawFarmerId,
    channel: 'whatsapp',
    direction: 'inbound',
    messageText: rawText,
    timestamp: nowIso,
  }).run();

  // Find farmer preferred language and persona name
  const farmer = db
    .select()
    .from(schema.farmers)
    .where(or(eq(schema.farmers.id, rawFarmerId), eq(schema.farmers.id, normalizedId)))
    .get();

  const lang = (body.lang || farmer?.preferredLanguage || 'en').toLowerCase();
  const farmerName = farmer?.name || (rawFarmerId === 'FARMER-001' ? 'Ramesh Chandra' : 'Farmer');

  const upper = rawText.toUpperCase();
  let replyText = '';

  const isPrice =
    upper === '1' ||
    upper.startsWith('1:') ||
    upper.startsWith('1.') ||
    /\b(PRICE|PRICES|MANDI|RATE|BHAV)\b/i.test(upper) ||
    rawText.includes('விலை') ||
    rawText.includes('भाव') ||
    rawText.includes('दाम');

  const isLots =
    upper === '2' ||
    upper.startsWith('2:') ||
    upper.startsWith('2.') ||
    /\b(LOT|LOTS|POD|STORAGE|COOL|TEMP|TEMPERATURE)\b/i.test(upper) ||
    rawText.includes('லாட்') ||
    rawText.includes('லார்ட்') ||
    rawText.includes('लॉट');

  const isReceipt =
    upper === '3' ||
    upper.startsWith('3:') ||
    upper.startsWith('3.') ||
    /\b(RECEIPT|PAY|PAYMENT|UPI|MONEY|WATERFALL|UTR|SETTLE|SETTLEMENT)\b/i.test(upper) ||
    rawText.includes('ரசீது') ||
    rawText.includes('ரசீது') ||
    rawText.includes('रसीद') ||
    rawText.includes('पैसा');

  const isGreeting =
    /\b(HI|HELLO|HEY|NAMASTE|HELP|START)\b/i.test(upper) ||
    rawText.includes('வணக்கம்') ||
    rawText.includes('नमस्ते') ||
    rawText.includes('ஹலோ');

  const isDecision =
    /\b(SELL|HOLD|DECISION|ADVICE)\b/i.test(upper) ||
    rawText.includes('விற்க') ||
    rawText.includes('வைக்க') ||
    rawText.includes('बेच') ||
    rawText.includes('रख');

  if (isPrice) {
    if (lang === 'ta') {
      replyText = 'இன்றைய தக்காளி மண்டி விலை ₹9/கிலோ. சிறந்த கொள்முதல் விலை ₹14/கிலோ. பரிந்துரை: கூல் பாலில் 1 நாள் வைக்கவும் (நாளை ₹14-15/கிலோ எதிர்பார்க்கப்படுகிறது).';
    } else if (lang === 'hi') {
      replyText = 'आज का टमाटर मंडी भाव ₹9/किग्रा। सर्वोत्तम खरीदार बोली ₹14/किग्रा। सिफारिश: कूल पॉड #01 में 1 दिन रखें (कल ₹14–15/किग्रा मांग अपेक्षित)।';
    } else {
      replyText = "Today's Tomato Mandi Price is ₹9/kg. Best Buyer Bid is ₹14/kg (Annapurna Kirana Network). Recommendation: HOLD in Cool Pod #01.";
    }
  } else if (isLots) {
    if (lang === 'ta') {
      replyText = 'லாட் #214: 120 கிலோ தரம் A தக்காளிகள் குளிர்பதன அறையில் 14 மணிநேரமாக சேமிப்பில் உள்ளது. வாங்குபவர் பொருத்தம்: 78%.';
    } else if (lang === 'hi') {
      replyText = 'लॉट #214: 120 किग्रा ग्रेड A टमाटर कूल पॉड में 14 घंटे से सुरक्षित। खरीदार मिलान: 78%।';
    } else {
      replyText = 'Lot #214: 120 kg Grade A Hybrid Tomatoes in Cool Pod #01 at 11.5°C (14 hours elapsed). Buyer match score: 78% (Annapurna Kirana Network).';
    }
  } else if (isReceipt) {
    if (lang === 'ta') {
      replyText = 'லாட் #198 ரசீது: நுகர்வோர் விலை ₹30/கிலோ. விற்பனை விலை ₹13.50/கிலோ. ஹப் கட்டணம் ₹1.9/கிலோ. நிகர தொகை ₹1,159.50 UPI மூலம் செலுத்தப்பட்டது.';
    } else if (lang === 'hi') {
      replyText = 'लॉट #198 रसीद: ग्राहक दर ₹30/किग्रा। विक्रय मूल्य ₹13.50/किग्रा। हब शुल्क ₹1.9/किग्रा। ₹1,159.50 यूपीआई से 24 घंटे में भुगतान संपन्न।';
    } else {
      replyText = 'Receipt for Lot #198: Consumer price ₹30/kg. Sale price ₹13.50/kg. Hub fee ₹1.9/kg. Net ₹1,159.50 transferred via UPI (UTR: FGH-UPI-8841).';
    }
  } else if (isDecision) {
    if (lang === 'ta') {
      replyText = 'முடிவு ஆலோசனை: இன்றைய ₹9 மண்டி விலையுடன் ஒப்பிடும்போது ₹14 சிறந்த விலையாகும். நாளை ₹14.50-₹15 வரை உயர வாய்ப்புள்ளதால் 1 நாள் வைத்திருப்பது சிறந்தது.';
    } else if (lang === 'hi') {
      replyText = 'निर्णय सलाह: वर्तमान बोली ₹14/किग्रा (मंडी भाव ₹9) है। हमारे पूर्वानुमान के अनुसार कल ₹14.50-₹15 की मांग रहेगी, अतः 1 दिन होल्ड करना लाभदायक है।';
    } else {
      replyText = 'Decision Advisory: Current buyer bid of ₹14.00/kg beats mandi price (₹9.00/kg). Forecast predicts peak demand at ₹14.50–₹15.00/kg tomorrow afternoon, so holding in Cool Pod is recommended.';
    }
  } else if (isGreeting) {
    if (lang === 'ta') {
      replyText = `வணக்கம் ${farmerName}! ஃபார்ம்கேட் ஹப் நேரலை சேவைக்கு வரவேற்கிறோம். PRICE (விலை), LOTS (விளைச்சல்), அல்லது RECEIPT (ரசீது) என தட்டச்சு செய்யவும்.`;
    } else if (lang === 'hi') {
      replyText = `नमस्ते ${farmerName} जी! फार्मगेट हब में आपका स्वागत है। त्वरित जानकारी हेतु PRICE, LOTS या RECEIPT टाइप करें।`;
    } else {
      replyText = `Namaste ${farmerName}! Welcome to FarmGate Hub WhatsApp Assistant. Reply with PRICE, LOTS, or RECEIPT for quick updates, or ask any question!`;
    }
  } else {
    if (lang === 'ta') {
      replyText = `செய்தி கிடைத்தது ("${rawText}"): உங்கள் லாட் #214 கூல் பாலில் 11.5°C இல் பாதுகாப்பாக உள்ளது. இன்றைய சிறந்த விலை ₹14/கிலோ. PRICE, LOTS அல்லது RECEIPT என டைப் செய்து முழு விவரங்களை அறியலாம்.`;
    } else if (lang === 'hi') {
      replyText = `संदेश प्राप्त हुआ ("${rawText}"): आपका लॉट #214 कूल पॉड #01 में 11.5°C पर सुरक्षित है। आज का सर्वोत्तम भाव ₹14/किग्रा है। त्वरित जानकारी के लिए PRICE, LOTS या RECEIPT लिखें।`;
    } else {
      replyText = `Received: "${rawText}". Your Lot #214 is safe in Cool Pod #01 at 11.5°C with buyer bids at ₹14.00/kg. Reply PRICE, LOTS, or RECEIPT for detailed reports!`;
    }
  }

  // 2. Save outbound reply
  const outMsgId = `msg_out_${Date.now()}`;
  db.insert(schema.channelMessages).values({
    id: outMsgId,
    farmerId: rawFarmerId,
    channel: 'whatsapp',
    direction: 'outbound',
    messageText: replyText,
    timestamp: new Date().toISOString(),
  }).run();

  await defaultChannelProvider.sendMessage({
    farmerId: normalizedId,
    phone: farmer?.phone || '+91 00000 00001',
    channel: 'whatsapp',
    text: replyText,
  });

  return c.json({
    success: true,
    reply: replyText,
    timestamp: nowIso,
  });
}

// Inbound webhook routes (support both aliases)
channelsRouter.post('/whatsapp/inbound', handleInboundWhatsApp);
channelsRouter.post('/whatsapp/incoming', handleInboundWhatsApp);
channelsRouter.post('/inbound', handleInboundWhatsApp);
channelsRouter.post('/incoming', handleInboundWhatsApp);

// Formatted messages array for client WhatsApp UI
channelsRouter.get('/whatsapp/messages', async (c) => {
  const rawFarmerId = c.req.query('farmerId') || 'FARMER-001';
  const normalizedId = normalizeFarmerId(rawFarmerId);

  const messages = db
    .select()
    .from(schema.channelMessages)
    .where(
      or(
        eq(schema.channelMessages.farmerId, rawFarmerId),
        eq(schema.channelMessages.farmerId, normalizedId)
      )
    )
    .all();

  messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const formatted = messages.map((m) => ({
    id: m.id,
    sender: m.direction === 'inbound' ? 'FARMER' : 'BOT',
    body: m.messageText,
    timestamp: m.timestamp,
  }));

  return c.json(formatted);
});

// Threads route for legacy tests and inspections
channelsRouter.get('/threads', async (c) => {
  const rawFarmerId = c.req.query('farmerId') || 'farmer_meena';
  const normalizedId = normalizeFarmerId(rawFarmerId);

  const messages = db
    .select()
    .from(schema.channelMessages)
    .where(
      or(
        eq(schema.channelMessages.farmerId, rawFarmerId),
        eq(schema.channelMessages.farmerId, normalizedId)
      )
    )
    .all();

  return c.json({
    farmerId: rawFarmerId,
    messages,
    simulated: true,
  });
});
