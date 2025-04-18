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

export const sizingUV = `

  // ===================================================
  // uv before sizing
  
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 pxSizeUv = vec2(0.);
  vec2 roundedUv = vec2(0.);
  #ifdef USE_PX_ROUNDING
    pxSizeUv = gl_FragCoord.xy / (u_pxSize * u_pixelRatio);
    roundedUv = floor(pxSizeUv) * (u_pxSize * u_pixelRatio) / u_resolution.xy;
    if (pxSize > 0.) {
      uv = roundedUv;
    }  
  #endif
  uv -= .5;
  
  // ===================================================
  
  
  
  // ===================================================
  // sizing params shared between objects and patterns
  
  vec2 worldOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 worldSize = vec2(u_worldWidth, u_worldHeight);
  worldSize = max(worldSize, vec2(1.)) * u_pixelRatio;
  float maxWidth = max(u_resolution.x, worldSize.x);
  float maxHeight = max(u_resolution.y, worldSize.y);
  float rotationRad = u_rotation * 3.14159265358979323846 / 180.;

  // ===================================================
  
  
  
  // ===================================================
  // Sizing api for objects (graphics with fixed ratio)

  #ifdef USE_OBJECT_SIZING
  
  float objectWorldRatio = 1.;
  vec2 objectWorld = vec2(0.);
  objectWorld.x = objectWorldRatio * min(worldSize.x / objectWorldRatio, worldSize.y);
  if (u_fit == 1.) {
    // contain
    objectWorld.x = objectWorldRatio * min(maxWidth / objectWorldRatio, maxHeight);
  } else if (u_fit == 2.) {
    // cover
    objectWorld.x = objectWorldRatio * max(maxWidth / objectWorldRatio, maxHeight);
  }
  objectWorld.y = objectWorld.x / objectWorldRatio;
  vec2 objectWorldScale = u_resolution.xy / objectWorld;

  vec2 objectWorldBox = gl_FragCoord.xy / u_resolution.xy;
  objectWorldBox -= .5;
  objectWorldBox *= objectWorldScale;
  objectWorldBox += worldOrigin * (objectWorldScale - 1.);  
  
  vec2 objectUV = uv;
  objectUV *= objectWorldScale;
  objectUV += worldOrigin * (objectWorldScale - 1.);
  objectUV += vec2(-u_offsetX, u_offsetY);
  objectUV /= u_scale;
  objectUV = mat2(cos(rotationRad), sin(rotationRad), -sin(rotationRad), cos(rotationRad)) * objectUV;

  #endif

  // ===================================================



  
  // ===================================================
  // Sizing api for patterns (graphics respecting u_worldWidth / u_worldHeight ratio)
  
  #ifdef USE_PATTERN_SIZING

  float patternWorldRatio = worldSize.x / worldSize.y;
  vec2 patternWorld = vec2(0.);
  patternWorld.x = patternWorldRatio * min(worldSize.x / patternWorldRatio, worldSize.y);
  float patternWorldWidthOriginal = patternWorld.x;
  if (u_fit == 1.) {
    // contain
    patternWorld.x = patternWorldRatio * min(maxWidth / patternWorldRatio, maxHeight);
  } else if (u_fit == 2.) {
    // cover
    patternWorld.x = patternWorldRatio * max(maxWidth / patternWorldRatio, maxHeight);
  }
  patternWorld.y = patternWorld.x / patternWorldRatio;
  vec2 patternWorldScale = u_resolution.xy / patternWorld;
  
  vec2 patternWorldBox = gl_FragCoord.xy / u_resolution.xy;
  patternWorldBox -= .5;
  patternWorldBox *= patternWorldScale;
  patternWorldBox += worldOrigin * (patternWorldScale - 1.);  
  
  vec2 patternUV = uv;
  patternUV += vec2(-u_offsetX, u_offsetY) / patternWorldScale;
  patternUV += worldOrigin;
  patternUV -= worldOrigin / patternWorldScale;
  patternUV *= u_resolution.xy;
  patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    patternUV *= (patternWorldWidthOriginal / patternWorld.x);
  }
  patternUV /= u_scale;
  patternUV = mat2(cos(rotationRad), sin(rotationRad), -sin(rotationRad), cos(rotationRad)) * patternUV;
  patternUV += worldOrigin / patternWorldScale;
  patternUV -= worldOrigin;
  patternUV += .5;
  
  #endif

  // ===================================================

`;

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

  // -----------------------------------------------------  
  // BASE UV (MUST BE A SEPARATE STRING?)
  // -----------------------------------------------------  
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 pxSizeUv = vec2(0.);
  vec2 roundedUv = vec2(0.);
  #ifdef USE_PX_ROUNDING
    pxSizeUv = gl_FragCoord.xy / (u_pxSize * u_pixelRatio);
    roundedUv = floor(pxSizeUv) * (u_pxSize * u_pixelRatio) / u_resolution.xy;
    if (pxSize > 0.) {
      uv = roundedUv;
    }  
  #endif
  // -----------------------------------------------------  
  // END OF BASE UV
  // -----------------------------------------------------  
  
  uv -= .5;
  uv *= worldScale;
  uv += worldOrigin * (worldScale - 1.);

  uv += vec2(-u_offsetX, u_offsetY);
  uv /= u_scale;
  float rotationRad = u_rotation * 3.14159265358979323846 / 180.;
  uv = mat2(cos(rotationRad), sin(rotationRad), -sin(rotationRad), cos(rotationRad)) * uv;
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
  
  vec2 pxSizeUv = vec2(0.);
  vec2 roundedUv = vec2(0.);
  #ifdef USE_PX_ROUNDING
    pxSizeUv = gl_FragCoord.xy / (u_pxSize * u_pixelRatio);
    roundedUv = floor(pxSizeUv) * (u_pxSize * u_pixelRatio) / u_resolution.xy;
    if (pxSize > 0.) {
      uv = roundedUv;
    }  
  #endif
  
  uv -= .5;
  uv += vec2(-u_offsetX, u_offsetY) / worldScale;
  uv += worldOrigin;
  uv -= worldOrigin / worldScale;
  
  uv *= u_resolution.xy;
  uv /= u_pixelRatio;
  
  if (u_fit > 0.) {
    uv *= (imageWidthCrop / imageWidth);
  }
  
  uv /= u_scale;
  float rotationRad = u_rotation * 3.14159265358979323846 / 180.;
  uv = mat2(cos(rotationRad), sin(rotationRad), -sin(rotationRad), cos(rotationRad)) * uv;
  
  uv += worldOrigin / worldScale;
  uv -= worldOrigin;
  uv += .5;
`;

export const worldBoxTestStroke = `
  vec2 worldBoxDist = abs(worldBox);
  float worldBoxTestStroke = (step(max(worldBoxDist.x, worldBoxDist.y), .5) - step(max(worldBoxDist.x, worldBoxDist.y), .49));
`;

export const viewPortTestOriginPoint = `
  vec2 viewPortTestOriginDist = worldBox + worldOrigin;
  viewPortTestOriginDist.x *= (world.x / world.y);
  float viewPortTestOriginPoint = 1. - smoothstep(0., .05, length(viewPortTestOriginDist));
  
  vec2 worldTestOriginPointDist = worldBox + vec2(-u_offsetX, u_offsetY);
  worldTestOriginPointDist.x *= (world.x / world.y);
  float worldTestOriginPoint = 1. - smoothstep(0., .05, length(worldTestOriginPointDist));
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
