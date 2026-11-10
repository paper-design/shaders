export function highlightJsx(code: string): string {
  return new Highlighter(code).highlightJs(false);
}

type TokenType = 'keyword' | 'string' | 'text' | 'entity' | 'number' | 'property' | 'identifier' | 'sign' | 'shader';

const nonShaderTags = new Set(['Example', 'Card']);

const keywords = new Set(['const', 'delete', 'else', 'false', 'from', 'if', 'import', 'let', 'new', 'return', 'true']);

class Highlighter {
  private readonly code: string;
  private index = 0;

  constructor(code: string) {
    this.code = code;
  }

  highlightJs(isInsideBraces: boolean): string {
    let html = '';
    let depth = 0;
    let previous = '';

    while (this.index < this.code.length) {
      const rest = this.code.slice(this.index);
      const char = rest[0]!;

      if (char === '}' && isInsideBraces && depth === 0) break;

      const space = rest.match(/^\s+/)?.[0];
      if (space) {
        html += this.take(space);
        continue;
      }

      const comment = rest.match(/^\/\/[^\n]*|^\/\*[\s\S]*?\*\//)?.[0];
      if (comment) {
        html += this.take(comment, 'sign');
        continue;
      }

      if (char === '<' && /^<[\w/>]/.test(rest) && !/[\w)\]]$/.test(previous)) {
        html += this.highlightJsxElement();
        previous = '>';
        continue;
      }

      const string = rest.match(/^"(?:\\.|[^"\\])*"|^'(?:\\.|[^'\\])*'|^`(?:\\.|[^`\\])*`/)?.[0];
      const number = rest.match(/^\d*\.?\d+/)?.[0];
      const word = rest.match(/^[\w$]+/)?.[0];

      if (string) {
        html += this.take(string, 'string');
      } else if (number) {
        html += this.take(number, 'number');
      } else if (word) {
        const isProperty = previous === '.' || (/^[{,]$/.test(previous) && /^\s*:/.test(rest.slice(word.length)));
        html += this.take(word, keywords.has(word) ? 'keyword' : isProperty ? 'property' : 'identifier');
      } else {
        if (char === '{') depth++;
        if (char === '}') depth--;
        html += this.take(char, 'sign');
      }
      previous = string ?? number ?? word ?? char;
    }

    return html;
  }

  private highlightJsxElement(): string {
    const isClosing = this.code.startsWith('</', this.index);
    const start = isClosing ? '</' : '<';
    const tag = this.code.slice(this.index + start.length).match(/^[\w.]*/)![0];
    // Every capitalized tag in the samples is a shader, except these
    const isShader = /^[A-Z]/.test(tag) && !nonShaderTags.has(tag);
    if (isShader && isClosing) {
      return this.take(`</${tag}>`, 'shader');
    }

    let html = isShader ? this.take(`<${tag}`, 'shader') : this.take(start, 'sign') + this.take(tag, 'entity');

    while (this.index < this.code.length) {
      const rest = this.code.slice(this.index);
      const space = rest.match(/^\s+/)?.[0];
      const attribute = rest.match(/^[\w-]+/)?.[0];
      const string = rest.match(/^"[^"]*"/)?.[0];

      if (space) {
        html += this.take(space);
      } else if (rest.startsWith('/>')) {
        return html + this.take('/>', isShader ? 'shader' : 'sign');
      } else if (rest[0] === '>') {
        html += this.take('>', isShader ? 'shader' : 'sign');
        return isClosing ? html : html + this.highlightJsxChildren();
      } else if (attribute) {
        html += this.take(attribute, 'property');
      } else if (string) {
        html += this.take(string, 'string');
      } else if (rest[0] === '{') {
        html += this.take('{', 'sign') + this.highlightJs(true) + this.take('}', 'sign');
      } else {
        html += this.take(rest[0]!, 'sign');
      }
    }

    return html;
  }

  private highlightJsxChildren(): string {
    let html = '';

    while (this.index < this.code.length) {
      const rest = this.code.slice(this.index);

      if (rest.startsWith('</')) {
        return html + this.highlightJsxElement();
      } else if (rest[0] === '<') {
        html += this.highlightJsxElement();
      } else if (rest[0] === '{') {
        html += this.take('{', 'sign') + this.highlightJs(true) + this.take('}', 'sign');
      } else {
        const text = rest.match(/^[^<{]+/)![0];
        html += this.take(text, text.trim() ? 'text' : undefined);
      }
    }

    return html;
  }

  private take(text: string, type?: TokenType): string {
    if (!this.code.startsWith(text, this.index)) return '';
    this.index += text.length;
    return type ? token(type, text) : escapeHtml(text);
  }
}

const cssTokenPattern =
  /(\s+)|([^\s{};][^{};]*(?=\{))|([\w-]+)(?=\s*:)|("[^"]*"|'[^']*')|(#[\da-f]+\b|-?\d*\.?\d+(?:%|[a-z]+)?)|([\w-]+)|(.)/giy;

export function highlightCss(css: string): string {
  const types = [undefined, 'entity', 'property', 'string', 'number', 'identifier', 'sign'] as const;
  let html = '';
  cssTokenPattern.lastIndex = 0;
  for (let match = cssTokenPattern.exec(css); match; match = cssTokenPattern.exec(css)) {
    const type = types[match.slice(1).findIndex((group) => group !== undefined)];
    html += type ? token(type, match[0]) : escapeHtml(match[0]);
  }
  return html;
}

function token(type: TokenType, text: string): string {
  if (type === 'shader') return `<span class="syntax-shader">${escapeHtml(text)}</span>`;
  return text ? `<span style="color:var(--syntax-${type})">${escapeHtml(text)}</span>` : '';
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
