import React from "react";

const SocialLinks: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <a
        href="https://www.instagram.com/kafiza_net"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Kafiza on Instagram"
        title="Instagram — Kafiza"
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
      >
        <span className="sr-only">Instagram</span>
        {/* Instagram SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.4"/>
          <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.4"/>
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
        </svg>
      </a>

      <a
        href="https://www.linkedin.com/company/kafiza"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Kafiza on LinkedIn"
        title="LinkedIn — Kafiza"
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
      >
        <span className="sr-only">LinkedIn</span>
        {/* LinkedIn SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M6.5 9v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="6.5" cy="6.5" r="1.2" fill="currentColor"/>
          <path d="M11 9v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M11 12.5c0-1.8 2.5-1.9 2.5 0v4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </a>

      <a
        href="https://x.com/kafiza_net"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Kafiza on X"
        title="X — Kafiza"
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
      >
        <span className="sr-only">X (Twitter)</span>
        {/* X SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M20 6.5c-.6.3-1.2.5-1.9.6.7-.4 1.2-1 1.4-1.8-.7.4-1.5.6-2.3.8C16.5 5 15.6 4.5 14.6 4.5c-1.7 0-3 1.4-3 3 0 .2 0 .4.1.6-2.5-.1-4.7-1.4-6.1-3.4-.2.4-.4.8-.4 1.3 0 1 .5 1.9 1.4 2.5-.5 0-1-.1-1.4-.4v.1c0 1.5 1 2.7 2.4 3-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3 2.3-1.1.9-2.5 1.4-4.1 1.4-.3 0-.6 0-.8-.1 1.4.9 3 1.4 4.7 1.4 5.7 0 8.8-4.8 8.8-9v-.4c.6-.5 1.1-1.2 1.5-1.9-.6.3-1.3.6-2 .7z" fill="currentColor"/>
        </svg>
      </a>
    </div>
  );
};

export default SocialLinks;
