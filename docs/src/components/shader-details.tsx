'use client';

import { useState } from 'react';
import { CopyIcon, CheckIcon } from '../icons';

const formatJsxAttribute = (key: string, value: unknown): string => {
  if (value === true) {
    return key;
  }
  if (value === false) {
    return `${key}={false}`;
  }
  if (typeof value === 'string') {
    return `${key}="${value}"`;
  }
  if (typeof value === 'number') {
    // Format numbers with at most 2 decimal places if they have decimals
    const formattedNumber = Number.isInteger(value) ? value : parseFloat(value.toFixed(2));
    return `${key}={${formattedNumber}}`;
  }
  if (typeof value === 'object') {
    return `${key}={${JSON.stringify(value)}}`;
  }

  return `${key}={${JSON.stringify(value)}}`;
};

const CopyButton = ({ text, className = '' }: { text: string; className?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center rounded-md p-2 transition-colors hover:bg-gray-200 ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
    </button>
  );
};

export function ShaderDetails({ name, currentParams }: { name: string; currentParams: Record<string, unknown> }) {
  const code = `<${name.replace(/ /g, '')}
  ${Object.entries(currentParams)
    .map(([key, value]) => formatJsxAttribute(key, value))
    .join('\n  ')}
/>`;

  const installationCode = 'npm i @paper-design/shaders-react';

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-medium">{name}</h1>
      <div className="flex flex-col gap-4 [&>section]:flex [&>section]:flex-col [&>section]:gap-4">
        <section>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-medium">Installation</h2>
            <CopyButton text={installationCode} />
          </div>
          <pre className="w-fit overflow-x-auto rounded-lg bg-[#f7f6f0] px-4 py-4 text-base">{installationCode}</pre>
        </section>
        <section>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-medium">Code</h2>
            <CopyButton text={code} />
          </div>
          <div className="flex flex-col gap-2">
            <pre className="overflow-x-auto rounded-lg bg-[#f7f6f0] px-4 py-4 text-base">{code}</pre>
          </div>
        </section>
      </div>
    </div>
  );
}
