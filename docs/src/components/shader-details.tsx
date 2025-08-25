'use client';

import { useState } from 'react';
import { CopyIcon, CheckIcon } from '../icons';
import { ShaderDef, ParamOption } from '../shader-defs/shader-def-types';

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
  shaderDef,
  currentParams,
}: {
  shaderDef: ShaderDef;
  currentParams: Record<string, unknown>;
}) {
  const componentName = shaderDef.name.replace(/ /g, '');

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
    <div className="flex flex-col gap-10">
      <h1 className="text-4xl font-medium">{shaderDef.name}</h1>
      <div className="flex flex-col gap-8 [&>section]:flex [&>section]:flex-col [&>section]:gap-4">
        <section>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-medium">Installation</h2>
            <CopyButton text={installationCode} />
          </div>
          <pre className="overflow-x-auto rounded-lg bg-[#f7f6f0] px-4 py-4 text-sm sm:w-fit sm:text-base">
            {installationCode}
          </pre>
        </section>
        <section>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-medium">Code</h2>
            <CopyButton text={code} />
          </div>
          <div className="flex flex-col gap-2">
            <pre className="max-w-3xl overflow-x-auto rounded-lg bg-[#f7f6f0] px-4 py-4 text-sm">{code}</pre>
          </div>
        </section>
        <section>
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-medium">Props</h2>
            <div className="max-w-3xl overflow-x-auto rounded-lg border border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="border-b border-stone-200 px-3 py-2 text-left font-medium">Name</th>
                    <th className="border-b border-stone-200 px-3 py-2 text-left font-medium">Description</th>
                    <th className="border-b border-stone-200 px-3 py-2 text-left font-medium">Type</th>
                    <th className="border-b border-stone-200 px-3 py-2 text-left font-medium">Values</th>
                    <th className="hidden border-b border-stone-200 px-3 py-2 text-left font-medium">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {shaderDef.params.map((param) => (
                    <tr key={param.name} className="border-b border-stone-100 last:border-b-0">
                      <td className="px-3 py-3 font-medium text-stone-700">{param.name}</td>
                      <td className="px-3 py-3 text-stone-600">{param.description}</td>
                      <td className="px-3 py-3 text-stone-600">
                        <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">{param.type}</code>
                      </td>
                      <td className="max-w-60 px-3 py-3 text-xs text-stone-600">
                        {param.options && param.options.length > 0 ? (
                          typeof param.options[0] === 'string' ? (
                            <div className="text-pretty">
                              {(param.options as string[]).map((option, index) => (
                                <span key={option} className={param.type === 'boolean' ? 'whitespace-nowrap' : ''}>
                                  <code className="font-mono">{param.type === 'enum' ? `"${option}"` : option}</code>
                                  {index < param.options!.length - 1 && (
                                    <span className="mx-1 text-stone-300"> | </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <ul className="space-y-1">
                              {(param.options as ParamOption[]).map((option) => (
                                <li key={option.name}>
                                  <code className="font-mono">
                                    {param.type === 'enum' ? `"${option.name}"` : option.name}
                                  </code>{' '}
                                  <span className="text-stone-400">-</span> {option.description}
                                </li>
                              ))}
                            </ul>
                          )
                        ) : param.min !== undefined && param.max !== undefined ? (
                          <>
                            <span className="whitespace-nowrap">
                              <span className="font-mono">{param.min}</span>
                              {' to '}
                              <span className="font-mono">{param.max}</span>
                            </span>
                            {param.step === 1 && ' (integer)'}
                          </>
                        ) : param.isColor ? (
                          <span className="whitespace-nowrap">CSS color</span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                      <td className="hidden px-3 py-3 text-stone-600">
                        <span className="font-mono text-xs">{JSON.stringify(param.defaultValue)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {shaderDef.description && (
          <section>
            <h2 className="text-2xl font-medium">Description</h2>
            <p className="max-w-3xl text-pretty text-stone-600">{shaderDef.description}</p>
          </section>
        )}
      </div>
    </div>
  );
}
