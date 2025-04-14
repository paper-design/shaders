import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  meshGradientFragmentShader,
  ShaderFitOptions,
  type MeshGradientParams,
  type MeshGradientUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface MeshGradientProps extends ShaderComponentProps, MeshGradientParams {}

type MeshGradientPreset = ShaderPreset<MeshGradientParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: MeshGradientPreset = {
  name: 'Default',
  params: {
    // ...defaultObjectSizing,
    speed: 0.15,
    frame: 0,
    color1: 'hsla(259, 29%, 73%, 1)',
    color2: 'hsla(263, 57%, 39%, 1)',
    color3: 'hsla(48, 73%, 84%, 1)',
    color4: 'hsla(295, 32%, 70%, 1)',
  },
};

export const beachPreset: MeshGradientPreset = {
  name: 'Beach',
  params: {
    // ...defaultObjectSizing,
    speed: 0.1,
    frame: 0,
    color1: 'hsla(186, 81%, 83%, 1)',
    color2: 'hsla(198, 55%, 68%, 1)',
    color3: 'hsla(53, 67%, 88%, 1)',
    color4: 'hsla(45, 93%, 73%, 1)',
  },
};

export const fadedPreset: MeshGradientPreset = {
  name: 'Faded',
  params: {
    // ...defaultObjectSizing,
    speed: -0.3,
    frame: 0,
    color1: 'hsla(186, 41%, 90%, 1)',
    color2: 'hsla(208, 71%, 85%, 1)',
    color3: 'hsla(183, 51%, 92%, 1)',
    color4: 'hsla(201, 72%, 90%, 1)',
  },
};

export const meshGradientPresets: MeshGradientPreset[] = [defaultPreset, beachPreset, fadedPreset];

export const MeshGradient: React.FC<MeshGradientProps> = memo(function MeshGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  color3 = defaultPreset.params.color3,
  color4 = defaultPreset.params.color4,

  // Sizing props
  // fit = defaultPreset.params.fit,
  // scale = defaultPreset.params.scale,
  // rotation = defaultPreset.params.rotation,
  // originX = defaultPreset.params.originX,
  // originY = defaultPreset.params.originY,
  // offsetX = defaultPreset.params.offsetX,
  // offsetY = defaultPreset.params.offsetY,
  // worldWidth = defaultPreset.params.worldWidth,
  // worldHeight = defaultPreset.params.worldHeight,
  ...props
}: MeshGradientProps) {
  const uniforms = {
    // Own uniforms
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_color3: getShaderColorFromString(color3),
    u_color4: getShaderColorFromString(color4),

    // Sizing uniforms
    // u_fit: ShaderFitOptions[fit],
    // u_rotation: rotation,
    // u_scale: scale,
    // u_offsetX: offsetX,
    // u_offsetY: offsetY,
    // u_originX: originX,
    // u_originY: originY,
    // u_worldWidth: worldWidth,
    // u_worldHeight: worldHeight,
  } satisfies MeshGradientUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={meshGradientFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
