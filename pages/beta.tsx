import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmailSignupForm from '../components/EmailSignupForm';
import { useLanguage } from '../components/LanguageContext';
import en from '../i18n/en.json';
import ptBR from '../i18n/pt-BR.json';

const translations: any = { en, 'pt-BR': ptBR };

export default function Beta() {
  const { lang } = useLanguage();
  const t = translations[lang].beta;
  const formT = translations[lang].form;
  
  const seoTitle = lang === 'en' 
    ? 'Join Our Beta - Kafiza'
    : 'Participe do Beta - Kafiza';
  
  const seoDescription = lang === 'en'
    ? 'Be the first to access Kafiza and help shape the future of ethical coffee sourcing. Join our beta program today.'
    : 'Seja o primeiro a acessar a Kafiza e ajude a moldar o futuro do café ético. Participe do nosso programa beta hoje.';

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
          <p className="text-base md:text-lg text-coffee-brown mb-8 text-center max-w-2xl">{t.text}</p>
          <EmailSignupForm placeholder={t.emailPlaceholder} buttonText={t.submit} successMessage={formT.success} />
        </main>
        <Footer />
      </div>
    </>
  );
}