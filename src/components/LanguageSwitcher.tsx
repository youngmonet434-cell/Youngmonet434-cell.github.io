import { Globe } from 'lucide-react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageSwitcher({ currentLang, onLanguageChange }: LanguageSwitcherProps) {
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
  ];

  return (
    <div className="flex items-center gap-2 bg-dark-card/90 border border-gold-300/10 px-3 py-1.5 rounded-full text-xs font-mono select-none" id="lang-switcher-container">
      <Globe className="w-3.5 h-3.5 text-gold-300 animate-pulse" />
      <div className="flex gap-1.5" id="lang-buttons-wrapper">
        {languages.map((lang) => (
          <button
            key={lang.code}
            id={`lang-btn-${lang.code}`}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              currentLang === lang.code
                ? 'bg-gold-500 text-dark-bg font-medium scale-105'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title={lang.name}
          >
            <span className="mr-1">{lang.flag}</span>
            <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
