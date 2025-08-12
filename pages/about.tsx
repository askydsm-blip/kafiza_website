import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../components/LanguageContext';
import en from '../i18n/en.json';
import ptBR from '../i18n/pt-BR.json';

const translations: any = { en, 'pt-BR': ptBR };

export default function About() {
  const { lang } = useLanguage();
  const t = translations[lang].about;
  
  const seoTitle = lang === 'en' 
    ? 'Our Story - Kafiza: A Cultural Bridge Brewed from Data, Heritage & Purpose'
    : 'Nossa História - Kafiza: Uma Ponte Cultural Feita de Dados, Herança e Propósito';
  
  const seoDescription = lang === 'en'
    ? 'Kafiza was born from a personal journey — from the coffee-growing soul of Brazil to the specialty roaster scene of New Zealand. Learn about our mission to globalize Brazilian coffee culture.'
    : 'A Kafiza nasceu de uma jornada pessoal — da alma cafeeira do Brasil à cena de torrefação especial da Nova Zelândia. Conheça nossa missão.';

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content="/Kafiza-logo.png" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/Kafiza-logo.png" />
      </Head>
      <div className="min-h-screen flex flex-col bg-coffee-cream">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <h1 className="text-3xl md:text-5xl font-bold text-coffee-dark mb-6 text-center">{t.header}</h1>
          <div className="text-base md:text-lg text-coffee-brown max-w-2xl whitespace-pre-line text-center">{t.body}</div>
        </main>
        <Footer />
      </div>
    </>
  );
}