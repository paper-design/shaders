'use client';

import { useState } from 'react';
import { CopyIcon, CheckIcon } from '../icons';
import { ShaderDef, ParamOption } from '../shader-defs/shader-def-types';
import { CopyButton } from './copy-button';

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

export function ShaderPageContent({
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
    <div className="flex w-full flex-col gap-8 [&>section]:flex [&>section]:flex-col [&>section]:gap-4">
      <section>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-medium">Installation</h2>
          <CopyButton
            className="-mt-3.5 -mb-4 size-8 rounded-md transition-colors hover:bg-cream/60 active:bg-[#E9E8E0] squircle:rounded-lg"
            text={installationCode}
          />
        </div>
        <pre className="no-scrollbar w-full overflow-x-auto rounded-2xl bg-cream/60 p-6 squircle:rounded-3xl">
          {installationCode}
        </pre>
      </section>

      <section>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-medium">Code</h2>
          <CopyButton
            className="-mt-3.5 -mb-4 size-8 rounded-md transition-colors hover:bg-cream/60 active:bg-[#E9E8E0] squircle:rounded-lg"
            text={code}
          />
        </div>
        <div className="flex flex-col gap-2">
          <pre className="overflow-x-auto rounded-2xl bg-cream/60 p-6 squircle:rounded-3xl">{code}</pre>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-medium">Props</h2>
          <div className="overflow-x-auto rounded-2xl bg-cream/60 squircle:rounded-3xl">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-[#E9E8E0]">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Values</th>
                  <th className="hidden px-4 py-3 text-left font-medium">Default</th>
                </tr>
              </thead>
              <tbody>
                {shaderDef.params.map((param) => (
                  <tr key={param.name} className="border-[#e5e4db] not-last:border-b">
                    <td className="px-4 py-3 font-medium">{param.name}</td>

                    <td className="min-w-[240px] px-4 py-3 text-stone-600">{param.description}</td>

                    <td className="px-4 py-3 text-sm text-stone-600">
                      <code>{param.type}</code>
                    </td>

                    <td className="max-w-60 px-4 py-3 text-sm text-stone-600">
                      {param.options && param.options.length > 0 ? (
                        typeof param.options[0] === 'string' ? (
                          <div className="text-pretty">
                            {(param.options as string[]).map((option, index) => (
                              <span key={option} className={param.type === 'boolean' ? 'whitespace-nowrap' : ''}>
                                {<span className="mx-1 text-stone-400"> | </span>}
                                <code className="font-mono">{param.type === 'enum' ? `"${option}"` : option}</code>
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
                        <span className="whitespace-nowrap">Hex, RGB, or HSL color</span>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-stone-600">
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
          <p className="text-pretty text-stone-600">{shaderDef.description}</p>
        </section>
      )}
    </div>
  );
}
