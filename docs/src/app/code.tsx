export function Code() {
  // Color variables for easy customization
  const colors = {
    keyword: 'text-blue-600 font-semibold',
    component: 'text-blue-600 font-semibold',
    property: 'text-green-700 font-medium',
    string: 'text-orange-600',
    default: 'text-gray-800',
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-white">
      <div className="relative">
        <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed [counter-reset:line]">
          <code>
            <span className="line">
              <span className="whitespace-pre pl-8">
                <span className={colors.keyword}>import</span>
                <span className={colors.default}> {'{'}</span>
                <span className={colors.component}>MeshGradient</span>
                <span className={colors.default}>{'}'} from </span>
                <span className={colors.string}>&apos;@paper-design/shaders-react&apos;</span>
                <span className={colors.default}>;</span>
              </span>
            </span>
            <span className="line">
              <span className="whitespace-pre pl-8 text-gray-600">&nbsp;</span>
            </span>
            <span className="line">
              <span className="whitespace-pre pl-8">
                <span className={colors.keyword}>export </span>
                <span className={colors.keyword}>default </span>
                <span className={colors.default}>() =&gt; (</span>
              </span>
            </span>
            <span className="line">
              <span className="whitespace-pre pl-8">
                <span className={colors.default}> &lt;</span>
                <span className={colors.component}>MeshGradient</span>
              </span>
            </span>
            <span className="line">
              <span className="whitespace-pre pl-8">
                <span className={colors.default}> </span>
                <span className={colors.property}>style</span>
                <span className={colors.default}>=</span>
                <span className={colors.default}>{'{'}</span>
                <span className={colors.default}>{'{'}</span>
                <span className={colors.property}>width</span>
                <span className={colors.default}>: 200, </span>
                <span className={colors.property}>height</span>
                <span className={colors.default}>: 200</span>
                <span className={colors.default}>{'}'}</span>
                <span className={colors.default}>{'}'}</span>
              </span>
            </span>
            <span className="line">
              <span className="whitespace-pre pl-8">
                <span className={colors.default}> </span>
                <span className={colors.property}>colors</span>
                <span className={colors.default}>=</span>
                <span className={colors.default}>{'['}</span>
                <span className={colors.string}>&apos;#5100ff&apos;</span>
                <span className={colors.default}>, </span>
                <span className={colors.string}>&apos;#00ff80&apos;</span>
                <span className={colors.default}>, </span>
                <span className={colors.string}>&apos;#ffcc00&apos;</span>
                <span className={colors.default}>, </span>
                <span className={colors.string}>&apos;#ea00ff&apos;</span>
                <span className={colors.default}>{']'}</span>
              </span>
            </span>
            <span className="line">
              <span className="whitespace-pre pl-8">
                <span className={colors.default}> /&gt;</span>
              </span>
            </span>
            <span className="line">
              <span className="whitespace-pre pl-8">
                <span className={colors.default}>)</span>
              </span>
            </span>
          </code>
        </pre>
      </div>
    </div>
  );
}
