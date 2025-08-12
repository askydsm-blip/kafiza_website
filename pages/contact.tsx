import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SocialLinks from '../components/SocialLinks';
import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import en from '../i18n/en.json';
import ptBR from '../i18n/pt-BR.json';

const translations: any = { en, 'pt-BR': ptBR };

export default function Contact() {
  const { lang } = useLanguage();
  const t = translations[lang].contact;
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const seoTitle = lang === 'en' 
    ? 'Contact Us - Kafiza'
    : 'Entre em Contato - Kafiza';
  
  const seoDescription = lang === 'en'
    ? 'Get in touch with Kafiza. We\'d love to hear from you about Brazilian coffee culture and our mission to connect farmers with roasters.'
    : 'Entre em contato com a Kafiza. Adoraríamos ouvir você sobre a cultura do café brasileiro e nossa missão.';

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Validate name
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate email
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate message
    if (!form.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
    // TODO: Integrate with backend or email service
  };

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
          {submitted ? (
            <div className="text-center">
              <p className="text-green-700 text-lg font-medium">Thank you for reaching out!</p>
              <p className="text-coffee-brown text-sm mt-1">We'll get back to you soon.</p>
            </div>
          ) : (
            <>
              <form
                action="https://formsubmit.co/hello@kafiza.net"
                method="POST"
                className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded-lg shadow-lg"
              >
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    required
                    className="rounded px-4 py-3 border w-full focus:outline-none focus:ring-2 focus:ring-coffee-dark"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    required
                    className="rounded px-4 py-3 border w-full focus:outline-none focus:ring-2 focus:ring-coffee-dark"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    required
                    className="rounded px-4 py-3 border w-full focus:outline-none focus:ring-2 focus:ring-coffee-dark min-h-[120px] resize-vertical"
                  ></textarea>
                </div>

                <input type="hidden" name="_next" value="https://kafiza.net/thank-you" />
                <input type="text" name="_honey" style={{ display: "none" }} />
                <button 
                  type="submit"
                  className="bg-coffee-dark text-white rounded px-6 py-3 shadow hover:bg-coffee-brown transition-colors font-medium"
                >
                  Send
                </button>
              </form>
              
              {/* Social Media Section */}
              <div className="mt-8 text-center">
                <p className="text-coffee-brown text-lg mb-4">Follow us on social media:</p>
                <div className="flex justify-center">
                  <SocialLinks />
                </div>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}