import Link from 'next/link';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from './LanguageContext';
import en from '../i18n/en.json';
import ptBR from '../i18n/pt-BR.json';

const translations: any = { en, 'pt-BR': ptBR };

export default function Navbar() {
  const { lang } = useLanguage();
  const t = translations[lang].nav;
  return (
    <nav className="w-full flex items-center justify-between px-4 md:px-6 py-3 bg-white shadow-md">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <img
            src="/Kafiza-logo.png"
            alt="Kafiza logo"
            className="h-8 md:h-12 w-auto mr-2 md:mr-3"
            style={{ maxHeight: 56, minHeight: 32 }}
          />
        </Link>
      </div>
      <div className="flex items-center space-x-3 md:space-x-6">
        <Link href="/" className="text-sm md:text-base hover:underline">{t.home}</Link>
        <Link href="/about" className="text-sm md:text-base hover:underline">{t.about}</Link>
        <Link href="/contact" className="text-sm md:text-base hover:underline">{t.contact}</Link>
        <Link href="/beta" className="text-sm md:text-base hover:underline">{t.beta}</Link>
        <LanguageToggle />
      </div>
    </nav>
  );
}