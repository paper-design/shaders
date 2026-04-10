import {
  DitheringShapes,
  DitheringTypes,
  DotGridShapes,
  ShaderFitOptions,
  colorPanelsFragmentShader,
  defaultObjectSizing,
  defaultPatternSizing,
  ditheringFragmentShader,
  dotGridFragmentShader,
  getShaderColorFromString,
  staticMeshGradientFragmentShader,
  staticRadialGradientFragmentShader,
  wavesFragmentShader,
  type ColorPanelsParams,
  type ColorPanelsUniforms,
  type DitheringParams,
  type DitheringUniforms,
  type DotGridParams,
  type DotGridUniforms,
  type ShaderPreset,
  type StaticMeshGradientParams,
  type StaticMeshGradientUniforms,
  type StaticRadialGradientParams,
  type StaticRadialGradientUniforms,
  type WavesParams,
  type WavesUniforms,
} from '@paper-design/shaders';
import { createShaderComponent, shaderComponentPropNames } from './create-shader-component.js';
import type { ShaderComponentProps } from './shader-mount.js';

export interface ColorPanelsProps extends ShaderComponentProps, ColorPanelsParams {}

const colorPanelsDefaultPreset: ShaderPreset<ColorPanelsParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 0.5,
    frame: 0,
    colors: ['#ff9d00', '#fd4f30', '#809bff', '#6d2eff', '#333aff', '#f15cff', '#ffd557'],
    colorBack: '#000000',
    angle1: 0,
    angle2: 0,
    length: 1.1,
    edges: false,
    blur: 0,
    fadeIn: 1,
    fadeOut: 0.3,
    gradient: 0,
    density: 3,
    scale: 0.8,
  },
};

const colorPanelsGlassPreset: ShaderPreset<ColorPanelsParams> = {
  name: 'Glass',
  params: {
    ...defaultObjectSizing,
    rotation: 112,
    speed: 1,
    frame: 0,
    colors: ['#00cfff', '#ff2d55', '#34c759', '#af52de'],
    colorBack: '#ffffff00',
    angle1: 0.3,
    angle2: 0.3,
    length: 1,
    edges: true,
    blur: 0.25,
    fadeIn: 0.85,
    fadeOut: 0.3,
    gradient: 0,
    density: 1.6,
  },
};

const colorPanelsGradientPreset: ShaderPreset<ColorPanelsParams> = {
  name: 'Gradient',
  params: {
    ...defaultObjectSizing,
    speed: 0.5,
    frame: 0,
    colors: ['#f2ff00', '#00000000', '#00000000', '#5a0283', '#005eff'],
    colorBack: '#8ffff2',
    angle1: 0.4,
    angle2: 0.4,
    length: 3,
    edges: false,
    blur: 0.5,
    fadeIn: 1,
    fadeOut: 0.39,
    gradient: 0.78,
    density: 1.65,
    scale: 1.72,
    rotation: 270,
    offsetX: 0.18,
  },
};

const colorPanelsOpeningPreset: ShaderPreset<ColorPanelsParams> = {
  name: 'Opening',
  params: {
    ...defaultObjectSizing,
    speed: 2,
    frame: 0,
    colors: ['#00ffff'],
    colorBack: '#570044',
    angle1: -1,
    angle2: -1,
    length: 0.52,
    edges: false,
    blur: 0,
    fadeIn: 0,
    fadeOut: 1,
    gradient: 0,
    density: 2.21,
    scale: 2.32,
    rotation: 360,
    offsetX: -0.3,
    offsetY: 0.6,
  },
};

export const colorPanelsPresets = [
  colorPanelsDefaultPreset,
  colorPanelsGlassPreset,
  colorPanelsGradientPreset,
  colorPanelsOpeningPreset,
] satisfies ShaderPreset<ColorPanelsParams>[];

export const ColorPanels = createShaderComponent<ColorPanelsProps>(
  'ColorPanels',
  shaderComponentPropNames(colorPanelsDefaultPreset.params),
  ({
    speed = colorPanelsDefaultPreset.params.speed,
    frame = colorPanelsDefaultPreset.params.frame,
    colors = colorPanelsDefaultPreset.params.colors,
    colorBack = colorPanelsDefaultPreset.params.colorBack,
    angle1 = colorPanelsDefaultPreset.params.angle1,
    angle2 = colorPanelsDefaultPreset.params.angle2,
    length = colorPanelsDefaultPreset.params.length,
    edges = colorPanelsDefaultPreset.params.edges,
    blur = colorPanelsDefaultPreset.params.blur,
    fadeIn = colorPanelsDefaultPreset.params.fadeIn,
    fadeOut = colorPanelsDefaultPreset.params.fadeOut,
    density = colorPanelsDefaultPreset.params.density,
    gradient = colorPanelsDefaultPreset.params.gradient,
    fit = colorPanelsDefaultPreset.params.fit,
    scale = colorPanelsDefaultPreset.params.scale,
    rotation = colorPanelsDefaultPreset.params.rotation,
    originX = colorPanelsDefaultPreset.params.originX,
    originY = colorPanelsDefaultPreset.params.originY,
    offsetX = colorPanelsDefaultPreset.params.offsetX,
    offsetY = colorPanelsDefaultPreset.params.offsetY,
    worldWidth = colorPanelsDefaultPreset.params.worldWidth,
    worldHeight = colorPanelsDefaultPreset.params.worldHeight,
    ...props
  }: ColorPanelsProps) => {
    const uniforms = {
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_colorBack: getShaderColorFromString(colorBack),
      u_angle1: angle1,
      u_angle2: angle2,
      u_length: length,
      u_edges: edges,
      u_blur: blur,
      u_fadeIn: fadeIn,
      u_fadeOut: fadeOut,
      u_density: density,
      u_gradient: gradient,
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies ColorPanelsUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: colorPanelsFragmentShader,
      uniforms,
    };
  }
);

export interface DitheringProps extends ShaderComponentProps, DitheringParams {
  pxSize?: number;
}

const ditheringDefaultPreset: ShaderPreset<DitheringParams> = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    scale: 0.6,
    colorBack: '#000000',
    colorFront: '#00b2ff',
    shape: 'sphere',
    type: '4x4',
    size: 2,
  },
};

const ditheringSinePreset: ShaderPreset<DitheringParams> = {
  name: 'Sine Wave',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorBack: '#730d54',
    colorFront: '#00becc',
    shape: 'wave',
    type: '4x4',
    size: 11,
    scale: 1.2,
  },
};

const ditheringBugsPreset: ShaderPreset<DitheringParams> = {
  name: 'Bugs',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colorFront: '#008000',
    shape: 'dots',
    type: 'random',
    size: 9,
  },
};

const ditheringRipplePreset: ShaderPreset<DitheringParams> = {
  name: 'Ripple',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#603520',
    colorFront: '#c67953',
    shape: 'ripple',
    type: '2x2',
    size: 3,
  },
};

const ditheringSwirlPreset: ShaderPreset<DitheringParams> = {
  name: 'Swirl',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colorFront: '#47a8e1',
    shape: 'swirl',
    type: '8x8',
    size: 2,
  },
};

const ditheringWarpPreset: ShaderPreset<DitheringParams> = {
  name: 'Warp',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#301c2a',
    colorFront: '#56ae6c',
    shape: 'warp',
    type: '4x4',
    size: 2.5,
  },
};

export const ditheringPresets = [
  ditheringDefaultPreset,
  ditheringWarpPreset,
  ditheringSinePreset,
  ditheringRipplePreset,
  ditheringBugsPreset,
  ditheringSwirlPreset,
] satisfies ShaderPreset<DitheringParams>[];

export const Dithering = createShaderComponent<DitheringProps>(
  'Dithering',
  shaderComponentPropNames(ditheringDefaultPreset.params, ['pxSize']),
  ({
    speed = ditheringDefaultPreset.params.speed,
    frame = ditheringDefaultPreset.params.frame,
    colorBack = ditheringDefaultPreset.params.colorBack,
    colorFront = ditheringDefaultPreset.params.colorFront,
    shape = ditheringDefaultPreset.params.shape,
    type = ditheringDefaultPreset.params.type,
    pxSize,
    size = pxSize === undefined ? ditheringDefaultPreset.params.size : pxSize,
    fit = ditheringDefaultPreset.params.fit,
    scale = ditheringDefaultPreset.params.scale,
    rotation = ditheringDefaultPreset.params.rotation,
    originX = ditheringDefaultPreset.params.originX,
    originY = ditheringDefaultPreset.params.originY,
    offsetX = ditheringDefaultPreset.params.offsetX,
    offsetY = ditheringDefaultPreset.params.offsetY,
    worldWidth = ditheringDefaultPreset.params.worldWidth,
    worldHeight = ditheringDefaultPreset.params.worldHeight,
    ...props
  }: DitheringProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colorFront: getShaderColorFromString(colorFront),
      u_shape: DitheringShapes[shape],
      u_type: DitheringTypes[type],
      u_pxSize: size,
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies DitheringUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: ditheringFragmentShader,
      uniforms,
    };
  }
);

export interface DotGridProps extends ShaderComponentProps, DotGridParams {}

const dotGridDefaultPreset: ShaderPreset<DotGridParams> = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    colorBack: '#000000',
    colorFill: '#ffffff',
    colorStroke: '#ffaa00',
    size: 2,
    gapX: 32,
    gapY: 32,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 0,
    shape: 'circle',
  },
};

const dotGridTrianglesPreset: ShaderPreset<DotGridParams> = {
  name: 'Triangles',
  params: {
    ...defaultPatternSizing,
    colorBack: '#ffffff',
    colorFill: '#ffffff',
    colorStroke: '#808080',
    size: 5,
    gapX: 32,
    gapY: 32,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: 0,
    shape: 'triangle',
  },
};

const dotGridTreeLinePreset: ShaderPreset<DotGridParams> = {
  name: 'Tree line',
  params: {
    ...defaultPatternSizing,
    colorBack: '#f4fce7',
    colorFill: '#052e19',
    colorStroke: '#000000',
    size: 8,
    gapX: 20,
    gapY: 90,
    strokeWidth: 0,
    sizeRange: 1,
    opacityRange: 0.6,
    shape: 'circle',
  },
};

const dotGridWallpaperPreset: ShaderPreset<DotGridParams> = {
  name: 'Wallpaper',
  params: {
    ...defaultPatternSizing,
    colorBack: '#204030',
    colorFill: '#000000',
    colorStroke: '#bd955b',
    size: 9,
    gapX: 32,
    gapY: 32,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: 0,
    shape: 'diamond',
  },
};

export const dotGridPresets = [
  dotGridDefaultPreset,
  dotGridTrianglesPreset,
  dotGridTreeLinePreset,
  dotGridWallpaperPreset,
] satisfies ShaderPreset<DotGridParams>[];

export const DotGrid = createShaderComponent<DotGridProps>(
  'DotGrid',
  shaderComponentPropNames(dotGridDefaultPreset.params),
  ({
    colorBack = dotGridDefaultPreset.params.colorBack,
    colorFill = dotGridDefaultPreset.params.colorFill,
    colorStroke = dotGridDefaultPreset.params.colorStroke,
    size = dotGridDefaultPreset.params.size,
    gapX = dotGridDefaultPreset.params.gapX,
    gapY = dotGridDefaultPreset.params.gapY,
    strokeWidth = dotGridDefaultPreset.params.strokeWidth,
    sizeRange = dotGridDefaultPreset.params.sizeRange,
    opacityRange = dotGridDefaultPreset.params.opacityRange,
    shape = dotGridDefaultPreset.params.shape,
    fit = dotGridDefaultPreset.params.fit,
    scale = dotGridDefaultPreset.params.scale,
    rotation = dotGridDefaultPreset.params.rotation,
    originX = dotGridDefaultPreset.params.originX,
    originY = dotGridDefaultPreset.params.originY,
    offsetX = dotGridDefaultPreset.params.offsetX,
    offsetY = dotGridDefaultPreset.params.offsetY,
    worldWidth = dotGridDefaultPreset.params.worldWidth,
    worldHeight = dotGridDefaultPreset.params.worldHeight,
    maxPixelCount = 6016 * 3384,
    ...props
  }: DotGridProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colorFill: getShaderColorFromString(colorFill),
      u_colorStroke: getShaderColorFromString(colorStroke),
      u_dotSize: size,
      u_gapX: gapX,
      u_gapY: gapY,
      u_strokeWidth: strokeWidth,
      u_sizeRange: sizeRange,
      u_opacityRange: opacityRange,
      u_shape: DotGridShapes[shape],
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies DotGridUniforms;

    return {
      ...props,
      maxPixelCount,
      fragmentShader: dotGridFragmentShader,
      uniforms,
    };
  }
);

export interface StaticMeshGradientProps extends ShaderComponentProps, StaticMeshGradientParams {}

const staticMeshGradientDefaultPreset: ShaderPreset<StaticMeshGradientParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    rotation: 270,
    speed: 0,
    frame: 0,
    colors: ['#ffad0a', '#6200ff', '#e2a3ff', '#ff99fd'],
    positions: 2,
    waveX: 1,
    waveXShift: 0.6,
    waveY: 1,
    waveYShift: 0.21,
    mixing: 0.93,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

const staticMeshGradientSeaPreset: ShaderPreset<StaticMeshGradientParams> = {
  name: 'Sea',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    colors: ['#013b65', '#03738c', '#a3d3ff', '#f2faef'],
    positions: 0,
    waveX: 0.53,
    waveXShift: 0,
    waveY: 0.95,
    waveYShift: 0.64,
    mixing: 0.5,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

const staticMeshGradientSixtiesPreset: ShaderPreset<StaticMeshGradientParams> = {
  name: '1960s',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    colors: ['#000000', '#082400', '#b1aa91', '#8e8c15'],
    positions: 42,
    waveX: 0.45,
    waveXShift: 0,
    waveY: 1,
    waveYShift: 0,
    mixing: 0,
    grainMixer: 0.37,
    grainOverlay: 0.78,
  },
};

const staticMeshGradientSunsetPreset: ShaderPreset<StaticMeshGradientParams> = {
  name: 'Sunset',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    colors: ['#264653', '#9c2b2b', '#f4a261', '#ffffff'],
    positions: 0,
    waveX: 0.6,
    waveXShift: 0.7,
    waveY: 0.7,
    waveYShift: 0.7,
    mixing: 0.5,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const staticMeshGradientPresets = [
  staticMeshGradientDefaultPreset,
  staticMeshGradientSixtiesPreset,
  staticMeshGradientSunsetPreset,
  staticMeshGradientSeaPreset,
] satisfies ShaderPreset<StaticMeshGradientParams>[];

export const StaticMeshGradient = createShaderComponent<StaticMeshGradientProps>(
  'StaticMeshGradient',
  shaderComponentPropNames(staticMeshGradientDefaultPreset.params),
  ({
    speed = staticMeshGradientDefaultPreset.params.speed,
    frame = staticMeshGradientDefaultPreset.params.frame,
    colors = staticMeshGradientDefaultPreset.params.colors,
    positions = staticMeshGradientDefaultPreset.params.positions,
    waveX = staticMeshGradientDefaultPreset.params.waveX,
    waveXShift = staticMeshGradientDefaultPreset.params.waveXShift,
    waveY = staticMeshGradientDefaultPreset.params.waveY,
    waveYShift = staticMeshGradientDefaultPreset.params.waveYShift,
    mixing = staticMeshGradientDefaultPreset.params.mixing,
    grainMixer = staticMeshGradientDefaultPreset.params.grainMixer,
    grainOverlay = staticMeshGradientDefaultPreset.params.grainOverlay,
    fit = staticMeshGradientDefaultPreset.params.fit,
    rotation = staticMeshGradientDefaultPreset.params.rotation,
    scale = staticMeshGradientDefaultPreset.params.scale,
    originX = staticMeshGradientDefaultPreset.params.originX,
    originY = staticMeshGradientDefaultPreset.params.originY,
    offsetX = staticMeshGradientDefaultPreset.params.offsetX,
    offsetY = staticMeshGradientDefaultPreset.params.offsetY,
    worldWidth = staticMeshGradientDefaultPreset.params.worldWidth,
    worldHeight = staticMeshGradientDefaultPreset.params.worldHeight,
    ...props
  }: StaticMeshGradientProps) => {
    const uniforms = {
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_positions: positions,
      u_waveX: waveX,
      u_waveXShift: waveXShift,
      u_waveY: waveY,
      u_waveYShift: waveYShift,
      u_mixing: mixing,
      u_grainMixer: grainMixer,
      u_grainOverlay: grainOverlay,
      u_fit: ShaderFitOptions[fit],
      u_rotation: rotation,
      u_scale: scale,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies StaticMeshGradientUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: staticMeshGradientFragmentShader,
      uniforms,
    };
  }
);

export interface StaticRadialGradientProps extends ShaderComponentProps, StaticRadialGradientParams {}

const staticRadialGradientDefaultPreset: ShaderPreset<StaticRadialGradientParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#000000',
    colors: ['#00bbff', '#00ffe1', '#ffffff'],
    radius: 0.8,
    focalDistance: 0.99,
    focalAngle: 0,
    falloff: 0.24,
    mixing: 0.5,
    distortion: 0,
    distortionShift: 0,
    distortionFreq: 12,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

const staticRadialGradientCrossSectionPreset: ShaderPreset<StaticRadialGradientParams> = {
  name: 'Cross Section',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#3d348b',
    colors: ['#7678ed', '#f7b801', '#f18701', '#37a066'],
    radius: 1,
    focalDistance: 0,
    focalAngle: 0,
    falloff: 0,
    mixing: 0,
    distortion: 1,
    distortionShift: 0,
    distortionFreq: 12,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

const staticRadialGradientRadialPreset: ShaderPreset<StaticRadialGradientParams> = {
  name: 'Radial',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#264653',
    colors: ['#9c2b2b', '#f4a261', '#ffffff'],
    radius: 1,
    focalDistance: 0,
    focalAngle: 0,
    falloff: 0,
    mixing: 1,
    distortion: 0,
    distortionShift: 0,
    distortionFreq: 12,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

const staticRadialGradientLoFiPreset: ShaderPreset<StaticRadialGradientParams> = {
  name: 'Lo-Fi',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    colorBack: '#2e1f27',
    colors: ['#d72638', '#3f88c5', '#f49d37'],
    radius: 1,
    focalDistance: 0,
    focalAngle: 0,
    falloff: 0.9,
    mixing: 0.7,
    distortion: 0,
    distortionShift: 0,
    distortionFreq: 12,
    grainMixer: 1,
    grainOverlay: 0.5,
  },
};

export const staticRadialGradientPresets = [
  staticRadialGradientDefaultPreset,
  staticRadialGradientLoFiPreset,
  staticRadialGradientCrossSectionPreset,
  staticRadialGradientRadialPreset,
] satisfies ShaderPreset<StaticRadialGradientParams>[];

export const StaticRadialGradient = createShaderComponent<StaticRadialGradientProps>(
  'StaticRadialGradient',
  shaderComponentPropNames(staticRadialGradientDefaultPreset.params),
  ({
    speed = staticRadialGradientDefaultPreset.params.speed,
    frame = staticRadialGradientDefaultPreset.params.frame,
    colorBack = staticRadialGradientDefaultPreset.params.colorBack,
    colors = staticRadialGradientDefaultPreset.params.colors,
    radius = staticRadialGradientDefaultPreset.params.radius,
    focalDistance = staticRadialGradientDefaultPreset.params.focalDistance,
    focalAngle = staticRadialGradientDefaultPreset.params.focalAngle,
    falloff = staticRadialGradientDefaultPreset.params.falloff,
    grainMixer = staticRadialGradientDefaultPreset.params.grainMixer,
    mixing = staticRadialGradientDefaultPreset.params.mixing,
    distortion = staticRadialGradientDefaultPreset.params.distortion,
    distortionShift = staticRadialGradientDefaultPreset.params.distortionShift,
    distortionFreq = staticRadialGradientDefaultPreset.params.distortionFreq,
    grainOverlay = staticRadialGradientDefaultPreset.params.grainOverlay,
    fit = staticRadialGradientDefaultPreset.params.fit,
    rotation = staticRadialGradientDefaultPreset.params.rotation,
    scale = staticRadialGradientDefaultPreset.params.scale,
    originX = staticRadialGradientDefaultPreset.params.originX,
    originY = staticRadialGradientDefaultPreset.params.originY,
    offsetX = staticRadialGradientDefaultPreset.params.offsetX,
    offsetY = staticRadialGradientDefaultPreset.params.offsetY,
    worldWidth = staticRadialGradientDefaultPreset.params.worldWidth,
    worldHeight = staticRadialGradientDefaultPreset.params.worldHeight,
    ...props
  }: StaticRadialGradientProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_radius: radius,
      u_focalDistance: focalDistance,
      u_focalAngle: focalAngle,
      u_falloff: falloff,
      u_mixing: mixing,
      u_distortion: distortion,
      u_distortionShift: distortionShift,
      u_distortionFreq: distortionFreq,
      u_grainMixer: grainMixer,
      u_grainOverlay: grainOverlay,
      u_fit: ShaderFitOptions[fit],
      u_rotation: rotation,
      u_scale: scale,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies StaticRadialGradientUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: staticRadialGradientFragmentShader,
      uniforms,
    };
  }
);

export interface WavesProps extends ShaderComponentProps, WavesParams {}

const wavesDefaultPreset: ShaderPreset<WavesParams> = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    scale: 0.6,
    colorFront: '#ffbb00',
    colorBack: '#000000',
    shape: 0,
    frequency: 0.5,
    amplitude: 0.5,
    spacing: 1.2,
    proportion: 0.1,
    softness: 0,
  },
};

const wavesGroovyPreset: ShaderPreset<WavesParams> = {
  name: 'Groovy',
  params: {
    ...defaultPatternSizing,
    scale: 5,
    rotation: 90,
    colorFront: '#fcfcee',
    colorBack: '#ff896b',
    shape: 3,
    frequency: 0.2,
    amplitude: 0.25,
    spacing: 1.17,
    proportion: 0.57,
    softness: 0,
  },
};

const wavesTangledUpPreset: ShaderPreset<WavesParams> = {
  name: 'Tangled up',
  params: {
    ...defaultPatternSizing,
    scale: 0.5,
    rotation: 0,
    colorFront: '#133a41',
    colorBack: '#c2d8b6',
    shape: 2.07,
    frequency: 0.44,
    amplitude: 0.57,
    spacing: 1.05,
    proportion: 0.75,
    softness: 0,
  },
};

const wavesWaveRidePreset: ShaderPreset<WavesParams> = {
  name: 'Ride the wave',
  params: {
    ...defaultPatternSizing,
    scale: 1.7,
    rotation: 0,
    colorFront: '#fdffe6',
    colorBack: '#1f1f1f',
    shape: 2.25,
    frequency: 0.2,
    amplitude: 1,
    spacing: 1.25,
    proportion: 1,
    softness: 0,
  },
};

export const wavesPresets = [
  wavesDefaultPreset,
  wavesGroovyPreset,
  wavesTangledUpPreset,
  wavesWaveRidePreset,
] satisfies ShaderPreset<WavesParams>[];

export const Waves = createShaderComponent<WavesProps>(
  'Waves',
  shaderComponentPropNames(wavesDefaultPreset.params),
  ({
    colorFront = wavesDefaultPreset.params.colorFront,
    colorBack = wavesDefaultPreset.params.colorBack,
    shape = wavesDefaultPreset.params.shape,
    frequency = wavesDefaultPreset.params.frequency,
    amplitude = wavesDefaultPreset.params.amplitude,
    spacing = wavesDefaultPreset.params.spacing,
    proportion = wavesDefaultPreset.params.proportion,
    softness = wavesDefaultPreset.params.softness,
    fit = wavesDefaultPreset.params.fit,
    scale = wavesDefaultPreset.params.scale,
    rotation = wavesDefaultPreset.params.rotation,
    offsetX = wavesDefaultPreset.params.offsetX,
    offsetY = wavesDefaultPreset.params.offsetY,
    originX = wavesDefaultPreset.params.originX,
    originY = wavesDefaultPreset.params.originY,
    worldWidth = wavesDefaultPreset.params.worldWidth,
    worldHeight = wavesDefaultPreset.params.worldHeight,
    maxPixelCount = 6016 * 3384,
    ...props
  }: WavesProps) => {
    const uniforms = {
      u_colorFront: getShaderColorFromString(colorFront),
      u_colorBack: getShaderColorFromString(colorBack),
      u_shape: shape,
      u_frequency: frequency,
      u_amplitude: amplitude,
      u_spacing: spacing,
      u_proportion: proportion,
      u_softness: softness,
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies WavesUniforms;

    return {
      ...props,
      maxPixelCount,
      fragmentShader: wavesFragmentShader,
      uniforms,
    };
  }
);
