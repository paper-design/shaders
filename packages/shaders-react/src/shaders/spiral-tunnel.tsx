import { memo } from 'react';
import {
  ShaderMount,
  type ShaderComponentProps,
} from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  ShaderFitOptions,
  type ShaderPreset,
} from '@paper-design/shaders';
import {
  spiralTunnelFragmentShader,
  spiralTunnelMeta,
  type SpiralTunnelParams,
  type SpiralTunnelUniforms,
} from '@paper-design/shaders';

export interface SpiralTunnelProps
  extends ShaderComponentProps,
    SpiralTunnelParams {}

type SpiralTunnelPreset = ShaderPreset<SpiralTunnelParams>;

// --- Presets --------------------------------------------------------

export const defaultPreset: SpiralTunnelPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,

    // Motion / time
    speed: 1,
    frame: 0,

    // Spiral-tunnel specific params
    fieldOfView: 144,
    luminosity: 10,
    openingSize: 100,
    ribbonCount: 1,
    ribbonWidth: 0.1,
    spiralDensity: 5.6,
    spiralCount: 4,
    lightIntensity: 1.36,
    distortion: 11.04,

    // Color / HSV
    color1: '#00a2fa',
    color2: '#a020f0',
    color3: '#f97316',
    color4: '#22c55e',
    hue: 0,
    saturation: 1,
  },
} as const;

export const fanPreset: SpiralTunnelPreset = {
  name: 'Fan',
  params: {
    ...defaultObjectSizing,

    // Motion / time
    speed: 20,
    frame: 0,

    // Spiral-tunnel specific params
    fieldOfView: 144,
    luminosity: 15,
    openingSize: 100,
    ribbonCount: 6,
    ribbonWidth: 0.1,
    spiralDensity: 5.6,
    spiralCount: 4,
    lightIntensity: 1.36,
    distortion: 3,

    // Color / HSV
    color1: '#00a2fa',
    color2: '#a020f0',
    color3: '#f97316',
    color4: '#22c55e',
    hue: 0,
    saturation: 1,
  },
} as const;

export const tilesPreset: SpiralTunnelPreset = {
  name: 'Tiles',
  params: {
    ...defaultObjectSizing,

    // Motion / time
    speed: 5,
    frame: 0,

    // Spiral-tunnel specific params
    fieldOfView: 132,
    luminosity: 10,
    openingSize: 100,
    ribbonCount: 7,
    ribbonWidth: 0,
    spiralDensity: 0,
    spiralCount: 4,
    lightIntensity: 1.36,
    distortion: 32,

    // Color / HSV
    color1: '#0ccddf',
    color2: '#8c00ff',
    color3: '#ff009d',
    color4: '#77e70d',
    hue: 0,
    saturation: 1,
  },
} as const;

export const chessboardPreset: SpiralTunnelPreset = {
  name: 'Chessboard',
  params: {
    ...defaultObjectSizing,

    // Motion / time
    speed: 3.6,
    frame: 0,

    // Spiral-tunnel specific params
    fieldOfView: 510,
    luminosity: 20,
    openingSize: 15,
    ribbonCount: 10,
    ribbonWidth: 0.3,
    spiralDensity: 12,
    spiralCount: 1,
    lightIntensity: 1.36,
    distortion: 32,

    // Color / HSV
    color1: '#ffffff',
    color2: '#a020f0',
    color3: '#f97316',
    color4: '#22c55e',
    hue: 0,
    saturation: 1,
  },
} as const;

export const wonderlandPreset: SpiralTunnelPreset = {
  name: 'Wonderland',
  params: {
    ...defaultObjectSizing,

    // Motion / time
    speed: 10,
    frame: 0,

    // Spiral-tunnel specific params
    fieldOfView: 120,
    luminosity: 12,
    openingSize: 60,
    ribbonCount: 3,
    ribbonWidth: 0.39,
    spiralDensity: 3.6,
    spiralCount: 2,
    lightIntensity: 1.36,
    distortion: 7.6,

    // Color / HSV
    color1: '#ff0000',
    color2: '#ffffff',
    color3: '#000000',
    color4: '#000000',
    hue: 0,
    saturation: 1,
  },
} as const;

export const singularityPreset: SpiralTunnelPreset = {
  name: 'Singularity',
  params: {
    ...defaultObjectSizing,

    // Motion / time
    speed: 2,
    frame: 0,

    // Spiral-tunnel specific params
    fieldOfView: 144,
    luminosity: 10,
    openingSize: 60,
    ribbonCount: 24,
    ribbonWidth: 0.3,
    spiralDensity: 5.6,
    spiralCount: 8,
    lightIntensity: 1.21,
    distortion: 20,

    // Color / HSV
    color1: '#00a2fa',
    color2: '#a020f0',
    color3: '#f97316',
    color4: '#22c55e',
    hue: 0,
    saturation: 1,
  },
} as const;

export const spiralTunnelPresets: SpiralTunnelPreset[] = [
  defaultPreset,
  fanPreset,
  tilesPreset,
  chessboardPreset,
  wonderlandPreset,
  singularityPreset,
];

// --- Component ------------------------------------------------------

export const SpiralTunnel: React.FC<SpiralTunnelProps> = memo(
  function SpiralTunnelImpl({
    // Own props (motion / time)
    speed = defaultPreset.params.speed,
    frame = defaultPreset.params.frame,

    // Tunnel params
    fieldOfView = defaultPreset.params.fieldOfView,
    luminosity = defaultPreset.params.luminosity,
    openingSize = defaultPreset.params.openingSize,
    ribbonCount = defaultPreset.params.ribbonCount,
    ribbonWidth = defaultPreset.params.ribbonWidth,
    spiralDensity = defaultPreset.params.spiralDensity,
    spiralCount = defaultPreset.params.spiralCount,
    lightIntensity = defaultPreset.params.lightIntensity,
    distortion = defaultPreset.params.distortion,
    hue = defaultPreset.params.hue,
    saturation = defaultPreset.params.saturation,
    color1 = defaultPreset.params.color1,
    color2 = defaultPreset.params.color2,
    color3 = defaultPreset.params.color3,
    color4 = defaultPreset.params.color4,

    // Sizing props
    fit = defaultPreset.params.fit,
    rotation = defaultPreset.params.rotation,
    scale = defaultPreset.params.scale,
    originX = defaultPreset.params.originX,
    originY = defaultPreset.params.originY,
    offsetX = defaultPreset.params.offsetX,
    offsetY = defaultPreset.params.offsetY,
    worldWidth = defaultPreset.params.worldWidth,
    worldHeight = defaultPreset.params.worldHeight,
    ...props
  }: SpiralTunnelProps) {
    const colorStrings = [color1, color2, color3, color4];

    const ucolors = colorStrings
      .slice(0, spiralTunnelMeta.maxcolorCount)
      .map((c) => getShaderColorFromString(c ?? '#000000'));

    const uniforms = {
      // Core uniforms; time is driven by ShaderMount (via speed/frame)
      uResolution: [0, 0] as [number, number],

      // Tunnel-specific uniforms
      uFieldOfView: fieldOfView,
      uLuminosity: luminosity,
      uOpeningSize: openingSize,
      uRibbonCount: ribbonCount,
      uRibbonWidth: ribbonWidth,
      uSpiralDensity: spiralDensity,
      uSpiralCount: spiralCount,
      uLightIntensity: lightIntensity,
      uDistortion: distortion,
      ucolors,
      uHue: hue,
      uSaturation: saturation,

      // Sizing uniforms
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies SpiralTunnelUniforms;

    return (
      <ShaderMount
        {...props}
        speed={speed}
        frame={frame}
        fragmentShader={spiralTunnelFragmentShader}
        uniforms={uniforms}
      />
    );
  },
  colorPropsAreEqual,
);