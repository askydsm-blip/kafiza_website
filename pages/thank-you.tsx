import Link from 'next/link';

export default function ThankYou() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-8">
      <h1 className="text-3xl font-bold mb-4">Thank you for your message, Rick!</h1>
      <p className="mb-6">We've received your message and will get back to you shortly.</p>
      <Link href="/">
        <a className="text-blue-600 hover:underline">Back to Home</a>
      </Link>
    </div>
  );
}
