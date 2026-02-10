import React, { memo, useLayoutEffect, useMemo, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  asciiArtFragmentShader,
  getShaderColorFromString,
  getAsciiArtFontAtlas,
  ShaderFitOptions,
  type AsciiArtUniforms,
  type AsciiArtParams,
  defaultObjectSizing,
} from '@paper-design/shaders';

import { transparentPixel } from '../transparent-pixel.js';

export interface AsciiArtProps extends ShaderComponentProps, AsciiArtParams {}

// fontAtlas is managed internally, so exclude it (and image) from presets
type AsciiArtPreset = {
  name: string;
  params: Required<Omit<AsciiArtParams, 'image' | 'fontAtlas'>>;
};

export const defaultPreset: AsciiArtPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorFront: '#33ff66',
    colorBack: '#111111',
    size: 0.5,
    contrast: 0.4,
    originalColors: false,
    inverted: false,
  },
};

export const typewriterPreset: AsciiArtPreset = {
  name: 'Typewriter',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorFront: '#2b2b2b',
    colorBack: '#f2f1e8',
    size: 0.55,
    contrast: 0.35,
    originalColors: false,
    inverted: false,
  },
};

export const originalColorsPreset: AsciiArtPreset = {
  name: 'Original colors',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorFront: '#ffffff',
    colorBack: '#000000',
    size: 0.5,
    contrast: 0.3,
    originalColors: true,
    inverted: false,
  },
};

export const asciiArtPresets: AsciiArtPreset[] = [defaultPreset, typewriterPreset, originalColorsPreset];

// Module-level cache for the font atlas (generated once, reused across all instances)
let fontAtlasPromise: Promise<string> | null = null;
function getFontAtlasUrl(): Promise<string> {
  if (!fontAtlasPromise) {
    fontAtlasPromise = getAsciiArtFontAtlas().then((result) => URL.createObjectURL(result.blob));
  }
  return fontAtlasPromise;
}

export const AsciiArt: React.FC<AsciiArtProps> = memo(function AsciiArtImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  size = defaultPreset.params.size,
  contrast = defaultPreset.params.contrast,
  originalColors = defaultPreset.params.originalColors,
  inverted = defaultPreset.params.inverted,

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
}: AsciiArtProps) {
  const [fontAtlasUrl, setFontAtlasUrl] = useState<string>(transparentPixel);

  // Generate font atlas once (cached at module level)
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    let current = true;

    getFontAtlasUrl().then((url) => {
      if (current) {
        setFontAtlasUrl(url);
      }
    });

    return () => {
      current = false;
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      // Own uniforms
      u_image: image,
      u_fontAtlas: fontAtlasUrl,
      u_colorFront: getShaderColorFromString(colorFront),
      u_colorBack: getShaderColorFromString(colorBack),
      u_size: size,
      u_contrast: contrast,
      u_originalColors: originalColors,
      u_inverted: inverted,

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
    }),
    [
      image,
      fontAtlasUrl,
      colorFront,
      colorBack,
      size,
      contrast,
      originalColors,
      inverted,
      fit,
      rotation,
      scale,
      offsetX,
      offsetY,
      originX,
      originY,
      worldWidth,
      worldHeight,
    ]
  ) satisfies AsciiArtUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={asciiArtFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
