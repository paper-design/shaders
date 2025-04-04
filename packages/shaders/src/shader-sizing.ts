export const sizingUniformsDeclaration = `
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;`;

export const sizingSquareUV = `
  vec2 worldSize = vec2(u_worldWidth, u_worldHeight);
  worldSize = max(worldSize, vec2(1.)) * u_pixelRatio;
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
  vec2 worldOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 worldScale = u_resolution.xy / world;

  vec2 worldBox = gl_FragCoord.xy / u_resolution.xy;
  worldBox -= .5;
  worldBox *= worldScale;
  worldBox += worldOrigin * (worldScale - 1.);  
  
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= .5;
  uv *= worldScale;
  uv += worldOrigin * (worldScale - 1.);

  // uv += worldOrigin;
  uv /= u_scale;
  float rotationRad = u_rotation * 3.14159265358979323846 / 180.;
  uv = mat2(cos(rotationRad), sin(rotationRad), -sin(rotationRad), cos(rotationRad)) * uv;
  // uv -= worldOrigin;

  uv += .5;
  uv += vec2(-u_offsetX, u_offsetY);

  
  // vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  // uv -= .5;
  // uv += worldOrigin;
  // uv *= worldScale;
  // uv /= u_scale;
  // float rotationRad = u_rotation * 3.14159265358979323846 / 180.;
  // uv = mat2(cos(rotationRad), sin(rotationRad), -sin(rotationRad), cos(rotationRad)) * uv;
  // uv -= worldOrigin;
  // uv += .5;
  // uv += vec2(-u_offsetX, u_offsetY);
`;

export const sizingPatternUV = `
  vec2 worldSize = vec2(u_worldWidth, u_worldHeight);
  worldSize = max(worldSize, vec2(1.)) * u_pixelRatio;
  float worldRatio = worldSize.x / worldSize.y;

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
  vec2 worldOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 worldScale = u_resolution.xy / world;

  vec2 worldBox = gl_FragCoord.xy / u_resolution.xy;
  worldBox -= .5;
  worldBox *= worldScale;
  worldBox += worldOrigin * (worldScale - 1.);

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= .5;
  uv += vec2(-u_offsetX, u_offsetY) / worldScale;
  uv += worldOrigin;
  uv -= worldOrigin / worldScale;
  
  uv *= u_resolution.xy;
  uv /= u_pixelRatio;
  
  if (u_fit > 0.) {
    uv *= (imageWidthCrop / imageWidth);
  }
  
  // uv /= u_scale;
  // float rotationRad = u_rotation * 3.14159265358979323846 / 180.;
  // uv = mat2(cos(rotationRad), sin(rotationRad), -sin(rotationRad), cos(rotationRad)) * uv;
    
  uv += worldOrigin / worldScale;
  uv -= worldOrigin;
  uv -= vec2(-u_offsetX, u_offsetY) / worldScale;
  uv += .5;

  // vec2 localOrigin = -worldOrigin * vec2(u_worldWidth, u_worldHeight);
  // uv -= localOrigin;
  // uv /= u_scale;
  // float rotationRad = u_rotation * 3.14159265358979323846 / 180.;
  // uv = mat2(cos(rotationRad), sin(rotationRad), -sin(rotationRad), cos(rotationRad)) * uv;
  // uv += localOrigin;
`;

export const worldBoxTestStroke = `
  vec2 worldBoxDist = abs(worldBox);
  float worldBoxTestStroke = (step(max(worldBoxDist.x, worldBoxDist.y), .5) - step(max(worldBoxDist.x, worldBoxDist.y), .49));
`;

export const worldOriginTestPoint = `
  vec2 worldOriginTestPointDist = worldBox + worldOrigin;
  worldOriginTestPointDist.x *= (world.x / world.y);
  float worldOriginTestPoint = 1. - smoothstep(0., .05, length(worldOriginTestPointDist));
  
  vec2 worldOriginPointDist = worldBox;
  worldOriginPointDist.x *= (world.x / world.y);
  float worldOriginPoint = 1. - smoothstep(0., .05, length(worldOriginPointDist));
`;

export interface ShaderSizingUniforms {
  u_fit: (typeof ShaderFitOptions)[ShaderFit];
  u_scale: number;
  u_rotation: number;
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
  rotation?: number;
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
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  originX: 0.5,
  originY: 0.5,
  worldWidth: 1,
  worldHeight: 1,
};

export const defaultPatternSizing: Required<ShaderSizingParams> = {
  fit: 'none',
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  originX: 0.5,
  originY: 0.5,
  worldWidth: 1,
  worldHeight: 1,
};

export const ShaderFitOptions = {
  none: 0,
  contain: 1,
  cover: 2,
} as const;

export type ShaderFit = keyof typeof ShaderFitOptions;
