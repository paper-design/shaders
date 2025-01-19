import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, radialSwirlFragmentShader, type RadialSwirlUniforms } from '@paper-design/shaders';

export type RadialSwirlParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  density?: number;
  dotSize?: number;
  focus?: number;
} & GlobalParams;

export type RadialSwirlProps = Omit<ShaderMountProps, 'fragmentShader'> & RadialSwirlParams;

type RadialSwirlPreset = { name: string; params: Required<RadialSwirlParams> };

export const defaultPreset: RadialSwirlPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(190, 90%, 50%, 1)',
    color2: 'hsla(290, 90%, 50%, 1)',
    color3: 'hsla(200, 90%, 100%, 1)',
    density: 1,
    speed: .2,
    dotSize: 1,
    focus: 1,
    seed: 0,
  },
} as const;

export const radialSwirlPresets: RadialSwirlPreset[] = [defaultPreset];

export const RadialSwirl = (props: RadialSwirlProps): JSX.Element => {
  const uniforms: RadialSwirlUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_density: props.density ?? defaultPreset.params.density,
      u_dotSize: props.dotSize ?? defaultPreset.params.dotSize,
      u_focus: props.focus ?? defaultPreset.params.focus,
      u_seed: props.seed ?? defaultPreset.params.seed,
    };
  }, [props.color1, props.color2, props.color3, props.density, props.dotSize, props.focus, props.seed]);

  return <ShaderMount {...props} fragmentShader={radialSwirlFragmentShader} uniforms={uniforms} />;
};
