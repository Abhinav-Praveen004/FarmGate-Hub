import React, { useState } from 'react';
import { Badge, Button } from '@farmgate/ui';
import { useLanguage } from '../../context/LanguageContext';
import { useDemo } from '../../context/DemoContext';
import { useWhatsAppMessages, useSendWhatsAppMessage } from '../../api/client';
import {
  MessageSquare,
  Phone,
  Send,
  Volume2,
  CheckCheck,
  ShieldCheck,
  Radio,
  RotateCcw,
  Headphones,
} from 'lucide-react';

export const ChannelsSimulator: React.FC = () => {
  const { lang, setLang, t, speak, isSpeaking, stopSpeaking } = useLanguage();
  const { activePersona } = useDemo();
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'ivr'>('whatsapp');

  // WhatsApp state
  const [whatsappInput, setWhatsappInput] = useState('');
  const { data: whatsappMessages } = useWhatsAppMessages(activePersona.id);
  const sendWhatsApp = useSendWhatsAppMessage();

  // Voice IVR state
  const [ivrCallActive, setIvrCallActive] = useState(false);
  const [ivrTranscript, setIvrTranscript] = useState<string[]>([]);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

  const handleWhatsAppSend = (text?: string) => {
    const body = text || whatsappInput;
    if (!body.trim()) return;
    sendWhatsApp.mutate({ farmerId: activePersona.id, body: body.trim() });
    setWhatsappInput('');
  };

  const startIvrCall = () => {
    setIvrCallActive(true);
    const greeting =
      lang === 'hi'
        ? 'फार्मगेट हब वॉयस सेवा में आपका स्वागत है। आज के टमाटर भाव के लिए 1 दबाएं। अपने लॉट की स्थिति जानने के लिए 2 दबाएं। ऑपरेटर से बात करने के लिए 9 दबाएं।'
        : lang === 'ta'
        ? 'ஃபார்ம்கேட் ஹப் குரல் சேவைக்கு வரவேற்கிறோம். இன்றைய தக்காளி விலைக்கு 1ஐ அழுத்தவும். உங்கள் லாட்டின் நிலையை அறிய 2ஐ அழுத்தவும். ஆபரேட்டருடன் பேச 9ஐ அழுத்தவும்.'
        : 'Welcome to FarmGate Hub Voice Advisory. Press 1 for Today\'s Price. Press 2 for Your Lots in Cool Pod. Press 9 to speak with Hub Operator Ravi.';

    setIvrTranscript([`[IVR System]: ${greeting}`]);
    speak(greeting, lang);
  };

  const handleIvrKeyPress = (key: string) => {
    setLastKeyPressed(key);
    let reply = '';

    if (key === '1') {
      reply =
        lang === 'hi'
          ? 'आज का मंडी भाव ₹9 प्रति किलो है। सत्यापित खरीदार बोली ₹14 है। सलाह: कूल पॉड में 1 दिन रखें।'
          : lang === 'ta'
          ? 'இன்றைய மண்டி விலை கிலோவுக்கு ₹9. சரிபார்க்கப்பட்ட வாங்குபவர் விலை ₹14. அறிவுரை: கூல் பாலில் 1 நாள் வைக்கவும்.'
          : 'Today\'s Mandi price is ₹9.00/kg. Verified buyer bid is ₹14.00/kg. Recommendation: Hold in Cool Pod for 1 day.';
    } else if (key === '2') {
      reply =
        lang === 'hi'
          ? 'आपका लॉट #214 कूल पॉड में 14 घंटे से सुरक्षित है। 78% खरीदार मैच मिला है।'
          : lang === 'ta'
          ? 'உங்கள் லாட் #214 கூல் பாலில் 14 மணி நேரமாக உள்ளது. 78% வாங்குபவர் பொருத்தம் கிடைத்துள்ளது.'
          : 'Your Lot #214 has been in the Cool Pod for 14 hours at 11.5°C. Matched with Annapurna Retail (78% fit).';
    } else if (key === '9') {
      reply =
        lang === 'hi'
          ? 'कृपया प्रतीक्षा करें, आपकी कॉल कोलार हब ऑपरेटर रवि शंकर को जोड़ी जा रही है...'
          : lang === 'ta'
          ? 'தயவுசெய்து காத்திருக்கவும், உங்கள் அழைப்பு கோலார் ஹப் ஆபரேட்டர் ரவி சங்கருடன் இணைக்கப்படுகிறது...'
          : 'Connecting your call to Kolar Hub Operator Ravi Shankar...';
    } else {
      reply =
        lang === 'hi'
          ? 'अमान्य विकल्प। कृपया 1, 2 या 9 दबाएं।'
          : lang === 'ta'
          ? 'தவறான தேர்வு. 1, 2 அல்லது 9ஐ அழுத்தவும்.'
          : 'Invalid choice. Please press 1, 2, or 9.';
    }

    setIvrTranscript((prev) => [...prev, `[Farmer Pressed]: ${key}`, `[IVR Response]: ${reply}`]);
    speak(reply, lang);
  };

  const endIvrCall = () => {
    stopSpeaking();
    setIvrCallActive(false);
    setIvrTranscript((prev) => [...prev, '[Call Ended]']);
  };

  return (
    <div className="min-h-screen bg-bg text-ink pb-16">
      {/* Sub-header Banner */}
      <div className="bg-surface-elevated border-b border-border py-3 px-4 sm:px-6 shadow-sm sticky top-12 z-30">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <h1 className="font-serif font-bold text-base text-ink">Rural Channels Simulator</h1>
              <Badge variant="simulated">WHATSAPP & VOICE IVR</Badge>
            </div>
            <span className="text-ink-muted hidden md:inline">| Zero-Data & Low-Literacy Channels</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <div className="flex items-center bg-surface rounded-lg p-0.5 border border-border">
              {(['en', 'hi', 'ta'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition-all ${
                    lang === l ? 'bg-accent text-white font-bold' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिन्दी' : 'தமிழ்'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Channel Switcher */}
        <div className="flex gap-2 border-b border-border pb-px">
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeChannel === 'whatsapp'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Business Bot</span>
          </button>

          <button
            onClick={() => setActiveChannel('ivr')}
            className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeChannel === 'ivr'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Toll-Free Voice IVR</span>
          </button>
        </div>

        {/* WhatsApp Channel Pane */}
        {activeChannel === 'whatsapp' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-ink">Channel Features (WhatsApp)</h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                92% of farmers in peri-urban clusters use WhatsApp daily. FarmGate Hub alerts farmers without requiring smartphone app installs or memory storage.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-surface rounded-lg border border-border">
                  <span className="font-bold text-ink block">Command: 1 or PRICE</span>
                  <span className="text-ink-muted">Returns today&apos;s mandi vs buyer bids with rule-based advice.</span>
                </div>
                <div className="p-3 bg-surface rounded-lg border border-border">
                  <span className="font-bold text-ink block">Command: 2 or LOTS</span>
                  <span className="text-ink-muted">Returns active pod lots, hours elapsed, and buyer matches.</span>
                </div>
                <div className="p-3 bg-surface rounded-lg border border-border">
                  <span className="font-bold text-ink block">Command: 3 or RECEIPT</span>
                  <span className="text-ink-muted">Returns transparent rupee waterfall summary with UTR code.</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Phone Mockup Pane (7 cols) */}
            <div className="lg:col-span-7 bg-[#e5ddd5] dark:bg-zinc-900 border border-border rounded-2xl p-4 shadow-md space-y-3 min-h-[500px] flex flex-col justify-between">
              <div className="bg-[#075e54] text-white p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    FH
                  </div>
                  <div>
                    <span className="font-bold text-xs">FarmGate Hub Alerts</span>
                    <span className="text-[10px] text-green-200 block">Verified Official Business Bot</span>
                  </div>
                </div>
                <Badge variant="simulated">SIM</Badge>
              </div>

              {/* Chat Messages */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[360px] p-2 text-xs">
                <div className="bg-white dark:bg-zinc-800 text-ink p-3 rounded-lg max-w-[85%] shadow-xs space-y-1">
                  <p className="font-bold text-[#075e54]">FarmGate Hub Automated Alert:</p>
                  <p>
                    {lang === 'hi'
                      ? `नमस्ते ${activePersona.name} जी! आपका टमाटर लॉट #214 कूल पॉड में सुरक्षित है।`
                      : lang === 'ta'
                      ? `வணக்கம் ${activePersona.name}! உங்கள் தக்காளி லாட் #214 கூல் பாலில் பாதுகாப்பாக உள்ளது.`
                      : `Namaste ${activePersona.name}! Your Lot #214 is safe in Cool Pod #01 (11.5°C).`}
                  </p>
                  <span className="text-[10px] text-ink-muted block text-right">10:00 AM • ✓✓</span>
                </div>

                {whatsappMessages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'FARMER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-[85%] shadow-xs text-xs whitespace-pre-line ${
                        msg.sender === 'FARMER'
                          ? 'bg-[#dcf8c6] dark:bg-emerald-950 text-ink'
                          : 'bg-white dark:bg-zinc-800 text-ink'
                      }`}
                    >
                      {msg.body}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Action Pills & Input */}
              <div className="space-y-2 pt-2 border-t border-black/10">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {['PRICE', 'LOTS', 'RECEIPT'].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => handleWhatsAppSend(cmd)}
                      className="px-3 py-1 bg-white hover:bg-zinc-100 rounded-full text-xs font-semibold text-ink border border-border shadow-xs shrink-0"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    aria-label="Type a WhatsApp message"
                    placeholder="Type a message (e.g. PRICE, LOTS)..."
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWhatsAppSend()}
                    className="flex-1 bg-white border border-border rounded-full px-4 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    onClick={() => handleWhatsAppSend()}
                    aria-label="Send WhatsApp message"
                    className="w-9 h-9 rounded-full bg-[#075e54] text-white flex items-center justify-center hover:bg-[#064e45]"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice IVR Channel Pane */}
        {activeChannel === 'ivr' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Feature Phone Keypad (5 cols) */}
            <div className="lg:col-span-5 bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent" />
                  <span>Feature Phone Dialer</span>
                </h2>
                <Badge variant={ivrCallActive ? 'success' : 'neutral'}>
                  {ivrCallActive ? 'CALL CONNECTED' : 'READY TO DIAL'}
                </Badge>
              </div>

              {!ivrCallActive ? (
                <Button
                  variant="primary"
                  onClick={startIvrCall}
                  className="w-full min-h-[50px] font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Dial Toll-Free (1800-FARMGATE)</span>
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-center font-mono text-xs text-accent-ink">
                    <span>Active Call: 1800-FARMGATE</span>
                    <span className="block text-[11px] text-accent font-bold mt-0.5">
                      Audio Voice Playing ({lang.toUpperCase()})
                    </span>
                  </div>

                  {/* 12-key phone keypad */}
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                      <button
                        key={k}
                        onClick={() => handleIvrKeyPress(k)}
                        className="py-3 bg-surface hover:bg-border border border-border rounded-lg font-mono text-lg font-bold text-ink active:scale-95 transition-all shadow-xs"
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={endIvrCall}
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    End Call
                  </Button>
                </div>
              )}
            </div>

            {/* Live Audio Transcript (7 cols) */}
            <div className="lg:col-span-7 bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                  Live IVR Audio Transcript
                </span>
                <span className="text-[11px] text-ink-muted">Web Speech Engine Active</span>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-border font-mono text-xs space-y-2 min-h-[300px] overflow-y-auto">
                {ivrTranscript.length === 0 ? (
                  <div className="text-ink-muted text-center pt-24">
                    Press &quot;Dial Toll-Free&quot; on the left to start the simulated automated voice call.
                  </div>
                ) : (
                  ivrTranscript.map((t, idx) => (
                    <div
                      key={idx}
                      className={`leading-relaxed ${
                        t.startsWith('[Farmer')
                          ? 'text-accent font-bold'
                          : t.startsWith('[IVR')
                          ? 'text-ink'
                          : 'text-ink-muted'
                      }`}
                    >
                      {t}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
