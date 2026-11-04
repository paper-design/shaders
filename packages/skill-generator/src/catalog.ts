import type {
  DocumentationProperty,
  DocumentationShader,
  ShaderProperty,
  ShaderComment,
  ShaderCommentProperty,
  SourceProperty,
  StaticRecord,
} from './model.js';

export const combineProperties = (
  source: SourceProperty[],
  documentation: DocumentationShader,
  sourceComment: ShaderComment,
  uniformNames: Record<string, string>,
  defaults: StaticRecord,
  metadata: StaticRecord
): ShaderProperty[] =>
  source.map((property) => {
    const documented = documentation.properties.find((candidate) => candidate.name === property.name);
    const commented = sourceComment.properties.find(
      (candidate) => candidate.name === (uniformNames[property.name] ?? property.name)
    );
    return {
      ...property,
      ...(defaults[property.name] !== undefined ? { defaultValue: defaults[property.name] } : {}),
      description: propertyDescription(property, commented, documented),
      constraints: propertyConstraints(property, commented, documented, metadata),
    };
  });

const propertyDescription = (
  property: SourceProperty,
  sourceComment: ShaderCommentProperty | undefined,
  documentation: DocumentationProperty | undefined
): string => {
  if (property.deprecated) {
    return deprecatedDescription(property.deprecated);
  }
  if (property.description) {
    return reactOnlyDescription(property.description);
  }
  return sourceComment?.description ?? documentation?.description ?? reactOnlyDescription();
};

const propertyConstraints = (
  property: SourceProperty,
  sourceComment: ShaderCommentProperty | undefined,
  documentation: DocumentationProperty | undefined,
  metadata: StaticRecord
): string[] => {
  if (property.deprecated) return [];
  const range =
    typeof documentation?.min === 'number' && typeof documentation.max === 'number'
      ? editorRange(documentation.min, documentation.max)
      : undefined;
  const step = typeof documentation?.step === 'number' ? constraintStep(documentation.step) : undefined;
  const options = property.options.length > 0 ? constraintOptions(property.options) : undefined;
  const sourceRange =
    sourceComment?.min !== undefined &&
    sourceComment.max !== undefined &&
    (sourceComment.min !== documentation?.min || sourceComment.max !== documentation.max)
      ? documentedSourceRange(sourceComment.min, sourceComment.max)
      : undefined;
  const capacity = propertyCapacity(property.name, metadata);
  const implementationCapacity =
    capacity !== undefined && capacity !== sourceComment?.max && capacity !== documentation?.max
      ? capacityConstraint(capacity)
      : undefined;
  return [range, step, options, sourceRange, implementationCapacity].filter((value): value is string => Boolean(value));
};

export const deprecatedDescription = (comment: string): string => `React-only. @deprecated ${comment}`;

export const reactOnlyDescription = (description?: string): string =>
  description ? `React-only. ${description}` : 'React-only.';

export const editorRange = (min: number, max: number): string => `editor range: ${min}…${max}`;

export const constraintStep = (step: number): string => `step: ${step}`;

export const constraintOptions = (options: string[]): string =>
  `options: ${options.map((option) => JSON.stringify(option)).join(', ')}`;

export const documentedSourceRange = (min: number, max: number): string => `shader source documents ${min}…${max}`;

export const capacityConstraint = (capacity: number): string => `implementation capacity: ${capacity}`;

export const propertyCapacity = (propertyName: string, metadata: StaticRecord): number | undefined => {
  const property = `${propertyName.charAt(0).toUpperCase()}${propertyName.slice(1)}`;
  const singularProperty = propertyName.endsWith('s') ? property.slice(0, -1) : property;
  const names = [`max${property}`, `max${singularProperty}Count`];
  return names.map((name) => metadata[name]).find((value): value is number => typeof value === 'number');
};

export const replaceTokens = (template: string, values: Record<string, string>): string =>
  Object.entries(values).reduce((result, [name, value]) => result.replaceAll(`{{${name}}}`, value), template);
