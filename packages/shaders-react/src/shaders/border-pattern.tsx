import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  borderPatternFragmentShader,
  type BorderPatternUniforms,
} from '@paper-design/shaders';

export type BorderPatternParams = {
  colorBack?: string;
  color?: string;
  scale?: number;
  pxSize?: number;
  dotSizeRand?: number;
  dotSize?: number;
  noise?: number;
  blur?: number;
  overlayX?: number;
  overlayY?: number;
  overlayScale?: number;
};

export type BorderPatternProps = Omit<ShaderMountProps, 'fragmentShader'> & BorderPatternParams;

type BorderPatternPreset = { name: string; params: Required<BorderPatternParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: BorderPatternPreset = {
  name: 'Default',
  params: {
    colorBack: 'hsla(0, 0%, 100%, 0)',
    color: 'hsla(210, 100%, 25%, 1)',
    scale: 3,
    pxSize: 100,
    dotSizeRand: 0,
    dotSize: 0.5,
    noise: 0,
    blur: 0,
    overlayX: 0,
    overlayY: 0,
    overlayScale: 0,
  },
} as const;

export const borderPatternPresets: BorderPatternPreset[] = [defaultPreset] as const;

export const BorderPattern = (props: BorderPatternProps): JSX.Element => {
  const uniforms: BorderPatternUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color: getShaderColorFromString(props.color, defaultPreset.params.color),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_pxSize: props.pxSize ?? defaultPreset.params.pxSize,
      u_dotSizeRand: props.dotSizeRand ?? defaultPreset.params.dotSizeRand,
      u_dotSize: props.dotSize ?? defaultPreset.params.dotSize,
      u_blur: props.blur ?? defaultPreset.params.blur,
      u_noise: props.noise ?? defaultPreset.params.noise,
      u_overlayX: props.overlayX ?? defaultPreset.params.overlayX,
      u_overlayY: props.overlayY ?? defaultPreset.params.overlayY,
      u_overlayScale: props.overlayScale ?? defaultPreset.params.overlayScale,
    };
  }, [
    props.colorBack,
    props.color,
    props.scale,
    props.pxSize,
    props.dotSizeRand,
    props.dotSize,
    props.noise,
    props.blur,
    props.overlayX,
    props.overlayY,
    props.overlayScale,
  ]);

  return <ShaderMount {...props} fragmentShader={borderPatternFragmentShader} uniforms={uniforms} />;
};
