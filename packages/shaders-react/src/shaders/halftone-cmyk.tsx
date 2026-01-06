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
  HalftoneCmykShapes,
} from '@paper-design/shaders';

export interface HalftoneCmykProps extends ShaderComponentProps, HalftoneCmykParams {}

type HalftoneCmykPreset = ImageShaderPreset<HalftoneCmykParams>;

export const defaultPreset: HalftoneCmykPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    colorBack: '#fbfaf5',
    colorC: '#00b4ff',
    colorM: '#fc519f',
    colorY: '#ffd800',
    colorK: '#231f20',
    size: 0.4,
    contrast: 1,
    softness: 0,
    grainSize: 0.5,
    grainMixer: 0,
    grainOverlay: 0,
    gridNoise: 0.2,
    addonC: 0,
    addonM: 0,
    addonY: 0,
    addonK: 0,
    boostC: 0.2,
    boostM: -0.1,
    boostY: 0,
    boostK: 0,
    shape: 'ink',
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
  addonC = defaultPreset.params.addonC,
  addonM = defaultPreset.params.addonM,
  addonY = defaultPreset.params.addonY,
  addonK = defaultPreset.params.addonK,
  boostC = defaultPreset.params.boostC,
  boostM = defaultPreset.params.boostM,
  boostY = defaultPreset.params.boostY,
  boostK = defaultPreset.params.boostK,
  shape = defaultPreset.params.shape,

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
    u_addonC: addonC,
    u_addonM: addonM,
    u_addonY: addonY,
    u_addonK: addonK,
    u_boostC: boostC,
    u_boostM: boostM,
    u_boostY: boostY,
    u_boostK: boostK,
    u_shape: HalftoneCmykShapes[shape],

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
