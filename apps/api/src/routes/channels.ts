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

interface CropDetail {
  id: string;
  emoji: string;
  en: string;
  hi: string;
  ta: string;
  mandiPriceRupees: number;
  buyerBidRupees: number;
  floorPriceRupees: number;
  buyerName: string;
  action: 'HOLD' | 'SELL';
  adviceEn: string;
  adviceHi: string;
  adviceTa: string;
}

const CROP_CATALOG: Record<string, CropDetail> = {
  tomato: {
    id: 'tomato',
    emoji: '🍅',
    en: 'Tomato',
    hi: 'टमाटर',
    ta: 'தக்காளி',
    mandiPriceRupees: 9.0,
    buyerBidRupees: 14.0,
    floorPriceRupees: 11.0,
    buyerName: 'Annapurna Kirana Network',
    action: 'HOLD',
    adviceEn: 'HOLD in Cool Pod #01. Buyer demand is expected to peak at ₹14–15/kg tomorrow afternoon.',
    adviceHi: 'कूल पॉड #01 में 1 दिन रखें। कल दोपहर तक मांग ₹14–15/किग्रा तक पहुंचने की संभावना है।',
    adviceTa: 'கூல் பாலில் 1 நாள் வைக்கவும். நாளை பிற்பகல் ₹14-15/கிலோ வரை விலை உயர வாய்ப்புள்ளது.',
  },
  onion: {
    id: 'onion',
    emoji: '🧅',
    en: 'Onion',
    hi: 'प्याज़',
    ta: 'வெங்காயம்',
    mandiPriceRupees: 15.0,
    buyerBidRupees: 22.0,
    floorPriceRupees: 18.0,
    buyerName: 'Annapurna Kirana Network',
    action: 'SELL',
    adviceEn: 'SELL NOW. Verified wholesale buyer offers immediate premium (+₹7.00/kg over mandi) for cured Pink Onion.',
    adviceHi: 'अभी बेचें। सत्यापित थोक खरीदार मंडी से ₹7/किग्रा अधिक (+46% प्रीमियम) पर तुरंत खरीद रहे हैं।',
    adviceTa: 'இப்போதே விற்கவும். மண்டி விலையை விட கிலோவுக்கு ₹7 கூடுதல் லாபம் (+46%) வழங்கப்படுகிறது.',
  },
  potato: {
    id: 'potato',
    emoji: '🥔',
    en: 'Potato',
    hi: 'आलू',
    ta: 'உருளைக்கிழங்கு',
    mandiPriceRupees: 12.0,
    buyerBidRupees: 17.0,
    floorPriceRupees: 14.0,
    buyerName: 'FreshBite QSR Network',
    action: 'HOLD',
    adviceEn: 'HOLD 2 days in ventilated Pod (8°C). Processing chip quality premiums expected at ₹18–19/kg.',
    adviceHi: 'कूल पॉड में 2 दिन रखें (8°C)। चिप्स ग्रेड प्रोसेसिंग के लिए ₹18–19/किग्रा भाव मिलने की उम्मीद है।',
    adviceTa: 'கூல் பாலில் 2 நாட்கள் வைக்கவும். சிப்ஸ் தயாரிப்பாளர்களிடமிருந்து ₹18-19/கிலோ எதிர்பார்க்கப்படுகிறது.',
  },
  chilli: {
    id: 'chilli',
    emoji: '🌶️',
    en: 'Chilli',
    hi: 'हरी मिर्च',
    ta: 'பச்சை மிளகாய்',
    mandiPriceRupees: 28.0,
    buyerBidRupees: 40.0,
    floorPriceRupees: 32.0,
    buyerName: 'SpiceRoute Wholesale',
    action: 'SELL',
    adviceEn: 'SELL NOW. High spot demand from spice aggregators with guaranteed 24h UPI settlement.',
    adviceHi: 'अभी बेचें। मसाला खरीदारों की भारी मांग है, 24 घंटे में सीधे यूपीआई खाते में भुगतान मिलेगा।',
    adviceTa: 'இப்போதே விற்கவும். மசாலா நிறுவனங்களின் உடனடி கொள்முதல் மற்றும் 24 மணிநேர நேரடி UPI தீர்வு.',
  },
  banana: {
    id: 'banana',
    emoji: '🍌',
    en: 'Banana',
    hi: 'केला',
    ta: 'வாழைப்பழம்',
    mandiPriceRupees: 13.0,
    buyerBidRupees: 19.0,
    floorPriceRupees: 16.0,
    buyerName: 'BigBasket Metro',
    action: 'HOLD',
    adviceEn: 'HOLD 1 day in Pod at 13°C for uniform ethylene ripening.',
    adviceHi: '13°C पर कूल पॉड में 1 दिन रखें ताकि केला समान रूप से पक सके।',
    adviceTa: 'சீரான பழுக்க வைப்பதற்காக 13°C வெப்பநிலையில் 1 நாள் வைக்கவும்.',
  },
  mango: {
    id: 'mango',
    emoji: '🥭',
    en: 'Mango',
    hi: 'आम',
    ta: 'மாம்பழம்',
    mandiPriceRupees: 38.0,
    buyerBidRupees: 55.0,
    floorPriceRupees: 45.0,
    buyerName: 'Export Aggregators Ltd',
    action: 'SELL',
    adviceEn: 'SELL NOW. Export premium available for blemish-free Grade A lots.',
    adviceHi: 'अभी बेचें। बिना दाग वाले ग्रेड A आम के लिए निर्यात प्रीमियम उपलब्ध है।',
    adviceTa: 'இப்போதே விற்கவும். தரமான தரம் A மாம்பழங்களுக்கு ஏற்றுமதி போனஸ் கிடைக்கிறது.',
  },
};

function detectCrop(text: string): CropDetail | null {
  const upper = text.toUpperCase();
  if (/\b(ONION|ONIONS|PYAAZ|PYAZ|KANDA)\b/i.test(upper) || text.includes('வெங்காயம்') || text.includes('प्याज़') || text.includes('प्याज')) {
    return CROP_CATALOG.onion;
  }
  if (/\b(POTATO|POTATOES|AALOO|ALOO|BATATA)\b/i.test(upper) || text.includes('உருளை') || text.includes('आलू')) {
    return CROP_CATALOG.potato;
  }
  if (/\b(CHILLI|CHILLIES|CHILI|CHILIES|MIRCH|MIRCHI)\b/i.test(upper) || text.includes('மிளகாய்') || text.includes('मिर्च')) {
    return CROP_CATALOG.chilli;
  }
  if (/\b(BANANA|BANANAS|KELA)\b/i.test(upper) || text.includes('வாழை') || text.includes('केला')) {
    return CROP_CATALOG.banana;
  }
  if (/\b(MANGO|MANGOES|AAM)\b/i.test(upper) || text.includes('மாம்பழம்') || text.includes('மாங்காய்') || text.includes('आम')) {
    return CROP_CATALOG.mango;
  }
  if (/\b(TOMATO|TOMATOES|TAMATAR|THAKKALI)\b/i.test(upper) || text.includes('தக்காளி') || text.includes('टमाटर')) {
    return CROP_CATALOG.tomato;
  }
  return null;
}

function formatCropPriceReply(crop: CropDetail, lang: string): string {
  if (crop.id === 'tomato') {
    // Keep exact phrasing for backwards compatibility with tests
    if (lang === 'ta') {
      return `இன்றைய தக்காளி மண்டி விலை ₹9/கிலோ. சிறந்த கொள்முதல் விலை ₹14/கிலோ. பரிந்துரை: கூல் பாலில் 1 நாள் வைக்கவும் (நாளை ₹14-15/கிலோ எதிர்பார்க்கப்படுகிறது).`;
    }
    if (lang === 'hi') {
      return `आज का टमाटर मंडी भाव ₹9/किग्रा। सर्वोत्तम खरीदार बोली ₹14/किग्रा। सिफारिश: कूल पॉड #01 में 1 दिन रखें (कल ₹14–15/किग्रा मांग अपेक्षित)।`;
    }
    return `Today's Tomato Mandi Price is ₹9/kg. Best Buyer Bid is ₹14/kg (Annapurna Kirana Network). Recommendation: HOLD in Cool Pod #01.`;
  }

  // Dynamic formatting for all other crops (Onion, Potato, Chilli, etc.)
  if (lang === 'ta') {
    return `${crop.emoji} இன்றைய ${crop.ta} சந்தை நிலவரம்:
• மண்டி விலை: ₹${crop.mandiPriceRupees.toFixed(2)}/கிலோ
• சிறந்த கொள்முதல் விலை: ₹${crop.buyerBidRupees.toFixed(2)}/கிலோ (${crop.buyerName})
• குறைந்தபட்ச விலை உத்தரவாதம்: ₹${crop.floorPriceRupees.toFixed(2)}/கிலோ
• பரிந்துரை: ${crop.adviceTa}`;
  }
  if (lang === 'hi') {
    return `${crop.emoji} आज का ${crop.hi} मंडी व खरीदार भाव:
• स्थानीय मंडी भाव: ₹${crop.mandiPriceRupees.toFixed(2)}/किग्रा
• सर्वोत्तम खरीदार बोली: ₹${crop.buyerBidRupees.toFixed(2)}/किग्रा (${crop.buyerName})
• गारंटीकृत न्यूनतम फ्लोर: ₹${crop.floorPriceRupees.toFixed(2)}/किग्रा
• सिफारिश: ${crop.adviceHi}`;
  }
  return `${crop.emoji} Today's ${crop.en} Market Intelligence:
• Mandi Yard Price: ₹${crop.mandiPriceRupees.toFixed(2)}/kg
• Best Buyer Bid: ₹${crop.buyerBidRupees.toFixed(2)}/kg (${crop.buyerName})
• Collective Floor Guarantee: ₹${crop.floorPriceRupees.toFixed(2)}/kg
• Recommendation: ${crop.adviceEn}`;
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

  // Intelligent language detection: explicit body.lang -> script detection -> farmer DB -> 'en'
  let lang = (body.lang || farmer?.preferredLanguage || 'en').toLowerCase();
  if (/[\u0900-\u097F]/.test(rawText)) lang = 'hi';
  else if (/[\u0B80-\u0BFF]/.test(rawText)) lang = 'ta';

  const farmerName = farmer?.name || (rawFarmerId === 'FARMER-001' ? 'Ramesh Chandra' : 'Farmer');

  const upper = rawText.toUpperCase();
  const detectedCrop = detectCrop(rawText);

  let replyText = '';

  const isExplicitAllCrops =
    /\b(ALL|COMPARE|LIST|CATALOG|COMMODITIES|RATES)\b/i.test(upper) ||
    rawText.includes('அனைத்து') ||
    rawText.includes('सभी');

  const isPriceQuery =
    upper === '1' ||
    upper.startsWith('1:') ||
    upper.startsWith('1.') ||
    /\b(PRICE|PRICES|MANDI|RATE|RATES|BHAV|COST|VALUE)\b/i.test(upper) ||
    rawText.includes('விலை') ||
    rawText.includes('भाव') ||
    rawText.includes('दाम');

  const isLots =
    upper === '2' ||
    upper.startsWith('2:') ||
    upper.startsWith('2.') ||
    /\b(LOT|LOTS|MY LOTS|POD|STORAGE|HOLDING)\b/i.test(upper) ||
    rawText.includes('லாட்') ||
    rawText.includes('லார்ட்') ||
    rawText.includes('लॉट');

  const isTelemetry =
    /\b(TEMP|TEMPERATURE|COOL|COLD|HUMIDITY|SENSOR|SOLAR|BATTERY)\b/i.test(upper) ||
    rawText.includes('வெப்பநிலை') ||
    rawText.includes('तापमान') ||
    rawText.includes('ठंडा');

  const isReceipt =
    upper === '3' ||
    upper.startsWith('3:') ||
    upper.startsWith('3.') ||
    /\b(RECEIPT|PAY|PAYMENT|PAYMENTS|UPI|MONEY|WATERFALL|UTR|SETTLE|SETTLEMENT|BANK)\b/i.test(upper) ||
    rawText.includes('ரசீது') ||
    rawText.includes('பணம்') ||
    rawText.includes('रसीद') ||
    rawText.includes('भुगतान') ||
    rawText.includes('पैसा');

  const isAdvance =
    /\b(ADVANCE|LOAN|CREDIT|BORROW)\b/i.test(upper) ||
    rawText.includes('முன்பணம்') ||
    rawText.includes('अग्रिम') ||
    rawText.includes('कर्ज');

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

  // Multi-crop comparison
  if (isExplicitAllCrops && (isPriceQuery || upper.length < 20)) {
    if (lang === 'ta') {
      replyText = `📊 அனைத்து பயிர்களின் இன்றைய சந்தை நிலவரம்:
• 🍅 தக்காளி: மண்டி ₹9 → கொள்முதல் ₹14 (HOLD)
• 🧅 வெங்காயம்: மண்டி ₹15 → கொள்முதல் ₹22 (SELL)
• 🥔 உருளை: மண்டி ₹12 → கொள்முதல் ₹17 (HOLD)
• 🌶️ மிளகாய்: மண்டி ₹28 → கொள்முதல் ₹40 (SELL)

விரிவான ஆலோசனைக்கு "வெங்காயம்", "உருளை" அல்லது "மிளகாய்" என அனுப்பவும்.`;
    } else if (lang === 'hi') {
      replyText = `📊 सभी प्रमुख फसलों के आज के मंडी व खरीदार भाव:
• 🍅 टमाटर: मंडी ₹9 → खरीदार ₹14/किग्रा (HOLD)
• 🧅 प्याज़: मंडी ₹15 → खरीदार ₹22/किग्रा (SELL)
• 🥔 आलू: मंडी ₹12 → खरीदार ₹17/किग्रा (HOLD)
• 🌶️ मिर्च: मंडी ₹28 → खरीदार ₹40/किग्रा (SELL)

विस्तृत रिपोर्ट के लिए किसी भी फसल का नाम (उदा. "प्याज़", "आलू") लिखकर भेजें।`;
    } else {
      replyText = `📊 Horticultural Commodities Today (Mandi vs Buyer Bid):
• 🍅 Tomato: Mandi ₹9/kg → Buyer Bid ₹14/kg (HOLD in Pod)
• 🧅 Onion: Mandi ₹15/kg → Buyer Bid ₹22/kg (SELL NOW)
• 🥔 Potato: Mandi ₹12/kg → Buyer Bid ₹17/kg (HOLD in Pod)
• 🌶️ Chilli: Mandi ₹28/kg → Buyer Bid ₹40/kg (SELL NOW)

Reply with any crop name (e.g. "ONION", "POTATO", "CHILLI") for full advice!`;
    }
  }
  // Crop-specific price lookup OR general price button
  else if (detectedCrop && (isPriceQuery || !isLots && !isReceipt && !isTelemetry && !isAdvance)) {
    replyText = formatCropPriceReply(detectedCrop, lang);
  } else if (isPriceQuery) {
    // Default to tomato if no specific crop mentioned
    replyText = formatCropPriceReply(CROP_CATALOG.tomato, lang);
  }
  // Pod Telemetry questions
  else if (isTelemetry) {
    if (lang === 'ta') {
      replyText = `❄️ கூல் பாட் #01 நேரலை விவரம்:
• வெப்பநிலை: 11.5°C (இலக்கு: 11.5°C)
• ஈரப்பதம்: 88%
• வெப்ப சேமிப்பு பேக்கப்: 94%
• சூரிய ஒளி உற்பத்தி: 3.8 kW
உங்கள் விளைச்சல் வெளிப்புற 32°C வெப்பத்திலிருந்து பாதுகாப்பாக உள்ளது.`;
    } else if (lang === 'hi') {
      replyText = `❄️ कूल पॉड #01 लाइव स्थिति:
• तापमान: 11.5°C (लक्ष्य: 11.5°C)
• आर्द्रता: 88%
• थर्मल स्टोरेज बैकअप: 94% चार्ज
• सोलर उत्पादन: 3.8 kW सक्रिय
आपकी फसल बाहर की 32°C गर्मी से पूरी तरह सुरक्षित है।`;
    } else {
      replyText = `❄️ Cool Pod #01 Sensor Telemetry:
• Storage Temperature: 11.5°C (Setpoint: 11.5°C)
• Relative Humidity: 88%
• Thermal Storage Battery: 94% backup charge
• Solar Output: 3.8 kW active
Your harvest is fully shielded from outdoor field heat (32°C).`;
    }
  }
  // Lots inquiry
  else if (isLots) {
    if (lang === 'ta') {
      replyText = 'லாட் #214: 120 கிலோ தரம் A தக்காளிகள் குளிர்பதன அறையில் 14 மணிநேரமாக சேமிப்பில் உள்ளது. வாங்குபவர் பொருத்தம்: 78%.';
    } else if (lang === 'hi') {
      replyText = 'लॉट #214: 120 किग्रा ग्रेड A टमाटर कूल पॉड में 14 घंटे से सुरक्षित। खरीदार मिलान: 78%।';
    } else {
      replyText = 'Lot #214: 120 kg Grade A Hybrid Tomatoes in Cool Pod #01 at 11.5°C (14 hours elapsed). Buyer match score: 78% (Annapurna Kirana Network).';
    }
  }
  // Advances inquiry
  else if (isAdvance) {
    if (lang === 'ta') {
      replyText = `💰 பயிர் ஆதரவு முன்பணம் (Advance):
உங்கள் லாட் #214 க்கு ₹840.00 (60%) வரை 0% வட்டியில் உடனடி முன்பணம் பெறலாம். ஃபார்மர் ஆப் 'Money' பிரிவில் சென்று UPI மூலம் 30 வினாடிகளில் பெறவும்.`;
    } else if (lang === 'hi') {
      replyText = `💰 फसल-समर्थित अग्रिम (Advance):
आपके लॉट #214 के विरुद्ध ₹840.00 (60%) का तत्काल ब्याज-मुक्त अग्रिम उपलब्ध है। किसान ऐप के "Money" टैब में जाकर तुरंत अपने UPI खाते में प्राप्त करें।`;
    } else {
      replyText = `💰 Produce-Backed Instant Advance:
You can disburse up to ₹840.00 (60% value of Lot #214) at 0% interest while your produce stays in Cool Pod #01. Open the "Money" tab in the Farmer App to disburse directly to your UPI ID in 30 seconds.`;
    }
  }
  // Receipts & Payouts inquiry
  else if (isReceipt) {
    if (lang === 'ta') {
      replyText = 'லாட் #198 ரசீது: நுகர்வோர் விலை ₹30/கிலோ. விற்பனை விலை ₹13.50/கிலோ. ஹப் கட்டணம் ₹1.9/கிலோ. நிகர தொகை ₹1,159.50 UPI மூலம் செலுத்தப்பட்டது.';
    } else if (lang === 'hi') {
      replyText = 'लॉट #198 रसीद: ग्राहक दर ₹30/किग्रा। विक्रय मूल्य ₹13.50/किग्रा। हब शुल्क ₹1.9/किग्रा। ₹1,159.50 यूपीआई से 24 घंटे में भुगतान संपन्न।';
    } else {
      replyText = 'Receipt for Lot #198: Consumer price ₹30/kg. Sale price ₹13.50/kg. Hub fee ₹1.9/kg. Net ₹1,159.50 transferred via UPI (UTR: FGH-UPI-8841).';
    }
  }
  // Sell vs Hold decisions
  else if (isDecision) {
    if (detectedCrop?.id === 'onion') {
      replyText = detectedCrop.adviceEn;
    } else {
      if (lang === 'ta') {
        replyText = 'முடிவு ஆலோசனை: இன்றைய ₹9 மண்டி விலையுடன் ஒப்பிடும்போது ₹14 சிறந்த விலையாகும். நாளை ₹14.50-₹15 வரை உயர வாய்ப்புள்ளதால் 1 நாள் வைத்திருப்பது சிறந்தது.';
      } else if (lang === 'hi') {
        replyText = 'निर्णय सलाह: वर्तमान बोली ₹14/किग्रा (मंडी भाव ₹9) है। हमारे पूर्वानुमान के अनुसार कल ₹14.50-₹15 की मांग रहेगी, अतः 1 दिन होल्ड करना लाभदायक है।';
      } else {
        replyText = 'Decision Advisory: Current buyer bid of ₹14.00/kg beats mandi price (₹9.00/kg). Forecast predicts peak demand at ₹14.50–₹15.00/kg tomorrow afternoon, so holding in Cool Pod is recommended.';
      }
    }
  }
  // Friendly greeting
  else if (isGreeting) {
    if (lang === 'ta') {
      replyText = `வணக்கம் ${farmerName}! ஃபார்ம்கேட் ஹப் நேரலை சேவைக்கு வரவேற்கிறோம்.
1️⃣ PRICE - தக்காளி, வெங்காயம், உருளை அல்லது மிளகாய் விலை அறிய
2️⃣ LOTS - கூல் பாட் லாட் நிலை
3️⃣ RECEIPT - UPI கட்டண ரசீது
அல்லது உங்கள் கேள்வி எதுவானாலும் தட்டச்சு செய்யவும்!`;
    } else if (lang === 'hi') {
      replyText = `नमस्ते ${farmerName} जी! फार्मगेट हब में आपका स्वागत है।
1️⃣ PRICE - टमाटर, प्याज़, आलू या मिर्च के भाव
2️⃣ LOTS - कूल पॉड में लॉट स्थिति
3️⃣ RECEIPT - यूपीआई भुगतान रसीद
या किसी भी फसल का नाम लिखकर तुरंत भाव जानें!`;
    } else {
      replyText = `Namaste ${farmerName}! Welcome to FarmGate Hub WhatsApp Assistant.
1️⃣ PRICE - Mandi vs buyer bids (Tomato, Onion, Potato, Chilli)
2️⃣ LOTS - Real-time Cool Pod lot status
3️⃣ RECEIPT - UPI settlement breakdown
Or ask any question about crop prices, cooling, or instant advances!`;
    }
  }
  // Contextual fallback with active lot context & crop guidance
  else {
    if (lang === 'ta') {
      replyText = `செய்தி கிடைத்தது ("${rawText}"): உங்கள் லாட் #214 கூல் பாலில் 11.5°C இல் பாதுகாப்பாக உள்ளது.
• தக்காளி, வெங்காயம், உருளை அல்லது மிளகாய் விலைக்கு அவற்றின் பெயரை அனுப்பவும்.
• லாட் விவரங்களுக்கு "LOTS" அல்லது ரசீதுக்கு "RECEIPT" என அனுப்பவும்.`;
    } else if (lang === 'hi') {
      replyText = `संदेश प्राप्त हुआ ("${rawText}"): आपका लॉट #214 कूल पॉड #01 में 11.5°C पर सुरक्षित है।
• टमाटर, प्याज़, आलू या मिर्च के भाव जानने के लिए फसल का नाम लिखें।
• लॉट की स्थिति के लिए "LOTS" या रसीद के लिए "RECEIPT" लिखें।`;
    } else {
      replyText = `Received: "${rawText}". Your Lot #214 is safe in Cool Pod #01 at 11.5°C.
• For crop prices, type "ONION", "POTATO", "CHILLI", or "TOMATO".
• For pod lots type "LOTS", or for UPI payout details type "RECEIPT".`;
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

// Delete all messages for a farmer (New Chat / Clear Chat)
channelsRouter.delete('/whatsapp/messages', async (c) => {
  const rawFarmerId = c.req.query('farmerId') || 'FARMER-001';
  const normalizedId = normalizeFarmerId(rawFarmerId);

  db.delete(schema.channelMessages)
    .where(
      or(
        eq(schema.channelMessages.farmerId, rawFarmerId),
        eq(schema.channelMessages.farmerId, normalizedId)
      )
    )
    .run();

  return c.json({ success: true, message: 'Chat cleared' });
});

// Delete an individual message by ID
channelsRouter.delete('/whatsapp/messages/:id', async (c) => {
  const msgId = c.req.param('id');
  db.delete(schema.channelMessages)
    .where(eq(schema.channelMessages.id, msgId))
    .run();

  return c.json({ success: true, message: 'Message deleted' });
});

// Aliases
channelsRouter.delete('/threads', async (c) => {
  const rawFarmerId = c.req.query('farmerId') || 'FARMER-001';
  const normalizedId = normalizeFarmerId(rawFarmerId);
  db.delete(schema.channelMessages)
    .where(or(eq(schema.channelMessages.farmerId, rawFarmerId), eq(schema.channelMessages.farmerId, normalizedId)))
    .run();
  return c.json({ success: true });
});
