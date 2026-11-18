import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, getTranslations, TranslationDict } from '@farmgate/shared';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationDict;
  speak: (text: string, langOverride?: Language) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  speechError: string | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('farmgate_lang') as Language;
    return saved === 'hi' || saved === 'ta' ? saved : 'en';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('farmgate_lang', newLang);
  };

  const t = getTranslations(lang);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string, langOverride?: Language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechError('Web Speech API is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    setSpeechError(null);

    const targetLang = langOverride || lang;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang === 'hi' ? 'hi-IN' : targetLang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95; // Slightly slower for clarity in rural mobile audio

    // Check if voice exists for Indian languages
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(utterance.lang) || v.lang.startsWith(targetLang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      setIsSpeaking(false);
      if (e.error !== 'canceled') {
        setSpeechError(t.common.unsupportedVoice);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [lang, t.common.unsupportedVoice]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        speak,
        stopSpeaking,
        isSpeaking,
        speechError,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
