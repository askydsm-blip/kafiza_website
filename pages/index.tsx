import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmailSignupForm from '../components/EmailSignupForm';
import { useLanguage } from '../components/LanguageContext';
import en from '../i18n/en.json';
import ptBR from '../i18n/pt-BR.json';

const translations: any = { en, 'pt-BR': ptBR };

export default function Home() {
  const { lang } = useLanguage();
  const t = translations[lang].home;
  const formT = translations[lang].form;
  
  const seoTitle = lang === 'en' 
    ? 'Kafiza: Bridging Brazilian Coffee Culture with the World'
    : 'Kafiza: Conectando a Cultura do Café Brasileiro ao Mundo';
  
  const seoDescription = lang === 'en'
    ? 'NZ roasters struggle to access authentic, traceable Brazilian beans. Kafiza connects them directly to farmers — while sharing the deep cultural, historical, and environmental roots of Brazil\'s coffee legacy.'
    : 'Torradores na Nova Zelândia enfrentam dificuldades para acessar grãos brasileiros autênticos e rastreáveis. A Kafiza conecta-os diretamente aos produtores.';

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content="/Kafiza-logo.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content="/Kafiza-logo.png" />
        <link rel="icon" href="/Kafiza-logo.png" />
      </Head>
      <div className="min-h-screen flex flex-col bg-coffee-cream">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-cover bg-center" style={{ backgroundImage: "url('/coffee-bg.jpg')" }}>
          <h1 className="text-4xl md:text-6xl font-bold text-coffee-dark mb-4 text-center drop-shadow">{t.headline}</h1>
          <p className="text-lg md:text-2xl text-coffee-brown mb-8 text-center max-w-2xl">{t.subheadline}</p>
          <EmailSignupForm placeholder={t.emailPlaceholder} buttonText={t.cta} successMessage={formT.success} />
        </main>
        <Footer />
      </div>
    </>
  );
}