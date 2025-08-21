'use client';

import { ReactNode, useState } from 'react';
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
  if (Array.isArray(value)) {
    if (value.length <= 1) {
      return `${key}={${JSON.stringify(value)}}`;
    }
    const formattedArray = JSON.stringify(value, null, 2)
      .split('\n')
      .map((line, index) => (index === 0 ? line : `  ${line}`))
      .join('\n');
    return `${key}={${formattedArray}}`;
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
      className={`flex items-center justify-center rounded-md p-2 transition-colors hover:bg-[#e7e7e0] ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
    </button>
  );
};

export function ShaderDetails({
  name,
  currentParams,
  props,
  description,
}: {
  name: string;
  currentParams: Record<string, unknown>;
  props?: Record<string, ReactNode>;
  description?: ReactNode;
}) {
  const componentName = name.replace(/ /g, '');

  const code = `import { ${componentName} } from '@paper-design/shaders-react';

<${componentName}
  style={{ height: 500 }}
  ${Object.entries(currentParams)
    .filter(([key]) => !['worldWidth', 'worldHeight', 'originX', 'originY'].includes(key))
    .map(([key, value]) => formatJsxAttribute(key, value))
    .join('\n  ')}
/>
`;

  const installationCode = 'npm i @paper-design/shaders-react';

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-medium">{name}</h1>
      <div className="flex flex-col gap-5 [&>section]:flex [&>section]:flex-col [&>section]:gap-4">
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
            <pre className="overflow-x-auto rounded-lg bg-[#f7f6f0] px-4 py-4 text-sm">{code}</pre>
          </div>
        </section>
        {props && (
          <section>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-medium">Props</h2>
              <div className="flex flex-col gap-2">
                {Object.entries(props).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="font-medium">{key}</h3>
                    <div className="text-stone-600">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        {description && (
          <section>
            <h2 className="text-2xl font-medium">Description</h2>
            <p className="text-stone-600">{description}</p>
          </section>
        )}
      </div>
    </div>
  );
}
