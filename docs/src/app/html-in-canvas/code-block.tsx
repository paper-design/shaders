'use client';

import { CopyButton } from '@/components/copy-button';
import { highlightJsx } from '@/helpers/highlight-code';

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      className="syntax-highlight rounded-xl bg-backplate-1 p-24 break-words whitespace-pre-wrap text-code squircle:rounded-2xl"
      dangerouslySetInnerHTML={{ __html: highlightJsx(code) }}
    />
  );
}

const installationCode = 'npm i @paper-design/shaders-react';

export function InstallationSection() {
  return (
    <section>
      <div className="flex items-center gap-8">
        <h2 className="text-2xl font-medium lowercase">Installation</h2>
        <CopyButton
          className="-mt-14 -mb-16 size-32 rounded-md outline-0 outline-focus transition-colors hover:bg-backplate-1 focus-visible:outline-2 active:bg-backplate-2 squircle:rounded-lg"
          getText={() => installationCode}
        />
      </div>
      <pre className="w-full rounded-xl bg-backplate-1 p-24 break-words whitespace-pre-wrap text-code squircle:rounded-2xl">
        {installationCode}
      </pre>
    </section>
  );
}

export function CodeFile({ name, code }: { name: string; code: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-8">
        <h3 className="text-2xl font-medium lowercase">{name}</h3>
        <CopyButton
          className="-mt-14 -mb-16 size-32 rounded-md outline-0 outline-focus transition-colors hover:bg-backplate-1 focus-visible:outline-2 active:bg-backplate-2 squircle:rounded-lg"
          getText={() => code}
        />
      </div>
      <CodeBlock code={code} />
    </div>
  );
}
