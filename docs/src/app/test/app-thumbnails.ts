import { homeThumbnails } from '@/app/home-thumbnails';
import { DotGrid, GrainGradient, Spiral, Swirl, Waves } from '@paper-design/shaders-react';

export const appThumbnails = homeThumbnails.map((item) => {
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

  return item;
});
