import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  halftoneCmykFragmentShader,
  getShaderColorFromString,
  getShaderNoiseTexture,
  ShaderFitOptions,
  type HalftoneCmykUniforms,
  type HalftoneCmykParams,
  defaultObjectSizing,
  type ImageShaderPreset,
  HalftoneCmykTypes,
} from '@paper-design/shaders';

export interface HalftoneCmykProps extends ShaderComponentProps, HalftoneCmykParams {}

type HalftoneCmykPreset = ImageShaderPreset<HalftoneCmykParams>;

export const defaultPreset: HalftoneCmykPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#ffffff',
    colorC: '#00ffff',
    colorM: '#ff00ff',
    colorY: '#ffff00',
    colorK: '#000000',
    size: 0.98,
    contrast: 1,
    softness: 0,
    grainSize: 0.5,
    grainMixer: 0,
    grainOverlay: 0,
    gridNoise: 0,
    floodC: 0,
    floodM: 0,
    floodY: 0,
    floodK: 0,
    gainC: 0,
    gainM: 0,
    gainY: 0,
    gainK: 0,
    type: 'ink',
  },
};


export const halftoneCmykPresets: HalftoneCmykPreset[] = [defaultPreset];

export const HalftoneCmyk: React.FC<HalftoneCmykProps> = memo(function HalftoneCmykImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorC = defaultPreset.params.colorC,
  colorM = defaultPreset.params.colorM,
  colorY = defaultPreset.params.colorY,
  colorK = defaultPreset.params.colorK,
  image = '',
  size = defaultPreset.params.size,
  contrast = defaultPreset.params.contrast,
  softness = defaultPreset.params.softness,
  grainSize = defaultPreset.params.grainSize,
  grainMixer = defaultPreset.params.grainMixer,
  grainOverlay = defaultPreset.params.grainOverlay,
  gridNoise = defaultPreset.params.gridNoise,
  floodC = defaultPreset.params.floodC,
  floodM = defaultPreset.params.floodM,
  floodY = defaultPreset.params.floodY,
  floodK = defaultPreset.params.floodK,
  gainC = defaultPreset.params.gainC,
  gainM = defaultPreset.params.gainM,
  gainY = defaultPreset.params.gainY,
  gainK = defaultPreset.params.gainK,
  type = defaultPreset.params.type,

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
}: HalftoneCmykProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_noiseTexture: getShaderNoiseTexture(),
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorC: getShaderColorFromString(colorC),
    u_colorM: getShaderColorFromString(colorM),
    u_colorY: getShaderColorFromString(colorY),
    u_colorK: getShaderColorFromString(colorK),
    u_size: size,
    u_contrast: contrast,
    u_softness: softness,
    u_grainSize: grainSize,
    u_grainMixer: grainMixer,
    u_grainOverlay: grainOverlay,
    u_gridNoise: gridNoise,
    u_floodC: floodC,
    u_floodM: floodM,
    u_floodY: floodY,
    u_floodK: floodK,
    u_gainC: gainC,
    u_gainM: gainM,
    u_gainY: gainY,
    u_gainK: gainK,
    u_type: HalftoneCmykTypes[type],

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
  } satisfies HalftoneCmykUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={halftoneCmykFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
