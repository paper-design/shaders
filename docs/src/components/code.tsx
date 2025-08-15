export function Code({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <pre
      className={`scrollbar-thin block grow overflow-x-auto p-4 font-mono text-xs [counter-reset:line] ${className}`}
    >
      <code>{children}</code>
    </pre>
  );
}

export function Install() {
  return (
    <>
      <span className="line">
        <span className="text-code-default">npm i @paper-design/shaders-react</span>
      </span>
    </>
  );
}

export function Example() {
  return (
    <>
      <span className="line">
        <span className="text-code-keyword">import</span>
        <span className="text-code-bracket"> {'{ '}</span>
        <span className="text-code-component">MeshGradient</span>
        <span className="text-code-bracket">{' }'}</span>
        <span className="text-code-keyword"> from </span>
        <span className="text-code-string">&apos;@paper-design/shaders-react&apos;</span>
        <span className="text-code-default">;</span>
      </span>
      <span className="line">
        <span className="text-code-default">&nbsp;</span>
      </span>
      <span className="line">
        <span className="text-code-keyword">export </span>
        <span className="text-code-keyword">default </span>
        <span className="text-code-bracket">() </span>
        <span className="text-code-default">=&gt;</span>
        <span className="text-code-bracket"> (</span>
      </span>
      <span className="line">
        <span className="text-code-default"> </span>
        <span className="text-code-default"> &lt;</span>
        <span className="text-code-component">MeshGradient</span>
      </span>
      <span className="line">
        <span className="text-code-default"> </span>
        <span className="text-code-default"> </span>
        <span className="text-code-default"> </span>
        <span className="text-code-property"> style</span>
        <span className="text-code-default">=</span>
        <span className="text-code-bracket">{'{'}</span>
        <span className="text-code-bracket">{'{ '}</span>
        <span className="text-code-object-property">width:</span>
        <span className="text-code-number"> 200</span>
        <span className="text-code-default">, </span>
        <span className="text-code-object-property">height:</span>
        <span className="text-code-number"> 200</span>
        <span className="text-code-bracket">{' }'}</span>
        <span className="text-code-bracket">{'}'}</span>
      </span>
      <span className="line">
        <span className="text-code-default"> </span>
        <span className="text-code-default"> </span>
        <span className="text-code-default"> </span>
        <span className="text-code-property"> colors</span>
        <span className="text-code-default">=</span>
        <span className="text-code-bracket">{'{'}</span>
        <span className="text-code-bracket">{'['}</span>
        <span className="text-code-string">&apos;#5100ff&apos;</span>
        <span className="text-code-default">, </span>
        <span className="text-code-string">&apos;#00ff80&apos;</span>
        <span className="text-code-default">, </span>
        <span className="text-code-string">&apos;#ffcc00&apos;</span>
        <span className="text-code-default">, </span>
        <span className="text-code-string">&apos;#ea00ff&apos;</span>
        <span className="text-code-bracket">{']'}</span>
        <span className="text-code-bracket">{'}'}</span>
      </span>
      <span className="line">
        <span className="text-code-default"> </span>
        <span className="text-code-default"> /&gt;</span>
      </span>
      <span className="line">
        <span className="text-code-bracket">)</span>
      </span>
    </>
  );
}
