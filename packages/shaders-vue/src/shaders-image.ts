import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  DitheringTypes,
  GlassDistortionShapes,
  GlassGridShapes,
  HalftoneCmykTypes,
  HalftoneDotsGrids,
  HalftoneDotsTypes,
  LiquidMetalShapes,
  ShaderFitOptions,
  defaultObjectSizing,
  flutedGlassFragmentShader,
  getShaderColorFromString,
  getShaderNoiseTexture,
  halftoneCmykFragmentShader,
  halftoneDotsFragmentShader,
  heatmapFragmentShader,
  imageDitheringFragmentShader,
  liquidMetalFragmentShader,
  paperTextureFragmentShader,
  toProcessedHeatmap,
  toProcessedLiquidMetal,
  waterFragmentShader,
  type FlutedGlassParams,
  type FlutedGlassUniforms,
  type HalftoneCmykParams,
  type HalftoneCmykUniforms,
  type HalftoneDotsParams,
  type HalftoneDotsUniforms,
  type HeatmapParams,
  type HeatmapUniforms,
  type ImageDitheringParams,
  type ImageDitheringUniforms,
  type ImageShaderPreset,
  type LiquidMetalParams,
  type LiquidMetalUniforms,
  type PaperTextureParams,
  type PaperTextureUniforms,
  type WaterParams,
  type WaterUniforms,
} from '@paper-design/shaders';
import { createShaderComponent, shaderComponentPropNames } from './create-shader-component.js';
import { ShaderMount } from './shader-mount.js';
import type { ShaderComponentProps } from './shader-mount.js';

const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

function toImageUrl(image: string | HTMLImageElement | undefined): string {
  if (typeof image === 'string') {
    return image;
  }

  return image?.src ?? '';
}

function useProcessedImage(
  getImageUrl: () => string,
  label: string,
  process: (imageUrl: string) => Promise<Blob>
) {
  const processedImage = ref<string>(transparentPixel);
  let currentObjectUrl: string | null = null;
  let requestId = 0;
  let stopWatcher: (() => void) | undefined;

  const revokeCurrentUrl = (): void => {
    if (currentObjectUrl !== null) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  };

  onMounted(() => {
    stopWatcher = watch(
      getImageUrl,
      async (imageUrl) => {
        const currentRequestId = ++requestId;
        revokeCurrentUrl();

        if (!imageUrl) {
          processedImage.value = transparentPixel;
          return;
        }

        try {
          const objectUrl = URL.createObjectURL(await process(imageUrl));

          if (currentRequestId !== requestId) {
            URL.revokeObjectURL(objectUrl);
            return;
          }

          currentObjectUrl = objectUrl;
          processedImage.value = objectUrl;
        } catch (error) {
          if (currentRequestId === requestId) {
            processedImage.value = transparentPixel;
          }

          console.error(`Could not process ${label} image`, error);
        }
      },
      { immediate: true }
    );
  });

  onBeforeUnmount(() => {
    requestId += 1;
    stopWatcher?.();
    revokeCurrentUrl();
  });

  return processedImage;
}

export interface FlutedGlassProps extends ShaderComponentProps, FlutedGlassParams {
  count?: number;
}

const flutedGlassDefaultPreset: ImageShaderPreset<FlutedGlassParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#00000000',
    colorShadow: '#000000',
    colorHighlight: '#ffffff',
    shadows: 0.25,
    size: 0.5,
    angle: 0,
    distortionShape: 'prism',
    highlights: 0.1,
    shape: 'lines',
    distortion: 0.5,
    shift: 0,
    blur: 0,
    edges: 0.25,
    stretch: 0,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

const flutedGlassWavesPreset: ImageShaderPreset<FlutedGlassParams> = {
  name: 'Waves',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 1.2,
    speed: 0,
    frame: 0,
    colorBack: '#00000000',
    colorShadow: '#000000',
    colorHighlight: '#ffffff',
    shadows: 0,
    size: 0.9,
    angle: 0,
    distortionShape: 'contour',
    highlights: 0,
    shape: 'wave',
    distortion: 0.5,
    shift: 0,
    blur: 0.1,
    edges: 0.5,
    stretch: 1,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    grainMixer: 0,
    grainOverlay: 0.05,
  },
};

const flutedGlassAbstractPreset: ImageShaderPreset<FlutedGlassParams> = {
  name: 'Abstract',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 4,
    speed: 0,
    frame: 0,
    colorBack: '#00000000',
    colorShadow: '#000000',
    colorHighlight: '#ffffff',
    shadows: 0,
    size: 0.7,
    angle: 30,
    distortionShape: 'flat',
    highlights: 0,
    shape: 'linesIrregular',
    distortion: 1,
    shift: 0,
    blur: 1,
    edges: 0.5,
    stretch: 1,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    grainMixer: 0.1,
    grainOverlay: 0.1,
  },
};

const flutedGlassFoldsPreset: ImageShaderPreset<FlutedGlassParams> = {
  name: 'Folds',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#00000000',
    colorShadow: '#000000',
    colorHighlight: '#ffffff',
    shadows: 0.4,
    size: 0.4,
    angle: 0,
    distortionShape: 'cascade',
    highlights: 0,
    shape: 'lines',
    distortion: 0.75,
    shift: 0,
    blur: 0.25,
    edges: 0.5,
    stretch: 0,
    margin: 0.1,
    marginLeft: 0.1,
    marginRight: 0.1,
    marginTop: 0.1,
    marginBottom: 0.1,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const flutedGlassPresets = [
  flutedGlassDefaultPreset,
  flutedGlassAbstractPreset,
  flutedGlassWavesPreset,
  flutedGlassFoldsPreset,
] satisfies ImageShaderPreset<FlutedGlassParams>[];

export const FlutedGlass = createShaderComponent<FlutedGlassProps>(
  'FlutedGlass',
  shaderComponentPropNames(flutedGlassDefaultPreset.params, ['count']),
  ({
    speed = flutedGlassDefaultPreset.params.speed,
    frame = flutedGlassDefaultPreset.params.frame,
    colorBack = flutedGlassDefaultPreset.params.colorBack,
    colorShadow = flutedGlassDefaultPreset.params.colorShadow,
    colorHighlight = flutedGlassDefaultPreset.params.colorHighlight,
    image = '',
    shadows = flutedGlassDefaultPreset.params.shadows,
    angle = flutedGlassDefaultPreset.params.angle,
    distortion = flutedGlassDefaultPreset.params.distortion,
    distortionShape = flutedGlassDefaultPreset.params.distortionShape,
    highlights = flutedGlassDefaultPreset.params.highlights,
    shape = flutedGlassDefaultPreset.params.shape,
    shift = flutedGlassDefaultPreset.params.shift,
    blur = flutedGlassDefaultPreset.params.blur,
    edges = flutedGlassDefaultPreset.params.edges,
    margin,
    marginLeft = margin ?? flutedGlassDefaultPreset.params.marginLeft,
    marginRight = margin ?? flutedGlassDefaultPreset.params.marginRight,
    marginTop = margin ?? flutedGlassDefaultPreset.params.marginTop,
    marginBottom = margin ?? flutedGlassDefaultPreset.params.marginBottom,
    grainMixer = flutedGlassDefaultPreset.params.grainMixer,
    grainOverlay = flutedGlassDefaultPreset.params.grainOverlay,
    stretch = flutedGlassDefaultPreset.params.stretch,
    count,
    size = count === undefined ? flutedGlassDefaultPreset.params.size : Math.pow(1 / (count * 1.6), 1 / 6) / 0.7 - 0.5,
    fit = flutedGlassDefaultPreset.params.fit,
    scale = flutedGlassDefaultPreset.params.scale,
    rotation = flutedGlassDefaultPreset.params.rotation,
    originX = flutedGlassDefaultPreset.params.originX,
    originY = flutedGlassDefaultPreset.params.originY,
    offsetX = flutedGlassDefaultPreset.params.offsetX,
    offsetY = flutedGlassDefaultPreset.params.offsetY,
    worldWidth = flutedGlassDefaultPreset.params.worldWidth,
    worldHeight = flutedGlassDefaultPreset.params.worldHeight,
    ...props
  }: FlutedGlassProps) => {
    const uniforms = {
      u_image: image,
      u_colorBack: getShaderColorFromString(colorBack),
      u_colorShadow: getShaderColorFromString(colorShadow),
      u_colorHighlight: getShaderColorFromString(colorHighlight),
      u_shadows: shadows,
      u_size: size,
      u_angle: angle,
      u_distortion: distortion,
      u_shift: shift,
      u_blur: blur,
      u_edges: edges,
      u_stretch: stretch,
      u_distortionShape: GlassDistortionShapes[distortionShape],
      u_highlights: highlights,
      u_shape: GlassGridShapes[shape],
      u_marginLeft: marginLeft,
      u_marginRight: marginRight,
      u_marginTop: marginTop,
      u_marginBottom: marginBottom,
      u_grainMixer: grainMixer,
      u_grainOverlay: grainOverlay,
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies FlutedGlassUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: flutedGlassFragmentShader,
      mipmaps: ['u_image'],
      uniforms,
    };
  }
);

export interface PaperTextureProps extends ShaderComponentProps, PaperTextureParams {
  fiberScale?: number;
  crumplesScale?: number;
  foldsNumber?: number;
  blur?: number;
}

const paperTextureDefaultPreset: ImageShaderPreset<PaperTextureParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 0.6,
    speed: 0,
    frame: 0,
    colorFront: '#9fadbc',
    colorBack: '#ffffff',
    contrast: 0.3,
    roughness: 0.4,
    fiber: 0.3,
    fiberSize: 0.2,
    crumples: 0.3,
    crumpleSize: 0.35,
    folds: 0.65,
    foldCount: 5,
    fade: 0,
    drops: 0.2,
    seed: 5.8,
  },
};

const paperTextureAbstractPreset: ImageShaderPreset<PaperTextureParams> = {
  name: 'Abstract',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    scale: 0.6,
    colorFront: '#00eeff',
    colorBack: '#ff0a81',
    contrast: 0.85,
    roughness: 0,
    fiber: 0.1,
    fiberSize: 0.2,
    crumples: 0,
    crumpleSize: 0.3,
    folds: 1,
    foldCount: 3,
    fade: 0,
    drops: 0.2,
    seed: 2.2,
  },
};

const paperTextureCardboardPreset: ImageShaderPreset<PaperTextureParams> = {
  name: 'Cardboard',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    scale: 0.6,
    colorFront: '#c7b89e',
    colorBack: '#999180',
    contrast: 0.4,
    roughness: 0,
    fiber: 0.35,
    fiberSize: 0.14,
    crumples: 0.7,
    crumpleSize: 0.1,
    folds: 0,
    foldCount: 1,
    fade: 0,
    drops: 0.1,
    seed: 1.6,
  },
};

const paperTextureDetailsPreset: ImageShaderPreset<PaperTextureParams> = {
  name: 'Details',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    fit: 'cover',
    scale: 3,
    colorFront: '#00000000',
    colorBack: '#00000000',
    contrast: 0,
    roughness: 1,
    fiber: 0.27,
    fiberSize: 0.22,
    crumples: 1,
    crumpleSize: 0.5,
    folds: 1,
    foldCount: 15,
    fade: 0,
    drops: 0,
    seed: 6,
  },
};

export const paperTexturePresets = [
  paperTextureDefaultPreset,
  paperTextureCardboardPreset,
  paperTextureAbstractPreset,
  paperTextureDetailsPreset,
] satisfies ImageShaderPreset<PaperTextureParams>[];

export const PaperTexture = createShaderComponent<PaperTextureProps>(
  'PaperTexture',
  shaderComponentPropNames(paperTextureDefaultPreset.params, ['fiberScale', 'crumplesScale', 'foldsNumber', 'blur']),
  ({
    speed = paperTextureDefaultPreset.params.speed,
    frame = paperTextureDefaultPreset.params.frame,
    colorFront = paperTextureDefaultPreset.params.colorFront,
    colorBack = paperTextureDefaultPreset.params.colorBack,
    image = '',
    contrast = paperTextureDefaultPreset.params.contrast,
    roughness = paperTextureDefaultPreset.params.roughness,
    fiber = paperTextureDefaultPreset.params.fiber,
    crumples = paperTextureDefaultPreset.params.crumples,
    folds = paperTextureDefaultPreset.params.folds,
    drops = paperTextureDefaultPreset.params.drops,
    seed = paperTextureDefaultPreset.params.seed,
    fiberScale,
    fiberSize = fiberScale === undefined ? paperTextureDefaultPreset.params.fiberSize : 0.2 / fiberScale,
    crumplesScale,
    crumpleSize = crumplesScale === undefined ? paperTextureDefaultPreset.params.crumpleSize : 0.2 / crumplesScale,
    blur,
    fade = blur === undefined ? paperTextureDefaultPreset.params.fade : blur,
    foldsNumber,
    foldCount = foldsNumber === undefined ? paperTextureDefaultPreset.params.foldCount : foldsNumber,
    fit = paperTextureDefaultPreset.params.fit,
    scale = paperTextureDefaultPreset.params.scale,
    rotation = paperTextureDefaultPreset.params.rotation,
    originX = paperTextureDefaultPreset.params.originX,
    originY = paperTextureDefaultPreset.params.originY,
    offsetX = paperTextureDefaultPreset.params.offsetX,
    offsetY = paperTextureDefaultPreset.params.offsetY,
    worldWidth = paperTextureDefaultPreset.params.worldWidth,
    worldHeight = paperTextureDefaultPreset.params.worldHeight,
    ...props
  }: PaperTextureProps) => {
    const noiseTexture = typeof window !== 'undefined' ? { u_noiseTexture: getShaderNoiseTexture() } : {};

    const uniforms = {
      u_image: image,
      u_colorFront: getShaderColorFromString(colorFront),
      u_colorBack: getShaderColorFromString(colorBack),
      u_contrast: contrast,
      u_roughness: roughness,
      u_fiber: fiber,
      u_fiberSize: fiberSize,
      u_crumples: crumples,
      u_crumpleSize: crumpleSize,
      u_foldCount: foldCount,
      u_folds: folds,
      u_fade: fade,
      u_drops: drops,
      u_seed: seed,
      ...noiseTexture,
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies PaperTextureUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: paperTextureFragmentShader,
      mipmaps: ['u_image'],
      uniforms,
    };
  }
);

export interface WaterProps extends ShaderComponentProps, WaterParams {
  effectScale?: number;
}

const waterDefaultPreset: ImageShaderPreset<WaterParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 1,
    frame: 0,
    colorBack: '#909090',
    colorHighlight: '#ffffff',
    highlights: 0.07,
    layering: 0.5,
    edges: 0.8,
    waves: 0.3,
    caustic: 0.1,
    size: 1,
  },
};

const waterAbstractPreset: ImageShaderPreset<WaterParams> = {
  name: 'Abstract',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 3,
    speed: 1,
    frame: 0,
    colorBack: '#909090',
    colorHighlight: '#ffffff',
    highlights: 0,
    layering: 0,
    edges: 1,
    waves: 1,
    caustic: 0.4,
    size: 0.15,
  },
};

const waterStreamingPreset: ImageShaderPreset<WaterParams> = {
  name: 'Streaming',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    scale: 0.4,
    speed: 2,
    frame: 0,
    colorBack: '#909090',
    colorHighlight: '#ffffff',
    highlights: 0,
    layering: 0,
    edges: 0,
    waves: 0.5,
    caustic: 0,
    size: 0.5,
  },
};

const waterSlowMoPreset: ImageShaderPreset<WaterParams> = {
  name: 'Slow-mo',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 1,
    speed: 0.1,
    frame: 0,
    colorBack: '#909090',
    colorHighlight: '#ffffff',
    highlights: 0.4,
    layering: 0,
    edges: 0,
    waves: 0,
    caustic: 0.2,
    size: 0.7,
  },
};

export const waterPresets = [
  waterDefaultPreset,
  waterSlowMoPreset,
  waterAbstractPreset,
  waterStreamingPreset,
] satisfies ImageShaderPreset<WaterParams>[];

export const Water = createShaderComponent<WaterProps>(
  'Water',
  shaderComponentPropNames(waterDefaultPreset.params, ['effectScale']),
  ({
    speed = waterDefaultPreset.params.speed,
    frame = waterDefaultPreset.params.frame,
    colorBack = waterDefaultPreset.params.colorBack,
    colorHighlight = waterDefaultPreset.params.colorHighlight,
    image = '',
    highlights = waterDefaultPreset.params.highlights,
    layering = waterDefaultPreset.params.layering,
    waves = waterDefaultPreset.params.waves,
    edges = waterDefaultPreset.params.edges,
    caustic = waterDefaultPreset.params.caustic,
    effectScale,
    size = effectScale === undefined ? waterDefaultPreset.params.size : 10 / 9 / effectScale - 1 / 9,
    fit = waterDefaultPreset.params.fit,
    scale = waterDefaultPreset.params.scale,
    rotation = waterDefaultPreset.params.rotation,
    originX = waterDefaultPreset.params.originX,
    originY = waterDefaultPreset.params.originY,
    offsetX = waterDefaultPreset.params.offsetX,
    offsetY = waterDefaultPreset.params.offsetY,
    worldWidth = waterDefaultPreset.params.worldWidth,
    worldHeight = waterDefaultPreset.params.worldHeight,
    ...props
  }: WaterProps) => {
    const uniforms = {
      u_image: image,
      u_colorBack: getShaderColorFromString(colorBack),
      u_colorHighlight: getShaderColorFromString(colorHighlight),
      u_highlights: highlights,
      u_layering: layering,
      u_waves: waves,
      u_edges: edges,
      u_caustic: caustic,
      u_size: size,
      u_fit: ShaderFitOptions[fit],
      u_rotation: rotation,
      u_scale: scale,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies WaterUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: waterFragmentShader,
      mipmaps: ['u_image'],
      uniforms,
    };
  }
);

export interface ImageDitheringProps extends ShaderComponentProps, ImageDitheringParams {
  pxSize?: number;
}

const imageDitheringDefaultPreset: ImageShaderPreset<ImageDitheringParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorFront: '#94ffaf',
    colorBack: '#000c38',
    colorHighlight: '#eaff94',
    type: '8x8',
    size: 2,
    colorSteps: 2,
    originalColors: false,
    inverted: false,
  },
};

const imageDitheringRetroPreset: ImageShaderPreset<ImageDitheringParams> = {
  name: 'Retro',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorFront: '#eeeeee',
    colorBack: '#5452ff',
    colorHighlight: '#eeeeee',
    type: '2x2',
    size: 3,
    colorSteps: 1,
    originalColors: true,
    inverted: false,
  },
};

const imageDitheringNoisePreset: ImageShaderPreset<ImageDitheringParams> = {
  name: 'Noise',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorFront: '#a2997c',
    colorBack: '#000000',
    colorHighlight: '#ededed',
    type: 'random',
    size: 1,
    colorSteps: 1,
    originalColors: false,
    inverted: false,
  },
};

const imageDitheringNaturalPreset: ImageShaderPreset<ImageDitheringParams> = {
  name: 'Natural',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorFront: '#ffffff',
    colorBack: '#000000',
    colorHighlight: '#ffffff',
    type: '8x8',
    size: 2,
    colorSteps: 5,
    originalColors: true,
    inverted: false,
  },
};

export const imageDitheringPresets = [
  imageDitheringDefaultPreset,
  imageDitheringNoisePreset,
  imageDitheringRetroPreset,
  imageDitheringNaturalPreset,
] satisfies ImageShaderPreset<ImageDitheringParams>[];

export const ImageDithering = createShaderComponent<ImageDitheringProps>(
  'ImageDithering',
  shaderComponentPropNames(imageDitheringDefaultPreset.params, ['pxSize']),
  ({
    speed = imageDitheringDefaultPreset.params.speed,
    frame = imageDitheringDefaultPreset.params.frame,
    colorFront = imageDitheringDefaultPreset.params.colorFront,
    colorBack = imageDitheringDefaultPreset.params.colorBack,
    colorHighlight = imageDitheringDefaultPreset.params.colorHighlight,
    image = '',
    type = imageDitheringDefaultPreset.params.type,
    colorSteps = imageDitheringDefaultPreset.params.colorSteps,
    originalColors = imageDitheringDefaultPreset.params.originalColors,
    inverted = imageDitheringDefaultPreset.params.inverted,
    pxSize,
    size = pxSize === undefined ? imageDitheringDefaultPreset.params.size : pxSize,
    fit = imageDitheringDefaultPreset.params.fit,
    scale = imageDitheringDefaultPreset.params.scale,
    rotation = imageDitheringDefaultPreset.params.rotation,
    originX = imageDitheringDefaultPreset.params.originX,
    originY = imageDitheringDefaultPreset.params.originY,
    offsetX = imageDitheringDefaultPreset.params.offsetX,
    offsetY = imageDitheringDefaultPreset.params.offsetY,
    worldWidth = imageDitheringDefaultPreset.params.worldWidth,
    worldHeight = imageDitheringDefaultPreset.params.worldHeight,
    ...props
  }: ImageDitheringProps) => {
    const uniforms = {
      u_image: image,
      u_colorFront: getShaderColorFromString(colorFront),
      u_colorBack: getShaderColorFromString(colorBack),
      u_colorHighlight: getShaderColorFromString(colorHighlight),
      u_type: DitheringTypes[type],
      u_pxSize: size,
      u_colorSteps: colorSteps,
      u_originalColors: originalColors,
      u_inverted: inverted,
      u_fit: ShaderFitOptions[fit],
      u_rotation: rotation,
      u_scale: scale,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies ImageDitheringUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: imageDitheringFragmentShader,
      uniforms,
    };
  }
);

export interface HeatmapProps extends ShaderComponentProps, HeatmapParams {
  suspendWhenProcessingImage?: boolean;
}

const heatmapDefaultPreset: ImageShaderPreset<HeatmapParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.75,
    speed: 1,
    frame: 0,
    contour: 0.5,
    angle: 0,
    noise: 0,
    innerGlow: 0.5,
    outerGlow: 0.5,
    colorBack: '#000000',
    colors: ['#11206a', '#1f3ba2', '#2f63e7', '#6bd7ff', '#ffe679', '#ff991e', '#ff4c00'],
  },
};

const heatmapSepiaPreset: ImageShaderPreset<HeatmapParams> = {
  name: 'Sepia',
  params: {
    ...defaultObjectSizing,
    scale: 0.75,
    speed: 0.5,
    frame: 0,
    contour: 0.5,
    angle: 0,
    noise: 0.75,
    innerGlow: 0.5,
    outerGlow: 0.5,
    colorBack: '#000000',
    colors: ['#997F45', '#ffffff'],
  },
};

export const heatmapPresets = [heatmapDefaultPreset, heatmapSepiaPreset] satisfies ImageShaderPreset<HeatmapParams>[];

const heatmapPropNames = shaderComponentPropNames(heatmapDefaultPreset.params, ['image', 'suspendWhenProcessingImage']);

export const Heatmap = defineComponent({
  name: 'Heatmap',
  inheritAttrs: false,
  props: heatmapPropNames,
  setup(rawProps, { attrs }) {
    const props = rawProps as unknown as HeatmapProps;
    const processedImage = useProcessedImage(
      () => toImageUrl(props.image),
      'heatmap',
      async (imageUrl) => (await toProcessedHeatmap(imageUrl)).blob
    );

    return () => {
      const {
        speed = heatmapDefaultPreset.params.speed,
        frame = heatmapDefaultPreset.params.frame,
        image: _image = '',
        contour = heatmapDefaultPreset.params.contour,
        angle = heatmapDefaultPreset.params.angle,
        noise = heatmapDefaultPreset.params.noise,
        innerGlow = heatmapDefaultPreset.params.innerGlow,
        outerGlow = heatmapDefaultPreset.params.outerGlow,
        colorBack = heatmapDefaultPreset.params.colorBack,
        colors = heatmapDefaultPreset.params.colors,
        suspendWhenProcessingImage: _suspendWhenProcessingImage = false,
        fit = heatmapDefaultPreset.params.fit,
        offsetX = heatmapDefaultPreset.params.offsetX,
        offsetY = heatmapDefaultPreset.params.offsetY,
        originX = heatmapDefaultPreset.params.originX,
        originY = heatmapDefaultPreset.params.originY,
        rotation = heatmapDefaultPreset.params.rotation,
        scale = heatmapDefaultPreset.params.scale,
        worldHeight = heatmapDefaultPreset.params.worldHeight,
        worldWidth = heatmapDefaultPreset.params.worldWidth,
        ...shaderProps
      } = props;

      const uniforms = {
        u_image: processedImage.value,
        u_contour: contour,
        u_angle: angle,
        u_noise: noise,
        u_innerGlow: innerGlow,
        u_outerGlow: outerGlow,
        u_colorBack: getShaderColorFromString(colorBack),
        u_colors: colors.map(getShaderColorFromString),
        u_colorsCount: colors.length,
        u_fit: ShaderFitOptions[fit],
        u_offsetX: offsetX,
        u_offsetY: offsetY,
        u_originX: originX,
        u_originY: originY,
        u_rotation: rotation,
        u_scale: scale,
        u_worldHeight: worldHeight,
        u_worldWidth: worldWidth,
      } satisfies HeatmapUniforms;

      return h(ShaderMount, {
        ...attrs,
        ...shaderProps,
        speed,
        frame,
        fragmentShader: heatmapFragmentShader,
        mipmaps: ['u_image'],
        uniforms,
      });
    };
  },
});

export interface LiquidMetalProps extends ShaderComponentProps, LiquidMetalParams {
  suspendWhenProcessingImage?: boolean;
}

const liquidMetalDefaultPreset: ImageShaderPreset<LiquidMetalParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#AAAAAC',
    colorTint: '#ffffff',
    distortion: 0.07,
    repetition: 2,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    contour: 0.4,
    softness: 0.1,
    angle: 70,
    shape: 'diamond',
  },
};

const liquidMetalNoirPreset: ImageShaderPreset<LiquidMetalParams> = {
  name: 'Noir',
  params: {
    ...defaultObjectSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colorTint: '#606060',
    softness: 0.45,
    repetition: 1.5,
    shiftRed: 0,
    shiftBlue: 0,
    distortion: 0,
    contour: 0,
    angle: 90,
    shape: 'diamond',
  },
};

const liquidMetalBackdropPreset: ImageShaderPreset<LiquidMetalParams> = {
  name: 'Backdrop',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    scale: 1.5,
    colorBack: '#AAAAAC',
    colorTint: '#ffffff',
    softness: 0.05,
    repetition: 1.5,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    distortion: 0.1,
    contour: 0.4,
    shape: 'none',
    angle: 90,
    worldWidth: 0,
    worldHeight: 0,
  },
};

const liquidMetalStripesPreset: ImageShaderPreset<LiquidMetalParams> = {
  name: 'Stripes',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    scale: 0.6,
    colorBack: '#000000',
    colorTint: '#2c5d72',
    softness: 0.8,
    repetition: 6,
    shiftRed: 1,
    shiftBlue: -1,
    distortion: 0.4,
    contour: 0.4,
    shape: 'circle',
    angle: 0,
  },
};

export const liquidMetalPresets = [
  liquidMetalDefaultPreset,
  liquidMetalNoirPreset,
  liquidMetalBackdropPreset,
  liquidMetalStripesPreset,
] satisfies ImageShaderPreset<LiquidMetalParams>[];

const liquidMetalPropNames = shaderComponentPropNames(liquidMetalDefaultPreset.params, ['image', 'suspendWhenProcessingImage']);

export const LiquidMetal = defineComponent({
  name: 'LiquidMetal',
  inheritAttrs: false,
  props: liquidMetalPropNames,
  setup(rawProps, { attrs }) {
    const props = rawProps as unknown as LiquidMetalProps;
    const processedImage = useProcessedImage(
      () => toImageUrl(props.image),
      'liquid metal',
      async (imageUrl) => (await toProcessedLiquidMetal(imageUrl)).pngBlob
    );

    return () => {
      const {
        colorBack = liquidMetalDefaultPreset.params.colorBack,
        colorTint = liquidMetalDefaultPreset.params.colorTint,
        speed = liquidMetalDefaultPreset.params.speed,
        frame = liquidMetalDefaultPreset.params.frame,
        image = '',
        contour = liquidMetalDefaultPreset.params.contour,
        distortion = liquidMetalDefaultPreset.params.distortion,
        softness = liquidMetalDefaultPreset.params.softness,
        repetition = liquidMetalDefaultPreset.params.repetition,
        shiftRed = liquidMetalDefaultPreset.params.shiftRed,
        shiftBlue = liquidMetalDefaultPreset.params.shiftBlue,
        angle = liquidMetalDefaultPreset.params.angle,
        shape = liquidMetalDefaultPreset.params.shape,
        suspendWhenProcessingImage: _suspendWhenProcessingImage = false,
        fit = liquidMetalDefaultPreset.params.fit,
        scale = liquidMetalDefaultPreset.params.scale,
        rotation = liquidMetalDefaultPreset.params.rotation,
        originX = liquidMetalDefaultPreset.params.originX,
        originY = liquidMetalDefaultPreset.params.originY,
        offsetX = liquidMetalDefaultPreset.params.offsetX,
        offsetY = liquidMetalDefaultPreset.params.offsetY,
        worldWidth = liquidMetalDefaultPreset.params.worldWidth,
        worldHeight = liquidMetalDefaultPreset.params.worldHeight,
        ...shaderProps
      } = props;

      const uniforms = {
        u_colorBack: getShaderColorFromString(colorBack),
        u_colorTint: getShaderColorFromString(colorTint),
        u_image: processedImage.value,
        u_contour: contour,
        u_distortion: distortion,
        u_softness: softness,
        u_repetition: repetition,
        u_shiftRed: shiftRed,
        u_shiftBlue: shiftBlue,
        u_angle: angle,
        u_isImage: Boolean(image),
        u_shape: LiquidMetalShapes[shape],
        u_fit: ShaderFitOptions[fit],
        u_scale: scale,
        u_rotation: rotation,
        u_offsetX: offsetX,
        u_offsetY: offsetY,
        u_originX: originX,
        u_originY: originY,
        u_worldWidth: worldWidth,
        u_worldHeight: worldHeight,
      } satisfies LiquidMetalUniforms;

      return h(ShaderMount, {
        ...attrs,
        ...shaderProps,
        speed,
        frame,
        fragmentShader: liquidMetalFragmentShader,
        mipmaps: ['u_image'],
        uniforms,
      });
    };
  },
});

export interface HalftoneDotsProps extends ShaderComponentProps, HalftoneDotsParams {}

const halftoneDotsDefaultPreset: ImageShaderPreset<HalftoneDotsParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#f2f1e8',
    colorFront: '#2b2b2b',
    size: 0.5,
    radius: 1.25,
    contrast: 0.4,
    originalColors: false,
    inverted: false,
    grainMixer: 0.2,
    grainOverlay: 0.2,
    grainSize: 0.5,
    grid: 'hex',
    type: 'gooey',
  },
};

const halftoneDotsLedPreset: ImageShaderPreset<HalftoneDotsParams> = {
  name: 'LED screen',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#000000',
    colorFront: '#29ff7b',
    size: 0.5,
    radius: 1.5,
    contrast: 0.3,
    originalColors: false,
    inverted: false,
    grainMixer: 0,
    grainOverlay: 0,
    grainSize: 0.5,
    grid: 'square',
    type: 'soft',
  },
};

const halftoneDotsNetPreset: ImageShaderPreset<HalftoneDotsParams> = {
  name: 'Mosaic',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#000000',
    colorFront: '#b2aeae',
    size: 0.6,
    radius: 2,
    contrast: 0.01,
    originalColors: true,
    inverted: false,
    grainMixer: 0,
    grainOverlay: 0,
    grainSize: 0.5,
    grid: 'hex',
    type: 'classic',
  },
};

const halftoneDotsRoundAndSquarePreset: ImageShaderPreset<HalftoneDotsParams> = {
  name: 'Round and square',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#141414',
    colorFront: '#ff8000',
    size: 0.8,
    radius: 1,
    contrast: 1,
    originalColors: false,
    inverted: true,
    grainMixer: 0.05,
    grainOverlay: 0.3,
    grainSize: 0.5,
    grid: 'square',
    type: 'holes',
  },
};

export const halftoneDotsPresets = [
  halftoneDotsDefaultPreset,
  halftoneDotsLedPreset,
  halftoneDotsNetPreset,
  halftoneDotsRoundAndSquarePreset,
] satisfies ImageShaderPreset<HalftoneDotsParams>[];

export const HalftoneDots = createShaderComponent<HalftoneDotsProps>(
  'HalftoneDots',
  shaderComponentPropNames(halftoneDotsDefaultPreset.params),
  ({
    speed = halftoneDotsDefaultPreset.params.speed,
    frame = halftoneDotsDefaultPreset.params.frame,
    colorFront = halftoneDotsDefaultPreset.params.colorFront,
    colorBack = halftoneDotsDefaultPreset.params.colorBack,
    image = '',
    size = halftoneDotsDefaultPreset.params.size,
    radius = halftoneDotsDefaultPreset.params.radius,
    contrast = halftoneDotsDefaultPreset.params.contrast,
    originalColors = halftoneDotsDefaultPreset.params.originalColors,
    inverted = halftoneDotsDefaultPreset.params.inverted,
    grainMixer = halftoneDotsDefaultPreset.params.grainMixer,
    grainOverlay = halftoneDotsDefaultPreset.params.grainOverlay,
    grainSize = halftoneDotsDefaultPreset.params.grainSize,
    grid = halftoneDotsDefaultPreset.params.grid,
    type = halftoneDotsDefaultPreset.params.type,
    fit = halftoneDotsDefaultPreset.params.fit,
    scale = halftoneDotsDefaultPreset.params.scale,
    rotation = halftoneDotsDefaultPreset.params.rotation,
    originX = halftoneDotsDefaultPreset.params.originX,
    originY = halftoneDotsDefaultPreset.params.originY,
    offsetX = halftoneDotsDefaultPreset.params.offsetX,
    offsetY = halftoneDotsDefaultPreset.params.offsetY,
    worldWidth = halftoneDotsDefaultPreset.params.worldWidth,
    worldHeight = halftoneDotsDefaultPreset.params.worldHeight,
    ...props
  }: HalftoneDotsProps) => {
    const uniforms = {
      u_image: image,
      u_colorFront: getShaderColorFromString(colorFront),
      u_colorBack: getShaderColorFromString(colorBack),
      u_size: size,
      u_radius: radius,
      u_contrast: contrast,
      u_originalColors: originalColors,
      u_inverted: inverted,
      u_grainMixer: grainMixer,
      u_grainOverlay: grainOverlay,
      u_grainSize: grainSize,
      u_grid: HalftoneDotsGrids[grid],
      u_type: HalftoneDotsTypes[type],
      u_fit: ShaderFitOptions[fit],
      u_rotation: rotation,
      u_scale: scale,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies HalftoneDotsUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: halftoneDotsFragmentShader,
      uniforms,
    };
  }
);

export interface HalftoneCmykProps extends ShaderComponentProps, HalftoneCmykParams {}

const halftoneCmykDefaultPreset: ImageShaderPreset<HalftoneCmykParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#fbfaf5',
    colorC: '#00b4ff',
    colorM: '#fc519f',
    colorY: '#ffd800',
    colorK: '#231f20',
    size: 0.2,
    contrast: 1,
    softness: 1,
    grainSize: 0.5,
    grainMixer: 0,
    grainOverlay: 0,
    gridNoise: 0.2,
    floodC: 0.15,
    floodM: 0,
    floodY: 0,
    floodK: 0,
    gainC: 0.3,
    gainM: 0,
    gainY: 0.2,
    gainK: 0,
    type: 'ink',
  },
};

const halftoneCmykDropsPreset: ImageShaderPreset<HalftoneCmykParams> = {
  name: 'Drops',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#eeefd7',
    colorC: '#00b2ff',
    colorM: '#fc4f4f',
    colorY: '#ffd900',
    colorK: '#231f20',
    size: 0.88,
    contrast: 1.15,
    softness: 0,
    grainSize: 0.01,
    grainMixer: 0.05,
    grainOverlay: 0.25,
    gridNoise: 0.5,
    floodC: 0.15,
    floodM: 0,
    floodY: 0,
    floodK: 0,
    gainC: 1,
    gainM: 0.44,
    gainY: -1,
    gainK: 0,
    type: 'ink',
  },
};

const halftoneCmykNewspaperPreset: ImageShaderPreset<HalftoneCmykParams> = {
  name: 'Newspaper',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#f2f1e8',
    colorC: '#7a7a75',
    colorM: '#7a7a75',
    colorY: '#7a7a75',
    colorK: '#231f20',
    size: 0.01,
    contrast: 2,
    softness: 0.2,
    grainSize: 0,
    grainMixer: 0,
    grainOverlay: 0.2,
    gridNoise: 0.6,
    floodC: 0,
    floodM: 0,
    floodY: 0,
    floodK: 0.1,
    gainC: -0.17,
    gainM: -0.45,
    gainY: -0.45,
    gainK: 0,
    type: 'dots',
  },
};

const halftoneCmykVintagePreset: ImageShaderPreset<HalftoneCmykParams> = {
  name: 'Vintage',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#fffaf0',
    colorC: '#59afc5',
    colorM: '#d8697c',
    colorY: '#fad85c',
    colorK: '#2d2824',
    size: 0.2,
    contrast: 1.25,
    softness: 0.4,
    grainSize: 0.5,
    grainMixer: 0.15,
    grainOverlay: 0.1,
    gridNoise: 0.45,
    floodC: 0.15,
    floodM: 0,
    floodY: 0,
    floodK: 0,
    gainC: 0.3,
    gainM: 0,
    gainY: 0.2,
    gainK: 0,
    type: 'sharp',
  },
};

export const halftoneCmykPresets = [
  halftoneCmykDefaultPreset,
  halftoneCmykDropsPreset,
  halftoneCmykNewspaperPreset,
  halftoneCmykVintagePreset,
] satisfies ImageShaderPreset<HalftoneCmykParams>[];

export const HalftoneCmyk = createShaderComponent<HalftoneCmykProps>(
  'HalftoneCmyk',
  shaderComponentPropNames(halftoneCmykDefaultPreset.params),
  ({
    speed = halftoneCmykDefaultPreset.params.speed,
    frame = halftoneCmykDefaultPreset.params.frame,
    colorBack = halftoneCmykDefaultPreset.params.colorBack,
    colorC = halftoneCmykDefaultPreset.params.colorC,
    colorM = halftoneCmykDefaultPreset.params.colorM,
    colorY = halftoneCmykDefaultPreset.params.colorY,
    colorK = halftoneCmykDefaultPreset.params.colorK,
    image = '',
    size = halftoneCmykDefaultPreset.params.size,
    contrast = halftoneCmykDefaultPreset.params.contrast,
    softness = halftoneCmykDefaultPreset.params.softness,
    grainSize = halftoneCmykDefaultPreset.params.grainSize,
    grainMixer = halftoneCmykDefaultPreset.params.grainMixer,
    grainOverlay = halftoneCmykDefaultPreset.params.grainOverlay,
    gridNoise = halftoneCmykDefaultPreset.params.gridNoise,
    floodC = halftoneCmykDefaultPreset.params.floodC,
    floodM = halftoneCmykDefaultPreset.params.floodM,
    floodY = halftoneCmykDefaultPreset.params.floodY,
    floodK = halftoneCmykDefaultPreset.params.floodK,
    gainC = halftoneCmykDefaultPreset.params.gainC,
    gainM = halftoneCmykDefaultPreset.params.gainM,
    gainY = halftoneCmykDefaultPreset.params.gainY,
    gainK = halftoneCmykDefaultPreset.params.gainK,
    type = halftoneCmykDefaultPreset.params.type,
    fit = halftoneCmykDefaultPreset.params.fit,
    scale = halftoneCmykDefaultPreset.params.scale,
    rotation = halftoneCmykDefaultPreset.params.rotation,
    originX = halftoneCmykDefaultPreset.params.originX,
    originY = halftoneCmykDefaultPreset.params.originY,
    offsetX = halftoneCmykDefaultPreset.params.offsetX,
    offsetY = halftoneCmykDefaultPreset.params.offsetY,
    worldWidth = halftoneCmykDefaultPreset.params.worldWidth,
    worldHeight = halftoneCmykDefaultPreset.params.worldHeight,
    ...props
  }: HalftoneCmykProps) => {
    const uniforms = {
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

    return {
      ...props,
      speed,
      frame,
      fragmentShader: halftoneCmykFragmentShader,
      uniforms,
    };
  }
);
