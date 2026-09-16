import { isValidElement, type ReactElement, type ReactNode } from 'react';

/**
 * Prints a JSX tree as source so a code sample can be generated from the markup a page actually renders,
 * instead of keeping a copy of it in sync by hand.
 */
export function jsxToCode(node: ReactNode, indent = ''): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return `${indent}${String(node).trim()}`;
  }
  if (Array.isArray(node)) {
    return node
      .map((child) => jsxToCode(child, indent))
      .filter(Boolean)
      .join('\n');
  }
  if (!isValidElement(node)) {
    return '';
  }

  const element = node as ReactElement<Record<string, unknown>>;
  const tag = typeof element.type === 'string' ? element.type : getComponentName(element.type);
  const { children, ...props } = element.props;

  // Inline styles and event handlers print across several lines, which puts every attribute on its own line
  const attributes = Object.entries(props).map(([name, value]) => formatAttribute(name, value, `${indent}  `));
  const isMultilineTag = attributes.some((attribute) => attribute.includes('\n'));

  if (children === undefined || children === null) {
    return attributes.length === 0
      ? `${indent}<${tag} />`
      : isMultilineTag
        ? `${indent}<${tag}\n${attributes.map((attribute) => `${indent}  ${attribute}`).join('\n')}\n${indent}/>`
        : `${indent}<${tag} ${attributes.join(' ')} />`;
  }

  // A <style> tag holds its CSS as a template literal
  if (tag === 'style' && typeof children === 'string') {
    return `${indent}<style>{\`${children.trim()}\`}</style>`;
  }

  const openTag =
    attributes.length === 0
      ? `${indent}<${tag}>`
      : isMultilineTag
        ? `${indent}<${tag}\n${attributes.map((attribute) => `${indent}  ${attribute}`).join('\n')}\n${indent}>`
        : `${indent}<${tag} ${attributes.join(' ')}>`;

  if (typeof children === 'string' && !isMultilineTag) {
    return `${openTag}${children.trim()}</${tag}>`;
  }

  return `${openTag}\n${jsxToCode(children as ReactNode, `${indent}  `)}\n${indent}</${tag}>`;
}

/**
 * Attaches the source to print for an event handler.
 * The compiler rewrites function bodies, so the code sample can't be read back off the function itself.
 */
export function withCode<Args extends unknown[]>(
  fn: (...args: Args) => void,
  code: string
): ((...args: Args) => void) & { code: string } {
  return Object.assign(fn, { code });
}

function getComponentName(type: unknown): string {
  const component = type as { displayName?: string; name?: string };
  return component.displayName || component.name || 'Component';
}

function formatAttribute(name: string, value: unknown, indent: string): string {
  if (typeof value === 'string') return `${name}="${value}"`;
  if (typeof value === 'number') return `${name}={${value}}`;
  if (typeof value === 'boolean') return value ? name : `${name}={false}`;
  // Function.toString() returns compiled source, so handlers carry the source to print (see withCode)
  if (typeof value === 'function') {
    const source = (value as { code?: string }).code ?? value.toString();
    return `${name}={${reindent(source, indent)}}`;
  }
  if (value && typeof value === 'object') return `${name}={${formatObject(value as Record<string, unknown>, indent)}}`;
  return `${name}={${JSON.stringify(value)}}`;
}

function formatObject(value: Record<string, unknown>, indent: string): string {
  const entries = Object.entries(value).map(
    ([key, entry]) => `${indent}  ${key}: ${typeof entry === 'string' ? `'${entry}'` : JSON.stringify(entry)},`
  );
  return `{\n${entries.join('\n')}\n${indent}}`;
}

/** Function source arrives with the indentation of the file it was written in */
function reindent(source: string, indent: string): string {
  const [firstLine, ...bodyLines] = source.split('\n');
  if (bodyLines.length === 0) return source;

  const indents = bodyLines.filter((line) => line.trim()).map((line) => line.match(/^ */)![0].length);
  const smallestIndent = indents.length > 0 ? Math.min(...indents) : 0;

  return [firstLine, ...bodyLines.map((line) => `${indent}${line.slice(smallestIndent)}`)].join('\n');
}
