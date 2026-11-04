import fs from 'node:fs';
import path from 'node:path';
import type { ContentOrders, RenderFragments, SkillContent, SkillTemplates, WrittenText } from './model.js';

const templateNames = ['skill', 'usage', 'shader'] as const satisfies readonly (keyof SkillTemplates)[];

export const loadSkillContent = (directory: string): SkillContent => {
  const writtenText = readJson<WrittenText>(path.join(directory, 'text.json'));
  return {
    templates: requireKeys(loadMarkdownDirectory(path.join(directory, 'templates')), templateNames, 'templates'),
    fragments: readJson<RenderFragments>(path.join(directory, 'fragments.json')),
    orders: readJson<ContentOrders>(path.join(directory, 'orders.json')),
    text: writtenText.phrases,
    usageMotionDescriptions: writtenText.usageMotionDescriptions,
  };
};

export const loadMarkdownDirectory = (directory: string): Record<string, string> =>
  Object.fromEntries(
    filesWithExtension(directory, '.md').map((fileName) => [
      path.basename(fileName, '.md'),
      withoutFinalLineBreak(fs.readFileSync(path.join(directory, fileName), 'utf8')),
    ])
  );

export const readJson = <Value>(filePath: string): Value => JSON.parse(fs.readFileSync(filePath, 'utf8')) as Value;

export const filesWithExtension = (directory: string, extension: string): string[] =>
  fs
    .readdirSync(directory)
    .filter((fileName) => path.extname(fileName) === extension)
    .sort();

export const withoutFinalLineBreak = (value: string): string => value.replace(/\r?\n$/, '');

export const requireKeys = <Key extends string>(
  record: Record<string, string>,
  keys: readonly Key[],
  group: string
): Record<Key, string> => {
  const missing = keys.filter((key) => !(key in record));
  if (missing.length > 0) {
    throw new Error(`Missing ${group}: ${missing.join(', ')}`);
  }
  return record as Record<Key, string>;
};
