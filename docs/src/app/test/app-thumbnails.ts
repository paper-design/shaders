import { flatHomeThumbnails } from '@/app/home-thumbnails';
import {
  Dithering,
  DotGrid,
  GrainGradient,
  Heatmap,
  LiquidMetal,
  PulsingBorder,
  SmokeRing,
  Spiral,
  StaticRadialGradient,
  Waves,
} from '@paper-design/shaders-react';

export const appThumbnails = flatHomeThumbnails.map((item) => {
  if (item.ShaderComponent === StaticRadialGradient) {
    return {
      ...item,
      shaderConfig: {
        ...item.shaderConfig,
        radius: 0.8,
      },
    };
  }

  if (item.ShaderComponent === Dithering) {
    return {
      ...item,
      shaderConfig: {
        ...item.shaderConfig,
        scale: 0.67,
      },
    };
  }

  if (item.ShaderComponent === SmokeRing) {
    return {
      ...item,
      shaderConfig: {
        ...item.shaderConfig,
        scale: 1.1,
      },
    };
  }

  if (item.ShaderComponent === LiquidMetal) {
    return {
      ...item,
      shaderConfig: {
        ...item.shaderConfig,
        scale: 0.67,
      },
    };
  }

  if (item.ShaderComponent === PulsingBorder) {
    return {
      ...item,
      shaderConfig: {
        ...item.shaderConfig,
        scale: 0.67,
      },
    };
  }

  if (item.ShaderComponent === DotGrid) {
    return {
      ...item,
      shaderConfig: {
        ...item.shaderConfig,
        gapX: 24,
        gapY: 22,
      },
    };
  }

  if (item.ShaderComponent === Waves) {
    return {
      ...item,
      shaderConfig: {
        ...item.shaderConfig,
        spacing: 0.96,
      },
    };
  }

  if (item.ShaderComponent === Spiral) {
    return {
      ...item,
      shaderConfig: {
        ...item.shaderConfig,
        scale: 0.35,
      },
    };
  }

  if (item.ShaderComponent === GrainGradient) {
    return {
      ...item,
      shaderConfig: {
        ...item.shaderConfig,
        intensity: 0.75,
      },
    };
  }

  if (item.ShaderComponent === Heatmap) {
    return {
      ...item,
      shaderConfig: {
        ...item.shaderConfig,
        scale: 0.97,
      },
    };
  }

  return item;
});
