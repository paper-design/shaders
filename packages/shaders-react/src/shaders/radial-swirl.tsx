import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, radialSwirlFragmentShader, type RadialSwirlUniforms } from '@paper-design/shaders';

export type RadialSwirlParams = {
  colorBack?: string;
  colorFront?: string;
  colorStripe1?: string;
  colorStripe2?: string;
  density?: number;
  proportion?: number;
  stripe1?: number;
  stripe2?: number;
  focus?: number;
  noiseFreq?: number;
  noisePower?: number;
} & GlobalParams;

export type RadialSwirlProps = Omit<ShaderMountProps, 'fragmentShader'> & RadialSwirlParams;

type RadialSwirlPreset = { name: string; params: Required<RadialSwirlParams> };

export const defaultPreset: RadialSwirlPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    colorBack: 'hsla(190, 75%, 90%, 1)',
    colorFront: 'hsla(250, 75%, 20%, 1)',
    colorStripe1: 'hsla(290, 90%, 50%, 1)',
    colorStripe2: 'hsla(50, 80%, 65%, 1)',
    density: 1,
    speed: .2,
    proportion: 0,
    stripe1: 0,
    stripe2: 0,
    focus: 0,
    noiseFreq: 0,
    noisePower: 0,
    seed: 0,
  },
} as const;


export const radialSwirlPresets: RadialSwirlPreset[] = [defaultPreset];

export const RadialSwirl = (props: RadialSwirlProps): JSX.Element => {
  const uniforms: RadialSwirlUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_colorFront: getShaderColorFromString(props.colorFront, defaultPreset.params.colorFront),
      u_colorStripe1: getShaderColorFromString(props.colorStripe1, defaultPreset.params.colorStripe1),
      u_colorStripe2: getShaderColorFromString(props.colorStripe2, defaultPreset.params.colorStripe2),
      u_density: props.density ?? defaultPreset.params.density,
      u_proportion: props.proportion ?? defaultPreset.params.proportion,
      u_stripe1: props.stripe1 ?? defaultPreset.params.stripe1,
      u_stripe2: props.stripe2 ?? defaultPreset.params.stripe2,
      u_focus: props.focus ?? defaultPreset.params.focus,
      u_noiseFreq: props.noiseFreq ?? defaultPreset.params.noiseFreq,
      u_noisePower: props.noisePower ?? defaultPreset.params.noisePower,
      u_seed: props.seed ?? defaultPreset.params.seed,
    };
  }, [props.colorBack, props.colorFront, props.colorStripe1, props.colorStripe2, props.density, props.proportion, props.stripe1, props.stripe2, props.focus, props.noiseFreq, props.noisePower, props.seed]);

  return <ShaderMount {...props} fragmentShader={radialSwirlFragmentShader} uniforms={uniforms} />;
};
