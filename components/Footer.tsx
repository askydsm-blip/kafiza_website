import { useLanguage } from './LanguageContext';
import en from '../i18n/en.json';
import ptBR from '../i18n/pt-BR.json';
import SocialLinks from './SocialLinks';

const translations: any = { en, 'pt-BR': ptBR };

export default function Footer() {
  const { lang } = useLanguage();
  const t = translations[lang].footer;
  return (
    <footer className="border-t pt-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          © {new Date().getFullYear()} Kafiza — connecting roasters & farmers
        </div>
        <div>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}