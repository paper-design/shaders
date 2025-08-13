'use client';

import { useRef, useState } from 'react';

export function Input() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative mt-6 w-full max-w-[580px]">
      <input
        type="text"
        readOnly
        id="npm-install"
        ref={inputRef}
        value="npm i @paper-design/shaders-react"
        onClick={() => inputRef.current?.select()}
        className="outline-blue h-12 w-full truncate rounded-lg border border-neutral-300 pl-4 pr-[48px] font-mono text-sm sm:h-14 sm:pl-6 md:text-base"
      />
      <button
        className="absolute right-0 top-0 h-full w-10 text-neutral-500"
        onClick={() => {
          navigator.clipboard.writeText('npm i @paper-design/shaders-react');
          setCopied(true);
          inputRef.current?.select();

          setTimeout(() => {
            setCopied(false);
          }, 1000);
        }}
      >
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      </button>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
