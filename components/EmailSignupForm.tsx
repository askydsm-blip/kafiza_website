import { useState } from 'react';

interface EmailSignupFormProps {
  placeholder: string;
  buttonText: string;
  successMessage?: string;
}

export default function EmailSignupForm({ placeholder, buttonText, successMessage }: EmailSignupFormProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setSubmitted(true);
    // TODO: Integrate with backend or Mailchimp
  };

  if (submitted) {
    return (
      <div className="text-center">
        <p className="text-green-700 text-lg font-medium">{successMessage || 'Thank you for signing up!'}</p>
        <p className="text-coffee-brown text-sm mt-1">We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-center w-full max-w-md mx-auto">
      <div className="flex-1 w-full">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={placeholder}
          className="rounded px-4 py-3 border w-full focus:outline-none focus:ring-2 focus:ring-coffee-dark"
        />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
      <button 
        type="submit" 
        className="bg-coffee-dark text-white rounded px-6 py-3 shadow hover:bg-coffee-brown transition-colors w-full md:w-auto font-medium"
      >
        {buttonText}
      </button>
    </form>
  );
}