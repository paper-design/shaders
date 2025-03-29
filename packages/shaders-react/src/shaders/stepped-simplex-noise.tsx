import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  steppedSimplexNoiseFragmentShader,
  type SteppedSimplexNoiseUniforms,
} from '@paper-design/shaders';

export type SteppedSimplexNoiseParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  color5?: string;
  stepsNumber?: number;
} & GlobalParams;

export type SteppedSimplexNoiseProps = Omit<Partial<ShaderMountProps>, 'fragmentShader'> & SteppedSimplexNoiseParams;

type SteppedSimplexNoisePreset = {
  name: string;
  params: Required<SteppedSimplexNoiseParams>;
  style?: React.CSSProperties;
};

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: SteppedSimplexNoisePreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 0.15,
    frame: 0,
    color1: 'hsla(208, 25%, 45%, 1)',
    color2: 'hsla(94, 38%, 59%, 1)',
    color3: 'hsla(359, 94%, 62%, 1)',
    color4: 'hsla(42, 93%, 64%, 1)',
    color5: 'hsla(0, 0%, 100%, 1)',
    stepsNumber: 13,
  },
};

const magmaPreset: SteppedSimplexNoisePreset = {
  name: 'Magma',
  params: {
    scale: 0.3,
    speed: 0.2,
    frame: 0,
    color1: 'hsla(0, 100%, 36%, 1)',
    color2: 'hsla(0, 95%, 44%, 1)',
    color3: 'hsla(20, 100%, 49%, 1)',
    color4: 'hsla(45, 100%, 45%, 1)',
    color5: 'hsla(31, 100%, 94%, 1)',
    stepsNumber: 8,
  },
};

const bloodCellPreset: SteppedSimplexNoisePreset = {
  name: 'Blood cell',
  params: {
    scale: 1.2,
    speed: 0.22,
    frame: 0,
    color1: 'hsla(302, 43%, 13%, 1)',
    color2: 'hsla(325, 93%, 17%, 1)',
    color3: 'hsla(338, 80%, 25%, 1)',
    color4: 'hsla(338, 80%, 25%, 1)',
    color5: 'hsla(2, 85%, 72%, 1)',
    stepsNumber: 29,
  },
};

const firstContactPreset: SteppedSimplexNoisePreset = {
  name: 'First contact',
  params: {
    scale: 1.2,
    speed: -0.1,
    frame: 0,
    color1: 'hsla(300, 43%, 82%, 1)',
    color2: 'hsla(266, 70%, 9%, 1)',
    color3: 'hsla(289, 36%, 26%, 1)',
    color4: 'hsla(0, 41%, 78%, 1)',
    color5: 'hsla(0, 100%, 96%, 1)',
    stepsNumber: 40,
  },
};

export const steppedSimplexNoisePresets: SteppedSimplexNoisePreset[] = [
  defaultPreset,
  magmaPreset,
  bloodCellPreset,
  firstContactPreset,
];

export const SteppedSimplexNoise = ({
  scale,
  color1,
  color2,
  color3,
  color4,
  color5,
  stepsNumber,
  worldFit = 'cover',
  worldWidth = 1,
  worldHeight = 1,
  ...props
}: SteppedSimplexNoiseProps): React.ReactElement => {
  const uniforms: SteppedSimplexNoiseUniforms = useMemo(() => {
    return {
      u_scale: scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(color4, defaultPreset.params.color4),
      u_color5: getShaderColorFromString(color5, defaultPreset.params.color5),
      u_steps_number: stepsNumber ?? defaultPreset.params.stepsNumber,
    };
  }, [scale, color1, color2, color3, color4, color5, stepsNumber]);

  return (
    <ShaderMount
      {...props}
      worldFit={worldFit}
      worldWidth={worldWidth}
      worldHeight={worldHeight}
      fragmentShader={steppedSimplexNoiseFragmentShader}
      uniforms={uniforms}
    />
  );
};
