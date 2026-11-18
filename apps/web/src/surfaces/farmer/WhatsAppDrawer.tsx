import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDemo } from '../../context/DemoContext';
import { useWhatsAppMessages, useSendWhatsAppMessage } from '../../api/client';
import { Badge } from '@farmgate/ui';
import {
  MessageSquare,
  Send,
  X,
  CheckCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface WhatsAppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppDrawer: React.FC<WhatsAppDrawerProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const { activePersona } = useDemo();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useWhatsAppMessages(activePersona.id);
  const sendMessage = useSendWhatsAppMessage();

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    sendMessage.mutate({
      farmerId: activePersona.id,
      body: text.trim(),
      lang,
    });
    setInputText('');
  };

  const quickReplies = [
    { label: '1: PRICE', command: 'PRICE' },
    { label: '2: LOTS', command: 'LOTS' },
    { label: '3: RECEIPT', command: 'RECEIPT' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-fadeIn">
      <div className="bg-[#efeae2] w-full max-w-md h-full flex flex-col shadow-2xl border-l border-[#d1d7db] animate-slideLeft">
        {/* WhatsApp Header */}
        <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-serif font-bold text-white text-base">
                FH
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-[#075e54]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">FarmGate Hub Bot</span>
                <ShieldCheck className="w-3.5 h-3.5 text-green-300" />
              </div>
              <span className="text-[11px] text-green-100 flex items-center gap-1">
                <span>online</span> • <Badge variant="simulated">Simulated Bot</Badge>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Chat Area */}
        <div
          tabIndex={0}
          role="region"
          aria-label="WhatsApp chat history"
          className="flex-1 p-4 overflow-y-auto space-y-3 focus:outline-none"
        >
          {/* Welcome Message */}
          <div className="flex justify-start">
            <div className="bg-white text-[#111b21] rounded-lg rounded-tl-none p-3.5 shadow-sm max-w-[85%] text-xs space-y-2 border border-black/5">
              <p className="font-bold text-[#075e54]">
                {lang === 'hi'
                  ? `नमस्ते ${activePersona.name} जी! फार्मगेट हब में आपका स्वागत है।`
                  : lang === 'ta'
                  ? `வணக்கம் ${activePersona.name}! ஃபார்ம்கேட் ஹப்பிற்கு வரவேற்கிறோம்.`
                  : `Namaste ${activePersona.name}! Welcome to FarmGate Hub Alerts.`}
              </p>
              <p className="text-[#111b21] leading-relaxed">
                {lang === 'hi'
                  ? 'तुरंत जानकारी के लिए नीचे दिए गए बटन दबाएं या लिखें:'
                  : lang === 'ta'
                  ? 'உடனடி தகவலுக்கு கீழே உள்ள பொத்தான்களை அழுத்தவும்:'
                  : 'Tap a quick reply button below or type a message:'}
              </p>
              <div className="font-mono text-[11px] text-[#54656f] bg-[#f0f2f5] p-2 rounded border border-black/5">
                1: PRICE • 2: LOTS • 3: RECEIPT
              </div>
              <div className="flex justify-end items-center gap-1 text-[10px] text-[#667781] pt-1">
                <span>10:00 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Messages from API */}
          {messages?.map((msg) => {
            const isFarmer = msg.sender === 'FARMER';
            return (
              <div
                key={msg.id}
                className={`flex ${isFarmer ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg p-3 shadow-sm max-w-[85%] text-xs space-y-1 ${
                    isFarmer
                      ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                      : 'bg-white text-[#111b21] rounded-tl-none border border-black/5'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed text-[#111b21]">{msg.body}</p>
                  <div className="flex justify-end items-center gap-1 text-[10px] text-[#667781] pt-0.5">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isFarmer && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Pills */}
        <div className="p-2.5 bg-[#f0f2f5] border-t border-[#d1d7db] flex gap-2 overflow-x-auto scrollbar-none">
          {quickReplies.map((qr) => (
            <button
              key={qr.command}
              onClick={() => handleSend(qr.command)}
              disabled={sendMessage.isPending}
              className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 border border-[#075e54]/30 text-[#075e54] text-xs font-semibold rounded-full shrink-0 shadow-xs transition-all active:scale-95"
            >
              {qr.label}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-[#f0f2f5] border-t border-[#d1d7db] flex items-center gap-2">
          <input
            type="text"
            placeholder={t.channels.typeCommandHint}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 bg-white border border-[#d1d7db] rounded-full px-4 py-2.5 text-xs text-[#111b21] placeholder-[#667781] focus:outline-none focus:ring-1 focus:ring-[#075e54]"
          />
          <button
            onClick={() => handleSend()}
            disabled={sendMessage.isPending || !inputText.trim()}
            className="w-10 h-10 rounded-full bg-[#075e54] text-white flex items-center justify-center hover:bg-[#128c7e] transition-colors disabled:opacity-50 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
