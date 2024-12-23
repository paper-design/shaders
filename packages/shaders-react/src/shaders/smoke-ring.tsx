import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, smokeRingFragmentShader, type SmokeRingUniforms } from '@paper-design/shaders';

export type SmokeRingParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  noiseScale?: number;
  thickness?: number;
} & GlobalParams;

export type SmokeRingProps = Omit<ShaderMountProps, 'fragmentShader'> & SmokeRingParams;

type SmokeRingPreset = { name: string; params: Required<SmokeRingParams> };

export const defaultPreset: SmokeRingPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(208, 54%, 7%, 1)',
    color1: 'hsla(0, 0%, 100%, 1)',
    color2: 'hsla(211, 100%, 64%, 1)',
    speed: 1,
    noiseScale: 1.4,
    thickness: 0.33,
    seed: 0,
  },
} as const;

export const cloudPreset: SmokeRingPreset = {
  name: 'Cloud',
  params: {
    colorBack: 'hsla(218, 100%, 62%)',
    color1: 'hsla(0, 0%, 100%)',
    color2: 'hsla(0, 0%, 100%)',
    speed: 1,
    thickness: 0.7,
    noiseScale: 1.8,
    seed: 0,
  },
};

export const firePreset: SmokeRingPreset = {
  name: 'Fire',
  params: {
    colorBack: 'hsla(20, 100%, 5%)',
    color1: 'hsla(40, 100%, 50%)',
    color2: 'hsla(0, 100%, 50%)',
    speed: 4,
    thickness: 0.35,
    noiseScale: 1.4,
    seed: 0,
  },
};

export const electricPreset: SmokeRingPreset = {
  name: 'Electric',
  params: {
    colorBack: 'hsla(47, 50%, 7%)',
    color1: 'hsla(47, 100%, 64%)',
    color2: 'hsla(47, 100%, 64%)',
    speed: 2.5,
    thickness: 0.1,
    noiseScale: 1.8,
    seed: 0,
  },
};

export const poisonPreset: SmokeRingPreset = {
  name: 'Poison',
  params: {
    colorBack: 'hsla(120, 100%, 3%)',
    color1: 'hsla(120, 100%, 3%)',
    color2: 'hsla(120, 100%, 66%)',
    speed: 3,
    thickness: 0.6,
    noiseScale: 5,
    seed: 0,
  },
};

export const smokeRingPresets: SmokeRingPreset[] = [
  defaultPreset,
  cloudPreset,
  firePreset,
  electricPreset,
  poisonPreset,
];

export const SmokeRing = (props: SmokeRingProps): JSX.Element => {
  const uniforms: SmokeRingUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_speed: props.speed ?? defaultPreset.params.speed,
      u_scale: props.noiseScale ?? defaultPreset.params.noiseScale,
      u_thickness: props.thickness ?? defaultPreset.params.thickness,
      u_seed: props.seed ?? defaultPreset.params.seed,
    };
  }, [props.colorBack, props.color1, props.color2, props.speed, props.noiseScale, props.thickness, props.seed]);

  return <ShaderMount {...props} fragmentShader={smokeRingFragmentShader} uniforms={uniforms} />;
};
