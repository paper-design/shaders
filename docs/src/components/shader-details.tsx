'use client';

import type { ReactNode } from 'react';
import { ShaderDef, ParamOption, ParamDef } from '../shader-defs/shader-def-types';
import { CopyButton } from './copy-button';
import { hslToHex } from '@/helpers/color-utils';
import { commonParams } from '@/shader-defs/common-param-def';

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
    return `${key}={[${value.map((v) => JSON.stringify(v)).join(', ')}]}`;
  }
  if (typeof value === 'object') {
    return `${key}={${JSON.stringify(value)}}`;
  }

  return `${key}={${JSON.stringify(value)}}`;
};

function PropsTable({ params }: { params: ParamDef[] }) {
  return (
    <table className="w-full text-base">
      <thead>
        <tr className="bg-backplate-2">
          <th className="px-16 py-12 text-left align-top font-medium lowercase">Name</th>
          <th className="px-16 py-12 text-left align-top font-medium lowercase">Description</th>
          <th className="px-16 py-12 text-left align-top font-medium lowercase">Type</th>
          <th className="px-16 py-12 text-left align-top font-medium lowercase">Values</th>
        </tr>
      </thead>
      <tbody>
        {params.map((param) => (
          // The approach for column sizing and alignment is that description is w-full,
          // and everything else has a min width to not be crushed by the description
          <tr key={param.name} className="border-table-border not-last:border-b">
            {/* "noiseFrequency" is the longest name (116px + 32px padding = 148px)
             We go a little smaller on mobile to have less whitespace ("maxPixelCount" = 140px) */}
            <td className="min-w-140 px-16 py-12 align-top font-medium sm:min-w-148">{param.name}</td>

            <td className="w-full min-w-240 px-16 py-12 align-top text-pretty text-current/70">{param.description}</td>

            {/* "number | string" is the longest most common type (118px + 32px padding = 150px)
            There are a few "HTMLImageElement | string ", which are purposely not aligned because too wide */}
            <td className="min-w-150 px-16 py-12 align-top text-sm whitespace-nowrap text-current/70">
              <code>{param.type}</code>
            </td>

            <td className="min-w-240 px-16 py-12 align-top text-sm text-current/70">
              {param.options && param.options.length > 0 ? (
                typeof param.options[0] === 'string' ? (
                  <div className="flex flex-wrap text-pretty">
                    {(param.options as string[]).map((option) => (
                      <span
                        key={option}
                        className={param.type === 'boolean' || param.type === 'enum' ? 'whitespace-nowrap' : ''}
                      >
                        {<span className="text-stone-400 mx-4"> | </span>}
                        <code className="font-mono">{param.type === 'enum' ? `"${option}"` : option}</code>
                      </span>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {(param.options as ParamOption[]).map((option) => (
                      <li key={option.name}>
                        <code className="font-mono">{param.type === 'enum' ? `"${option.name}"` : option.name}</code>{' '}
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
              ) : param.name === 'image' ? (
                <span className="whitespace-nowrap">Image object or URL</span>
              ) : (
                <span className="text-current/40">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ShaderDetails({
  shaderDef,
  currentParams,
  notes,
  codeSampleImageName,
}: {
  shaderDef: ShaderDef;
  currentParams: Record<string, unknown>;
  notes?: ReactNode;
  codeSampleImageName?: string;
}) {
  const componentName = shaderDef.name.replace(/ /g, '');

  const installationCode = 'npm i @paper-design/shaders-react';
  const image = codeSampleImageName
    ? `https://shaders.paper.design/${codeSampleImageName}`
    : 'https://paper.design/flowers.webp';

  const code = `import { ${componentName} } from '@paper-design/shaders-react';

<${componentName}
  width={1280}
  height={720}${shaderDef.params.find((p) => p.name === 'image') ? `\n  image="${image}"` : ''}
  ${Object.entries(currentParams)
    .filter(([key, value]) => {
      if (['offsetX', 'offsetY', 'rotation'].includes(key) && value === 0) {
        return false;
      }
      if (key === 'scale' && value === 1) {
        return false;
      }
      return true;
    })
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
  const commonPropNames = Object.keys(commonParams);
  const shaderProps = shaderDef.params.filter((p) => !commonPropNames.includes(p.name));
  const commonProps = shaderDef.params.filter((p) => commonPropNames.includes(p.name));

  return (
    <div className="mt-24 flex w-full flex-col gap-32 md:mt-40 [&_a]:link [&>section]:flex [&>section]:flex-col [&>section]:gap-16">
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
          <pre className="custom-scrollbar overflow-x-auto rounded-xl bg-backplate-1 p-24 text-code squircle:rounded-2xl">
            {code}
          </pre>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-16">
          <h2 className="text-2xl font-medium lowercase">Shader Props</h2>
          <div className="custom-scrollbar overflow-x-auto rounded-xl bg-backplate-1 squircle:rounded-2xl">
            <PropsTable params={shaderProps} />
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-16">
          <h2 className="text-2xl font-medium lowercase">Common Props</h2>
          <div className="custom-scrollbar overflow-x-auto rounded-xl bg-backplate-1 squircle:rounded-2xl">
            <PropsTable params={commonProps} />
          </div>
        </div>
      </section>

      {shaderDef.description && (
        <section>
          <h2 className="text-2xl font-medium lowercase">Description</h2>
          <p className="text-pretty text-current/70">{shaderDef.description}</p>
        </section>
      )}

      {notes && (
        <section>
          <h2 className="text-2xl font-medium lowercase">Notes</h2>
          <p className="text-pretty text-current/70">{notes}</p>
        </section>
      )}
    </div>
  );
}
