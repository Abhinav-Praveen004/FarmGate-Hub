import { en, TranslationDict } from './en.js';
import { hi } from './hi.js';
import { ta } from './ta.js';
import { Language } from '../types/index.js';

export * from './en.js';

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en,
  hi,
  ta,
};

export function getTranslations(lang: Language = 'en'): TranslationDict {
  return TRANSLATIONS[lang] || en;
}
