export interface ParamOption {
  name: string;
  description: string;
}

export interface ParamDef {
  name: string;
  type: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: unknown;
  description: string;
  options?: ParamOption[] | string[];
  isColor?: boolean;
}

export interface ShaderDef {
  name: string;
  description: string;
  params: ParamDef[];
}
