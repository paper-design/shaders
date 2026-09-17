import path from 'node:path';
import { replaceTokens } from './catalog.js';
import type { EnumMismatch, Shader, ShaderProperty, SkillContent, SourceProperty, StaticValue } from './model.js';

export const renderSkill = (content: SkillContent, shaders: Shader[]): string =>
  renderTemplate(content.templates.skill, {
    shaderLinks: shaders
      .map((shader) =>
        replaceTokens(content.fragments.shaderLink, {
          name: shader.name,
          slug: shader.slug,
        })
      )
      .join('\n'),
  });

export const renderUsage = (
  content: SkillContent,
  componentProperties: SourceProperty[],
  sizingProperties: SourceProperty[],
  motionProperties: SourceProperty[]
): string =>
  renderTemplate(content.templates.usage, {
    componentControls: orderedProperties(componentProperties, content.orders.usageComponentProperties)
      .map((property) => renderUsageProperty(content, property))
      .join('\n'),
    sizingProperties: sizingProperties.map((property) => renderUsageProperty(content, property)).join('\n'),
    motionProperties: motionProperties
      .map((property) =>
        replaceTokens(content.fragments.usageMotionProperty, {
          name: property.name,
          optional: optionalMarker(property.required),
          type: displayType(property),
          description: content.usageMotionDescriptions[property.name] ?? '',
        })
      )
      .join('\n'),
  });

export const renderShader = (root: string, content: SkillContent, shader: Shader): string => {
  const requirements = renderRequirements(content, shader);
  const notes = [...requirements, ...shader.enumMismatches.map((mismatch) => renderEnumMismatch(content, mismatch))];
  const defaults = content.orders.commonDefaults
    .map((name) => [name, shader.defaults[name]] as const)
    .filter((entry): entry is readonly [string, StaticValue] => entry[1] !== undefined)
    .map(([name, value]) =>
      replaceTokens(content.fragments.default, {
        name,
        value: formatValue(value),
      })
    )
    .join(', ');
  const table = [
    ...content.fragments.tableHeader,
    ...shader.properties.map((property) => renderProperty(content, property)),
  ].join('\n');

  return renderTemplate(content.templates.shader, {
    name: shader.name,
    description: shader.description,
    component: shader.exports.component,
    preset: shader.exports.preset,
    fragmentShader: shader.exports.fragmentShader,
    paramsType: shader.exports.paramsType,
    controls: controlsLabel(shader.hasMotion),
    defaults,
    notes:
      notes.length > 0 ? `\n${notes.map((note) => replaceTokens(content.fragments.note, { note })).join('\n')}` : '',
    source: sourceList(
      relativePath(root, shader.corePath),
      relativePath(root, shader.reactPath),
      relativePath(root, shader.documentationPath)
    ),
    table,
  });
};

export const renderProperty = (content: SkillContent, property: ShaderProperty): string =>
  replaceTokens(content.fragments.tableRow, {
    name: property.name,
    type: escapeTable(property.type),
    required: requiredLabel(property.required),
    defaultValue:
      property.defaultValue === undefined
        ? emptyTableCell()
        : replaceTokens(content.fragments.inlineCode, {
            value: escapeTable(formatValue(property.defaultValue)),
          }),
    constraints: property.constraints.length > 0 ? escapeTable(property.constraints.join('; ')) : emptyTableCell(),
    description: escapeTable(property.description),
  });

export const renderTemplate = (template: string, values: Record<string, string>): string =>
  `${replaceTokens(template, values)}\n`;

export const formatValue = (value: StaticValue): string => JSON.stringify(value);

export const renderUsageProperty = (content: SkillContent, property: SourceProperty): string =>
  replaceTokens(content.fragments.usageProperty, {
    name: property.name,
    optional: optionalMarker(property.required),
    type: displayType(property),
  });

export const optionalMarker = (required: boolean): string => (required ? '' : '?');

export const controlsLabel = (hasMotion: boolean): string => (hasMotion ? 'sizing and motion' : 'sizing');

export const sourceList = (corePath: string, reactPath: string, documentationPath: string): string =>
  `Source: \`${corePath}\`, \`${reactPath}\`, \`${documentationPath}\`.`;

export const requiredLabel = (required: boolean): string => (required ? 'yes' : 'no');

export const emptyTableCell = (): string => '—';

const renderRequirements = (content: SkillContent, shader: Shader): string[] => {
  if (shader.usesNoiseTexture && shader.usesImageMipmaps) {
    return [content.text.combinedNoiseAndMipmapRequirement];
  }
  const requirements = [
    shader.usesNoiseTexture ? content.text.noiseRequirement : undefined,
    shader.usesImageMipmaps
      ? shader.imagePreprocessor
        ? replaceTokens(content.text.preprocessorRequirement, {
            preprocessor: shader.imagePreprocessor,
          })
        : content.text.mipmapRequirement
      : undefined,
    shader.maxPixelCountExpression
      ? replaceTokens(content.text.maxPixelCount, {
          expression: shader.maxPixelCountExpression,
        })
      : undefined,
  ];
  return requirements.filter((value): value is string => Boolean(value));
};

const renderEnumMismatch = (content: SkillContent, mismatch: EnumMismatch): string =>
  replaceTokens(content.text.enumMismatch, {
    documented: mismatch.documentationOptions
      .map((value) => replaceTokens(content.fragments.inlineCode, { value }))
      .join(', '),
    source: mismatch.sourceOptions.map((value) => replaceTokens(content.fragments.inlineCode, { value })).join(', '),
    mapping: mismatch.mapping ?? '',
  });

const relativePath = (root: string, filePath: string): string =>
  path.relative(root, filePath).split(path.sep).join('/');

const escapeTable = (value: string): string => value.replaceAll('|', '\\|');

const displayType = (property: SourceProperty): string =>
  property.options.length > 0 ? property.options.map((option) => JSON.stringify(option)).join(' | ') : property.type;

const orderedProperties = (properties: SourceProperty[], order: string[]): SourceProperty[] =>
  [...properties].sort((left, right) => order.indexOf(left.name) - order.indexOf(right.name));
