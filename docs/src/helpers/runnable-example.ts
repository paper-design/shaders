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

const shaderImport = /import \{ (\w+) \} from '@paper-design\/shaders-react'/;

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

  const shader = compact.match(shaderImport)?.[1];
  if (!shader) return compact;
  return compact.replace(new RegExp(`^( *)<${shader} (.*?) ?(/?>)$`, 'm'), (_, indent, attributes, end) => {
    const lines = splitJsxAttributes(attributes).map((attribute) => `${indent}  ${attribute}`);
    return `${indent}<${shader}\n${lines.join('\n')}\n${indent}${end}`;
  });
}

function findClosingBrace(code: string, start: number): number {
  let depth = 1;
  let quote = '';
  for (let index = start; index < code.length; index++) {
    const char = code[index]!;
    if (quote) {
      if (char === quote) quote = '';
    } else if (`"'\``.includes(char)) {
      quote = char;
    } else if (char === '{') {
      depth++;
    } else if (char === '}' && --depth === 0) {
      return index;
    }
  }
  return code.length;
}

/** Leaves event handlers and refs out of JSX, for short code that doesn't show the functions they point to */
export function removeJsxHandlers(jsx: string): string {
  const attribute = /\s+(?:on[A-Z]\w*|ref)=\{/g;
  let result = '';
  let position = 0;
  for (let match = attribute.exec(jsx); match; match = attribute.exec(jsx)) {
    result += jsx.slice(position, match.index);
    position = findClosingBrace(jsx, match.index + match[0].length) + 1;
    attribute.lastIndex = position;
  }
  return result + jsx.slice(position);
}

/** The shader's import and element, without the code around them */
export function getShaderElementCode(code: string): string {
  const shaderImportMatch = code.match(shaderImport);
  const opening = shaderImportMatch && code.match(new RegExp(`^( *)<${shaderImportMatch[1]}\\b`, 'm'));
  if (!opening) return code;

  const closing = `</${shaderImportMatch[1]}>`;
  const element = code
    .slice(opening.index, code.indexOf(closing) + closing.length)
    .replace(new RegExp(`^ {${opening[1]!.length}}`, 'gm'), '');
  return `${shaderImportMatch[0]};\n\n${removeJsxHandlers(element)}\n`;
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
