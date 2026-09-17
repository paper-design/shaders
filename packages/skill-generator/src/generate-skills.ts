import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { combineProperties } from './catalog.js';
import { loadSkillContent } from './content.js';
import type { Shader } from './model.js';
import { renderShader, renderSkill, renderUsage } from './render.js';
import { parseShaderComment } from './shader-comment.js';
import {
  bindingDefaultValues,
  bindingDefaultExpression,
  callsIdentifier,
  calledIdentifierStartingWith,
  defaultPresetParams,
  discoverShaderSources,
  enumMismatches,
  interfaceExtends,
  jsxArrayAttributeIncludes,
  parseCommonDocumentationProperties,
  parseDocumentationShader,
  shaderMetadata,
  shaderModulePaths,
  sourceProperties,
  uniformPropertyNames,
} from './source-model.js';

const root = path.resolve(import.meta.dir, '../../..');
const content = loadSkillContent(path.join(root, 'packages/skill-generator/content'));
const check = process.argv.includes('--check');
const configPath = path.join(root, 'packages/shaders-react/tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) {
  throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
}
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
const compilerOptions: ts.CompilerOptions = {
  ...parsedConfig.options,
  baseUrl: root,
  paths: {
    '@paper-design/shaders': ['packages/shaders/src/index.ts'],
    '@paper-design/shaders/*': ['packages/shaders/src/*'],
  },
};
const program = ts.createProgram(parsedConfig.fileNames, compilerOptions);
const checker = program.getTypeChecker();
const coreIndexPath = path.join(root, 'packages/shaders/src/index.ts');
const reactIndexPath = path.join(root, 'packages/shaders-react/src/index.ts');
const coreIndex = program.getSourceFile(coreIndexPath);
const reactIndex = program.getSourceFile(reactIndexPath);
if (!coreIndex || !reactIndex) {
  throw new Error('Could not load Paper Shaders package entry points');
}
const commonDocumentationPath = path.join(root, 'docs/src/shader-defs/common-param-def.ts');
const commonDocumentationFile = ts.createSourceFile(
  commonDocumentationPath,
  fs.readFileSync(commonDocumentationPath, 'utf8'),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS
);
const commonDocumentation = parseCommonDocumentationProperties(commonDocumentationFile);
const sizingSource = program.getSourceFile(path.join(root, 'packages/shaders/src/shader-sizing.ts'));
const motionSource = program.getSourceFile(path.join(root, 'packages/shaders/src/shader-mount.ts'));
const componentSource = program.getSourceFile(path.join(root, 'packages/shaders-react/src/shader-mount.tsx'));
if (!sizingSource || !motionSource || !componentSource) {
  throw new Error('Could not load common Paper Shaders types');
}
const sizingProperties = sourceProperties(checker, sizingSource, 'ShaderSizingParams');
const motionProperties = sourceProperties(checker, motionSource, 'ShaderMotionParams');
const componentProperties = sourceProperties(checker, componentSource, 'ShaderComponentProps');

const sources = discoverShaderSources(root, coreIndex, reactIndex);
if (sources.length !== shaderModulePaths(reactIndex).length || sources.length === 0) {
  throw new Error('Could not resolve every exported shader module');
}
const shaders = sources.map((source): Shader => {
  const coreFile = program.getSourceFile(source.corePath);
  const reactFile = program.getSourceFile(source.reactPath);
  const documentationText = fs.readFileSync(source.documentationPath, 'utf8');
  const documentationFile = ts.createSourceFile(
    source.documentationPath,
    documentationText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const documentation = parseDocumentationShader(documentationFile);
  if (!coreFile || !reactFile || !documentation) {
    throw new Error(`Could not load source model for ${source.slug}`);
  }
  documentation.properties.push(...commonDocumentation);

  const coreProperties = sourceProperties(checker, coreFile, source.exports.paramsType);
  const reactProperties = sourceProperties(checker, reactFile, `${source.exports.component}Props`);
  const sourceComment = parseShaderComment(coreFile.getFullText(), source.exports.fragmentShader);
  if (coreProperties.length === 0) {
    throw new Error(`Could not resolve properties for ${source.exports.paramsType}`);
  }
  if (!sourceComment) {
    throw new Error(`Could not resolve shader comment for ${source.exports.paramsType}`);
  }
  const propertiesFromSource = [...coreProperties, ...reactProperties];
  const defaults = {
    ...defaultPresetParams(checker, reactFile),
    ...bindingDefaultValues(checker, reactFile),
  };
  const metadata = shaderMetadata(checker, coreFile);
  const properties = combineProperties(
    propertiesFromSource,
    documentation,
    sourceComment,
    uniformPropertyNames(
      reactFile,
      propertiesFromSource.map((property) => property.name)
    ),
    defaults,
    metadata
  );
  const shader: Shader = {
    ...source,
    name: documentation.name,
    description: sourceComment.description,
    properties,
    defaults,
    hasMotion: interfaceExtends(coreFile, source.exports.paramsType, 'ShaderMotionParams'),
    usesNoiseTexture: callsIdentifier(reactFile, 'getShaderNoiseTexture'),
    usesImageMipmaps: jsxArrayAttributeIncludes(reactFile, 'mipmaps', 'u_image'),
    imagePreprocessor: calledIdentifierStartingWith(reactFile, 'toProcessed'),
    maxPixelCountExpression: bindingDefaultExpression(reactFile, 'maxPixelCount'),
    enumMismatches: enumMismatches(checker, coreFile, coreProperties, documentation),
  };
  return shader;
});
const sortedShaders = [...shaders].sort((left, right) => left.name.localeCompare(right.name));
const outputRoot = path.join(root, 'skills/paper-shaders');
const files = new Map<string, string>([
  [path.join(outputRoot, 'SKILL.md'), renderSkill(content, sortedShaders)],
  [
    path.join(outputRoot, 'references/usage.md'),
    renderUsage(content, componentProperties, sizingProperties, motionProperties),
  ],
  ...sortedShaders.map((shader): [string, string] => [
    path.join(outputRoot, 'references/shaders', `${shader.slug}.md`),
    renderShader(root, content, shader),
  ]),
]);
const staleFiles = fs.existsSync(path.join(outputRoot, 'references/shaders'))
  ? fs
      .readdirSync(path.join(outputRoot, 'references/shaders'))
      .filter((name) => name.endsWith('.md'))
      .map((name) => path.join(outputRoot, 'references/shaders', name))
      .filter((filePath) => !files.has(filePath))
  : [];
const changedFiles = [...files].filter(
  ([filePath, value]) => !fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== value
);

if (check && (changedFiles.length > 0 || staleFiles.length > 0)) {
  const names = [
    ...changedFiles.map(([filePath]) => path.relative(root, filePath)),
    ...staleFiles.map((filePath) => path.relative(root, filePath)),
  ];
  throw new Error(`Generated skills are out of date:\n${names.join('\n')}`);
}

if (!check) {
  for (const [filePath, value] of changedFiles) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, value);
  }
  for (const filePath of staleFiles) {
    fs.unlinkSync(filePath);
  }
}

console.log(check ? `Checked ${files.size} generated skill files` : `Generated ${files.size} skill files`);
