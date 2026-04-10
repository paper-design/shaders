import { h, type FunctionalComponent } from 'vue';
import { ShaderMount, type ShaderComponentProps, type ShaderMountInputUniforms } from './shader-mount.js';

export interface ShaderComponentRenderResult extends ShaderComponentProps {
  fragmentShader: string;
  uniforms: ShaderMountInputUniforms;
  speed?: number;
  frame?: number;
  mipmaps?: string[];
}

export type ShaderVueComponent<Props> = FunctionalComponent<Props> & {
  new (): {
    $props: Props;
  };
};

const baseShaderComponentPropNames = [
  'minPixelRatio',
  'maxPixelCount',
  'webGlContextAttributes',
  'width',
  'height',
];

export function shaderComponentPropNames(
  defaultParams: Record<string, unknown>,
  extraPropNames: string[] = []
): string[] {
  return [...new Set([...Object.keys(defaultParams), ...baseShaderComponentPropNames, ...extraPropNames])];
}

export function createShaderComponent<Props extends ShaderComponentProps>(
  name: string,
  propNames: string[],
  build: (props: Props) => ShaderComponentRenderResult
): ShaderVueComponent<Props> {
  const component: FunctionalComponent<Props> = (rawProps, { attrs }) => {
    const props = rawProps as Props;
    const result = build(props);

    return h(ShaderMount, {
      ...attrs,
      ...result,
    });
  };

  component.props = propNames;
  component.inheritAttrs = false;

  Object.defineProperty(component, 'name', {
    value: name,
  });

  return component as ShaderVueComponent<Props>;
}
