import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_KEY, TRANSLATIONS, type Language } from './translations';

export interface I18nContextValue {
  lang: Language;
  setLang: (next: Language) => void;
  t: (key: string) => string;
  pick: (enText: string, viText?: string) => string;
  formatNumber: (value: number, fractionDigits?: number) => string;
  formatDate: (isoDate: string) => string;
}

function getInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'vi') {
      return saved;
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
  return 'en';
}

export function translateKey(lang: Language, key: string): string {
  const dict = TRANSLATIONS[lang] ?? TRANSLATIONS.en;
  if (key in dict && dict[key]) {
    return dict[key];
  }
  if (key in TRANSLATIONS.en && TRANSLATIONS.en[key]) {
    return TRANSLATIONS.en[key];
  }
  return key;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [lang, setLangState] = useState<Language>(() => initialLanguage ?? getInitialLanguage());

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = useCallback((key: string) => translateKey(lang, key), [lang]);

  const pick = useCallback(
    (enText: string, viText?: string) => {
      if (lang === 'vi' && viText && viText.trim().length > 0) {
        return viText;
      }
      return enText;
    },
    [lang]
  );

  const formatNumber = useCallback(
    (value: number, fractionDigits?: number) => {
      const locale = lang === 'vi' ? 'vi-VN' : 'en-US';
      if (typeof fractionDigits === 'number') {
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(value);
      }
      return new Intl.NumberFormat(locale).format(value);
    },
    [lang]
  );

  const formatDate = useCallback(
    (isoDate: string) => {
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
      if (!match) return isoDate;
      const [, y, m, d] = match;
      if (lang === 'vi') {
        return `${d}/${m}/${y}`;
      }
      return `${y}-${m}-${d}`;
    },
    [lang]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t, pick, formatNumber, formatDate }),
    [lang, setLang, t, pick, formatNumber, formatDate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
