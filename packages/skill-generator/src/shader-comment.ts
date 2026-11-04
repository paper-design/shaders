import type { ShaderComment, ShaderCommentProperty } from './model.js';

const jsDocPattern = /\/\*\*([\s\S]*?)\*\//g;
const uniformPattern = /^- u_([A-Za-z0-9]+) \([^)]+\): (.+)$/;
const numberPattern = '-?(?:\\d+(?:\\.\\d+)?|\\.\\d+)';
const trailingRangePattern = new RegExp(`(${numberPattern}) to (${numberPattern})\\)$`);

export const parseShaderComment = (source: string, fragmentShaderName: string): ShaderComment | undefined => {
  const comment = precedingJsDoc(source, fragmentShaderName);
  if (!comment) return undefined;
  const lines = jsDocLines(comment);
  const description = firstParagraph(lines);
  return description
    ? {
        description,
        properties: lines
          .map(parseUniformLine)
          .filter((property): property is ShaderCommentProperty => Boolean(property)),
      }
    : undefined;
};

export const precedingJsDoc = (source: string, declarationName: string): string | undefined => {
  const declarationIndex = source.indexOf(declarationName);
  if (declarationIndex < 0) return undefined;
  return [...source.slice(0, declarationIndex).matchAll(jsDocPattern)].at(-1)?.[1];
};

export const jsDocLines = (comment: string): string[] =>
  comment.split(/\r?\n/).map((line) => line.replace(/^\s*\*\s?/, '').trimEnd());

export const firstParagraph = (lines: string[]): string => {
  const start = lines.findIndex((line) => line.trim().length > 0);
  if (start < 0) return '';
  const paragraph = lines.slice(start);
  const end = paragraph.findIndex((line) => line.trim().length === 0);
  return paragraph
    .slice(0, end < 0 ? paragraph.length : end)
    .map((line) => line.trim())
    .join(' ');
};

export const parseUniformLine = (line: string): ShaderCommentProperty | undefined => {
  const match = line.match(uniformPattern);
  if (!match?.[1] || !match[2]) return undefined;
  const value = descriptionAndRange(match[2]);
  return {
    name: match[1],
    description: value.description,
    ...(value.min === undefined ? {} : { min: value.min }),
    ...(value.max === undefined ? {} : { max: value.max }),
  };
};

export const descriptionAndRange = (value: string): { description: string; min?: number; max?: number } => {
  const match = value.match(trailingRangePattern);
  if (!match?.[1] || !match[2] || match.index === undefined) {
    return { description: value };
  }
  return {
    description: closeUnbalancedParenthesis(removeRangeSeparator(value.slice(0, match.index))),
    min: Number(match[1]),
    max: Number(match[2]),
  };
};

export const removeRangeSeparator = (value: string): string =>
  value.trimEnd().replace(/\($/, '').replace(/,\s*$/, '').trimEnd();

export const closeUnbalancedParenthesis = (value: string): string =>
  characterCount(value, '(') > characterCount(value, ')') ? `${value})` : value;

export const characterCount = (value: string, character: string): number =>
  [...value].filter((candidate) => candidate === character).length;
