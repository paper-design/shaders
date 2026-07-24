import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  lensDistortionFragmentShader,
  ShaderFitOptions,
  type LensDistortionUniforms,
  type LensDistortionParams,
  defaultObjectSizing,
  type ImageShaderPreset,
} from '@paper-design/shaders';

export interface LensDistortionProps extends ShaderComponentProps, LensDistortionParams {}

type LensDistortionPreset = ImageShaderPreset<LensDistortionParams>;

export const defaultPreset: LensDistortionPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    spread: 0.55,
    spreadBias: 0.75,
    spreadAngle: 0,
    spreadPerspective: 0.45,
    samples: 24,
    colorRange: 0.2,
    colorShift: 0,
    focusCenter: 0.35,
    focusEdges: 0.9,
    noise: 0,
    noiseFrequency: 0.25,
    noiseOffset: 0,
    lensBulge: 0,
    lensCircle: 0,
    grainMixer: 0,
    grainOverlay: 0,
  },
} as const;

export const fisheyePreset: LensDistortionPreset = {
  name: 'Fisheye',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    spread: 0.7,
    spreadBias: 0.35,
    spreadAngle: 0,
    spreadPerspective: 0.75,
    samples: 10,
    colorRange: 0.4,
    colorShift: 360,
    focusCenter: 0.9,
    focusEdges: 1,
    noise: 0,
    noiseFrequency: 0.25,
    noiseOffset: 0,
    lensBulge: 0.95,
    lensCircle: 1,
    grainMixer: 0,
    grainOverlay: 0,
  },
} as const;

export const duotonePreset: LensDistortionPreset = {
  name: 'Duotone',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    speed: 0,
    frame: 0,
    spread: 0.3,
    spreadBias: -1,
    spreadAngle: 190,
    spreadPerspective: 0,
    samples: 2,
    colorRange: 1,
    colorShift: 176,
    focusCenter: 0,
    focusEdges: 0,
    noise: 0,
    noiseFrequency: 0.25,
    noiseOffset: 0,
    lensBulge: 0,
    lensCircle: 0,
    grainMixer: 0,
    grainOverlay: 0,
  },
} as const;

export const smokePreset: LensDistortionPreset = {
  name: 'Smoke',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    spread: 0.65,
    spreadBias: -1,
    spreadAngle: 0,
    spreadPerspective: 0.4,
    samples: 50,
    colorRange: 1,
    colorShift: 112,
    focusCenter: 0,
    focusEdges: 0.6,
    noise: 1,
    noiseFrequency: 0.35,
    noiseOffset: 9,
    lensBulge: 0,
    lensCircle: 0,
    grainMixer: 0,
    grainOverlay: 0,
  },
} as const;

export const lensDistortionPresets: LensDistortionPreset[] = [defaultPreset, fisheyePreset, duotonePreset, smokePreset];

export const LensDistortion: React.FC<LensDistortionProps> = memo(function LensDistortionImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  spread = defaultPreset.params.spread,
  spreadBias = defaultPreset.params.spreadBias,
  spreadAngle = defaultPreset.params.spreadAngle,
  spreadPerspective = defaultPreset.params.spreadPerspective,
  samples = defaultPreset.params.samples,
  colorRange = defaultPreset.params.colorRange,
  colorShift = defaultPreset.params.colorShift,
  focusCenter = defaultPreset.params.focusCenter,
  focusEdges = defaultPreset.params.focusEdges,
  noise = defaultPreset.params.noise,
  noiseFrequency = defaultPreset.params.noiseFrequency,
  noiseOffset = defaultPreset.params.noiseOffset,
  lensBulge = defaultPreset.params.lensBulge,
  lensCircle = defaultPreset.params.lensCircle,
  grainMixer = defaultPreset.params.grainMixer,
  grainOverlay = defaultPreset.params.grainOverlay,

  // Sizing props
  fit = defaultPreset.params.fit,
  scale = defaultPreset.params.scale,
  rotation = defaultPreset.params.rotation,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: LensDistortionProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_spread: spread,
    u_spreadBias: spreadBias,
    u_spreadAngle: spreadAngle,
    u_spreadPerspective: spreadPerspective,
    u_samples: samples,
    u_colorRange: colorRange,
    u_colorShift: colorShift,
    u_focusCenter: focusCenter,
    u_focusEdges: focusEdges,
    u_noise: noise,
    u_noiseFrequency: noiseFrequency,
    u_noiseOffset: noiseOffset,
    u_lensBulge: lensBulge,
    u_lensCircle: lensCircle,
    u_grainMixer: grainMixer,
    u_grainOverlay: grainOverlay,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_rotation: rotation,
    u_scale: scale,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies LensDistortionUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={lensDistortionFragmentShader}
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
