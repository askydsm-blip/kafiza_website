import { useLanguage } from './LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <select
      value={lang}
      onChange={e => setLang(e.target.value)}
      className="rounded px-2 py-1 border bg-white text-coffee-dark text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-coffee-dark"
      aria-label="Select language"
    >
      <option value="en">EN</option>
      <option value="pt-BR">PT-BR</option>
    </select>
  );
}