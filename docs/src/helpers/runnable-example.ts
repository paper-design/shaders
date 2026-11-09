function splitJsxAttributes(attributes: string): string[] {
  const parts = [''];
  let depth = 0;
  let quote = '';
  for (const char of attributes) {
    if (quote) {
      if (char === quote) quote = '';
    } else if (`"'\``.includes(char)) {
      quote = char;
    } else if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
    }
    if (char === ' ' && depth === 0 && !quote) {
      parts.push('');
    } else {
      parts[parts.length - 1] += char;
    }
  }
  return parts.filter(Boolean);
}

/** Puts each JSX opening tag on one line, the code block wraps it to the width it has. The shader keeps a prop per line */
export function compactJsxTags(code: string): string {
  const compact = code.replace(/^( *)<([\w.]+)\n([\s\S]*?)\n\1(\/?>)$/gm, (_, indent, name, attributes, end) => {
    const joined = attributes
      .split('\n')
      .map((line: string) => line.trim())
      .join(' ')
      .replace(/, ([}\]])/g, ' $1');
    return `${indent}<${name} ${joined}${end === '/>' ? ' />' : '>'}`;
  });

  const shader = compact.match(/import \{ (\w+) \} from '@paper-design\/shaders-react'/)?.[1];
  if (!shader) return compact;
  return compact.replace(new RegExp(`^( *)<${shader} (.*?) ?(/?>)$`, 'm'), (_, indent, attributes, end) => {
    const lines = splitJsxAttributes(attributes).map((attribute) => `${indent}  ${attribute}`);
    return `${indent}<${shader}\n${lines.join('\n')}\n${indent}${end}`;
  });
}

/** The runnable file split around its css, so the css can be highlighted as css */
export function getRunnableExampleParts(code: string, css: string) {
  const source = code
    .replace(/import '\.\/example\.css';\n/, '')
    .replace('export const params', 'const params')
    .replace('export default function Example', 'function Example')
    .trimEnd();

  return {
    start: `${source}\n\nconst css = `,
    css: `body { margin: 0 }\n${css.replace(/[\\`]|\$\{/g, '\\$&')}`,
    end: `export default function App() {
  return <><style dangerouslySetInnerHTML={{ __html: css }} /><Example /></>;
}
`,
  };
}

export function getRunnableExample(code: string, css: string): string {
  const parts = getRunnableExampleParts(code, css);
  return `${parts.start}\`\n${parts.css}\n\`;\n\n${parts.end}`;
}
