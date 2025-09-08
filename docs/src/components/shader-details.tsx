'use client';

import { ShaderDef, ParamOption } from '../shader-defs/shader-def-types';
import { CopyButton } from './copy-button';
import { hslToHex } from '@/helpers/color-utils';

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
    return `${key}={${JSON.stringify(value)}}`;
  }
  if (typeof value === 'object') {
    return `${key}={${JSON.stringify(value)}}`;
  }

  return `${key}={${JSON.stringify(value)}}`;
};

export function ShaderDetails({
  shaderDef,
  currentParams,
}: {
  shaderDef: ShaderDef;
  currentParams: Record<string, unknown>;
}) {
  const componentName = shaderDef.name.replace(/ /g, '');

  const installationCode = 'npm i @paper-design/shaders-react';

  const code = `import { ${componentName} } from '@paper-design/shaders-react';

<${componentName}
  style={{ height: 500 }}
  ${Object.entries(currentParams)
    .filter(([key]) => !['worldWidth', 'worldHeight', 'originX', 'originY'].includes(key))
    .map(([key, value]) => {
      const isColor = shaderDef.params.find((p) => p.name === key && p.isColor);
      if (!isColor) {
        return formatJsxAttribute(key, value);
      } else if (typeof value === 'string') {
        return formatJsxAttribute(key, hslToHex(value));
      } else if (Array.isArray(value)) {
        return formatJsxAttribute(
          key,
          value.map((v) => hslToHex(v))
        );
      }
    })
    .join('\n  ')}
/>
`;

  return (
    <div className="mt-24 flex w-full flex-col gap-32 md:mt-40 [&>section]:flex [&>section]:flex-col [&>section]:gap-16">
      <section>
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-medium lowercase">Installation</h2>
          <CopyButton
            className="-mt-14 -mb-16 size-32 rounded-md outline-0 outline-focus transition-colors hover:bg-backplate-1 focus-visible:outline-2 active:bg-backplate-2 squircle:rounded-lg"
            getText={() => installationCode}
          />
        </div>
        <pre className="no-scrollbar w-full overflow-x-auto rounded-xl bg-backplate-1 p-24 text-code squircle:rounded-2xl">
          {installationCode}
        </pre>
      </section>

      <section>
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-medium lowercase">Code</h2>
          <CopyButton
            className="-mt-14 -mb-16 size-32 rounded-md outline-0 outline-focus transition-colors hover:bg-backplate-1 focus-visible:outline-2 active:bg-backplate-2 squircle:rounded-lg"
            getText={() => code}
          />
        </div>
        <div className="flex flex-col gap-8">
          <pre className="overflow-x-auto rounded-xl bg-backplate-1 p-24 text-code squircle:rounded-2xl">{code}</pre>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-16">
          <h2 className="text-2xl font-medium lowercase">Props</h2>
          <div className="overflow-x-auto rounded-xl bg-backplate-1 squircle:rounded-2xl">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-backplate-2">
                  <th className="px-16 py-12 text-left font-medium lowercase">Name</th>
                  <th className="px-16 py-12 text-left font-medium lowercase">Description</th>
                  <th className="px-16 py-12 text-left font-medium lowercase">Type</th>
                  <th className="px-16 py-12 text-left font-medium lowercase">Values</th>
                </tr>
              </thead>
              <tbody>
                {shaderDef.params.map((param) => (
                  <tr key={param.name} className="border-table-border not-last:border-b">
                    <td className="px-16 py-12 font-medium">{param.name}</td>

                    <td className="min-w-[240px] px-16 py-12 text-current/70">{param.description}</td>

                    <td className="px-16 py-12 text-sm text-current/70">
                      <code>{param.type}</code>
                    </td>

                    <td className="max-w-240 px-16 py-12 text-sm text-current/70">
                      {param.options && param.options.length > 0 ? (
                        typeof param.options[0] === 'string' ? (
                          <div className="text-pretty">
                            {(param.options as string[]).map((option, index) => (
                              <span key={option} className={param.type === 'boolean' ? 'whitespace-nowrap' : ''}>
                                {<span className="text-stone-400 mx-4"> | </span>}
                                <code className="font-mono">{param.type === 'enum' ? `"${option}"` : option}</code>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <ul className="space-y-4">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {shaderDef.description && (
        <section>
          <h2 className="text-2xl font-medium lowercase">Description</h2>
          <p className="text-pretty text-current/70">{shaderDef.description}</p>
        </section>
      )}
    </div>
  );
}
