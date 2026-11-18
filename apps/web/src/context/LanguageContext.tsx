import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Language, getTranslations, TranslationDict } from '@farmgate/shared';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationDict;
  speak: (text: string, langOverride?: Language) => void;
  stopSpeaking: () => void;
  toggleSpeak: (text: string, langOverride?: Language) => void;
  isSpeaking: boolean;
  activeVoiceName: string | null;
  speechError: string | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Intelligent voice selection algorithm:
 * Prioritizes high-fidelity Neural, Natural, Online, and regional Indian voices
 * over metallic desktop/default synthesizers.
 */
function selectBestVoice(voices: SpeechSynthesisVoice[], targetLang: Language): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const targetLangCode = targetLang === 'hi' ? 'hi-IN' : targetLang === 'ta' ? 'ta-IN' : 'en-IN';
  const prefix = targetLang; // 'hi', 'ta', 'en'

  let bestVoice: SpeechSynthesisVoice | null = null;
  let highestScore = -100;

  for (const voice of voices) {
    let score = 0;
    const name = voice.name.toLowerCase();
    const voiceLang = voice.lang.toLowerCase().replace('_', '-');

    // 1. Strict language matching - NEVER assign an English voice to Hindi or Tamil text
    if (voiceLang === targetLangCode.toLowerCase()) {
      score += 150;
    } else if (voiceLang.startsWith(prefix)) {
      score += 100;
    } else {
      continue; // Skip any voice that does not belong to this language family
    }

    // 2. High-quality neural / natural voice detection
    if (name.includes('natural') || name.includes('neural')) score += 70;
    if (name.includes('online')) score += 50;
    if (name.includes('wavenet') || name.includes('google')) score += 40;
    if (name.includes('premium') || name.includes('enhanced')) score += 35;

    // 3. Renowned natural Indian personas
    // Microsoft Edge online: Neerja, Swara, Madhur, Pallavi, Valluvar
    if (name.includes('neerja') || name.includes('swara') || name.includes('madhur') || name.includes('pallavi') || name.includes('valluvar')) score += 30;
    // Windows/Local: Heera, Ravi, Kalpana, Hemant
    if (name.includes('heera') || name.includes('ravi') || name.includes('kalpana') || name.includes('hemant')) score += 20;

    // 4. Warm natural female intonations (easier to understand over phone speakers)
    if (name.includes('female') || name.includes('zira') || name.includes('susan') || name.includes('samantha')) score += 10;

    // 5. Heavy penalty for known metallic/robotic desktop synthesizers
    if (name.includes('desktop') || name.includes('david') || name.includes('espeak')) score -= 40;

    if (score > highestScore) {
      highestScore = score;
      bestVoice = voice;
    }
  }

  return bestVoice;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('farmgate_lang') as Language;
    return saved === 'hi' || saved === 'ta' ? saved : 'en';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeVoiceName, setActiveVoiceName] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load and cache browser voices on mount and on voiceschanged event
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('farmgate_lang', newLang);
  };

  const t = getTranslations(lang);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, []);

  const speak = useCallback((text: string, langOverride?: Language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechError('Web Speech API is not supported on this browser.');
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();
    setSpeechError(null);

    const targetLang = langOverride || lang;
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Natural human voice attributes
    utterance.lang = targetLang === 'hi' ? 'hi-IN' : targetLang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.92; // Slightly relaxed, conversational pacing for high rural comprehension
    utterance.pitch = 1.02; // Warm, friendly intonation (avoids robotic monotone)
    utterance.volume = 1.0;

    // Select the best available natural/neural voice matching the language family
    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const bestVoice = selectBestVoice(currentVoices, targetLang);
    if (bestVoice) {
      utterance.voice = bestVoice;
      setActiveVoiceName(bestVoice.name);
    } else {
      setActiveVoiceName(targetLang === 'hi' ? 'Hindi Natural' : targetLang === 'ta' ? 'Tamil Natural' : 'English Natural');
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        setSpeechError(t.common.unsupportedVoice);
      }
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [lang, voices, t.common.unsupportedVoice]);

  // Watchdog interval to detect when browser finishes speaking without onend
  useEffect(() => {
    if (!isSpeaking) return;

    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          setIsSpeaking(false);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  const toggleSpeak = useCallback((text: string, langOverride?: Language) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text, langOverride);
    }
  }, [isSpeaking, stopSpeaking, speak]);

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
        toggleSpeak,
        isSpeaking,
        activeVoiceName,
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
