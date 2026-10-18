import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import esMX from './locales/es-MX.json';

export const supportedLanguages = ['es-MX', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const languageStorageKey = 'fintecheando-language';

export function normalizeLanguage(language?: string | null): SupportedLanguage {
  return language?.toLowerCase().startsWith('en') ? 'en' : 'es-MX';
}

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'es-MX';

  try {
    const savedLanguage = window.localStorage.getItem(languageStorageKey);
    if (savedLanguage === 'en' || savedLanguage === 'es-MX') return savedLanguage;
  } catch {
    // Storage can be unavailable in private or embedded browsing contexts.
  }

  return normalizeLanguage(window.navigator.language);
}

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'es-MX': { translation: esMX },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'es-MX',
    supportedLngs: [...supportedLanguages],
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (language) => {
  const normalizedLanguage = normalizeLanguage(language);

  document.documentElement.lang = normalizedLanguage;

  try {
    window.localStorage.setItem(languageStorageKey, normalizedLanguage);
  } catch {
    // The language still changes for the current session if storage is unavailable.
  }
});

export default i18n;
