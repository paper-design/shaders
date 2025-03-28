import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, smokeRingFragmentShader, type SmokeRingUniforms } from '@paper-design/shaders';

export type SmokeRingParams = {
  colorBack?: string;
  colorInner?: string;
  colorOuter?: string;
  scale?: number;
  noiseScale?: number;
  thickness?: number;
} & GlobalParams;

export type SmokeRingProps = Omit<Partial<ShaderMountProps>, 'fragmentShader'> & SmokeRingParams;

type SmokeRingPreset = { name: string; params: Required<SmokeRingParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: SmokeRingPreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 0.5,
    frame: 0,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    colorInner: 'hsla(0, 0%, 100%, 1)',
    colorOuter: 'hsla(223, 15%, 36%, 1)',
    noiseScale: 1,
    thickness: 0.5,
  },
};

export const cloudPreset: SmokeRingPreset = {
  name: 'Cloud',
  params: {
    scale: 1,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(215, 74%, 72%, 1)',
    colorInner: 'hsla(0, 0%, 100%, 1)',
    colorOuter: 'hsla(0, 0%, 100%, 0.5)',
    noiseScale: 1.8,
    thickness: 1,
  },
};

export const firePreset: SmokeRingPreset = {
  name: 'Fire',
  params: {
    scale: 1,
    speed: 4,
    frame: 0,
    colorBack: 'hsla(20, 100%, 5%, 1)',
    colorInner: 'hsla(40, 100%, 50%, 1)',
    colorOuter: 'hsla(0, 100%, 50%, 1)',
    noiseScale: 1.4,
    thickness: 0.35,
  },
};

export const electricPreset: SmokeRingPreset = {
  name: 'Electric',
  params: {
    scale: 1,
    speed: -2.5,
    frame: 0,
    colorBack: 'hsla(47, 50%, 7%, 1)',
    colorInner: 'hsla(47, 100%, 64%, 1)',
    colorOuter: 'hsla(47, 100%, 64%, 1)',
    noiseScale: 1.8,
    thickness: 0.1,
  },
};

export const poisonPreset: SmokeRingPreset = {
  name: 'Poison',
  params: {
    scale: 1,
    speed: 3,
    frame: 0,
    colorBack: 'hsla(120, 100%, 3%, 1)',
    colorInner: 'hsla(120, 100%, 3%, 1)',
    colorOuter: 'hsla(120, 100%, 66%, 1)',
    noiseScale: 5,
    thickness: 0.6,
  },
};

export const smokeRingPresets: SmokeRingPreset[] = [
  defaultPreset,
  cloudPreset,
  firePreset,
  electricPreset,
  poisonPreset,
];

export const SmokeRing = ({
  scale,
  colorBack,
  colorInner,
  colorOuter,
  noiseScale,
  thickness,
  ...props
}: SmokeRingProps): React.ReactElement => {
  const uniforms: SmokeRingUniforms = useMemo(() => {
    return {
      u_scale: scale ?? defaultPreset.params.scale,
      u_colorBack: getShaderColorFromString(colorBack, defaultPreset.params.colorBack),
      u_colorInner: getShaderColorFromString(colorInner, defaultPreset.params.colorInner),
      u_colorOuter: getShaderColorFromString(colorOuter, defaultPreset.params.colorOuter),
      u_noiseScale: noiseScale ?? defaultPreset.params.noiseScale,
      u_thickness: thickness ?? defaultPreset.params.thickness,
    };
  }, [scale, colorBack, colorInner, colorOuter, noiseScale, thickness]);

  return (
    <ShaderMount
      {...props}
      worldFit="cover"
      worldWidth={1000}
      worldHeight={500}
      worldOriginX={0.5}
      worldOriginY={0.5}
      fragmentShader={smokeRingFragmentShader}
      uniforms={uniforms}
    />
  );
};
