import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from '../utils/translations';

const LANG_KEY = 'pw-language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && translations[saved]) return saved;
    } catch (_) {}
    return 'English';
  });

  const changeLanguage = useCallback((lang) => {
    if (!translations[lang]) return;
    setLanguage(lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  }, []);

  const t = useCallback((key) => {
    const dict = translations[language] || translations['English'];
    return dict[key] ?? translations['English'][key] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
