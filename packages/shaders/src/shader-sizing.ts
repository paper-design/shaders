export const sizingUniformsDeclaration = `
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;
uniform float u_offsetX;
uniform float u_offsetY;`;

export const sizingSquareUV = `
  vec2 worldSize = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  float worldRatio = 1.;

  float maxWidth = max(u_resolution.x, worldSize.x);
  float maxHeight = max(u_resolution.y, worldSize.y);

  // crop
  float imageWidth = worldRatio * min(worldSize.x / worldRatio, worldSize.y);
  if (u_fit == 1.) {
    // contain
    imageWidth = worldRatio * min(maxWidth / worldRatio, maxHeight);
  } else if (u_fit == 2.) {
    // cover
    imageWidth = worldRatio * max(maxWidth / worldRatio, maxHeight);
  }
  float imageHeight = imageWidth / worldRatio;

  vec2 world = vec2(imageWidth, imageHeight);
  vec2 origin = vec2(.5 - u_originX, u_originY - .5);
  vec2 scale = u_resolution.xy / world;

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= .5;
  uv *= scale;
  uv += origin * (scale - 1.);
  uv /= u_scale;
  uv += .5;

  vec2 worldBox = uv;
  uv += vec2(-u_offsetX, u_offsetY);
`;

export const sizingPatternUV = `
  vec2 worldSize = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  float worldRatio = worldSize.x / max(worldSize.y, 1e-4);

  float maxWidth = max(u_resolution.x, worldSize.x);
  float maxHeight = max(u_resolution.y, worldSize.y);

  // crop
  float imageWidth = worldRatio * min(worldSize.x / worldRatio, worldSize.y);
  float imageWidthCrop = imageWidth;
  if (u_fit == 1.) {
    // contain
    imageWidth = worldRatio * min(maxWidth / worldRatio, maxHeight);
  } else if (u_fit == 2.) {
    // cover
    imageWidth = worldRatio * max(maxWidth / worldRatio, maxHeight);
  }
  float imageHeight = imageWidth / worldRatio;

  vec2 world = vec2(imageWidth, imageHeight);
  vec2 origin = vec2(.5 - u_originX, u_originY - .5);
  vec2 scale = u_resolution.xy / world;

  vec2 worldBox = gl_FragCoord.xy / u_resolution.xy;
  worldBox -= .5;
  worldBox *= scale;
  worldBox += origin * (scale - 1.);
  worldBox /= u_scale;
  worldBox += .5;

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= .5;
  uv += vec2(-u_offsetX, u_offsetY) / scale;

  uv += origin * (1. - 1. / scale);
  uv /= u_scale;
  uv *= u_resolution.xy;
  uv /= u_pixelRatio;
  if (u_fit > 0.) {
    uv *= (imageWidthCrop / imageWidth);
  }
`;

export const worldBoxTestStroke = `
  vec2 worldBoxDist = abs(worldBox - .5);
  float worldBoxTestStroke = (step(max(worldBoxDist.x, worldBoxDist.y), .5) - step(max(worldBoxDist.x, worldBoxDist.y), .495));
`;

export interface ShaderSizingUniforms {
  u_fit: (typeof ShaderFitOptions)[ShaderFit];
  u_scale: number;
  u_originX: number;
  u_originY: number;
  u_offsetX: number;
  u_offsetY: number;
  u_worldWidth: number;
  u_worldHeight: number;
}

export interface ShaderSizingParams {
  fit?: 'none' | 'contain' | 'cover';
  scale?: number;
  originX?: number;
  originY?: number;
  offsetX?: number;
  offsetY?: number;
  worldWidth?: number;
  worldHeight?: number;
}

export const defaultObjectSizing: Required<ShaderSizingParams> = {
  fit: 'contain',
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  originX: 0.5,
  originY: 0.5,
  worldWidth: 0,
  worldHeight: 0,
};

export const defaultPatternSizing: Required<ShaderSizingParams> = {
  fit: 'none',
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  originX: 0.5,
  originY: 0.5,
  worldWidth: Infinity,
  worldHeight: Infinity,
};

export const ShaderFitOptions = {
  none: 0,
  contain: 1,
  cover: 2,
} as const;

export type ShaderFit = keyof typeof ShaderFitOptions;
