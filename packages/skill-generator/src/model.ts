export type StaticValue = string | number | boolean | null | StaticValue[] | { [key: string]: StaticValue };

export type StaticRecord = { [key: string]: StaticValue };

export type SourceProperty = {
  name: string;
  type: string;
  required: boolean;
  options: string[];
  deprecated?: string;
  description?: string;
};

export type DocumentationProperty = {
  name: string;
  description: string;
  min?: number;
  max?: number;
  step?: number;
  options: string[];
};

export type DocumentationShader = {
  name: string;
  description: string;
  properties: DocumentationProperty[];
};

export type ShaderCommentProperty = {
  name: string;
  description: string;
  min?: number;
  max?: number;
};

export type ShaderComment = {
  description: string;
  properties: ShaderCommentProperty[];
};

export type ShaderExports = {
  component: string;
  paramsType: string;
  preset: string;
  fragmentShader: string;
};

export type ShaderSource = {
  slug: string;
  corePath: string;
  reactPath: string;
  documentationPath: string;
  exports: ShaderExports;
};

export type ShaderProperty = SourceProperty & {
  defaultValue?: StaticValue;
  description: string;
  constraints: string[];
};

export type Shader = ShaderSource & {
  name: string;
  description: string;
  properties: ShaderProperty[];
  defaults: StaticRecord;
  hasMotion: boolean;
  usesNoiseTexture: boolean;
  usesImageMipmaps: boolean;
  imagePreprocessor?: string;
  maxPixelCountExpression?: string;
  enumMismatches: EnumMismatch[];
};

export type EnumMismatch = {
  prop: string;
  sourceOptions: string[];
  documentationOptions: string[];
  mapping?: string;
};

export type SkillTemplates = {
  skill: string;
  usage: string;
  shader: string;
};

export type RenderFragments = {
  shaderLink: string;
  note: string;
  default: string;
  inlineCode: string;
  tableHeader: string[];
  tableRow: string;
  usageProperty: string;
  usageMotionProperty: string;
};

export type ContentOrders = {
  usageComponentProperties: string[];
  commonDefaults: string[];
};

export type SkillText = {
  noiseRequirement: string;
  mipmapRequirement: string;
  combinedNoiseAndMipmapRequirement: string;
  preprocessorRequirement: string;
  maxPixelCount: string;
  enumMismatch: string;
};

export type WrittenText = {
  phrases: SkillText;
  usageMotionDescriptions: Record<string, string>;
};

export type SkillContent = {
  templates: SkillTemplates;
  fragments: RenderFragments;
  orders: ContentOrders;
  usageMotionDescriptions: Record<string, string>;
  text: SkillText;
};
