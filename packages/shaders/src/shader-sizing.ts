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

export const declarePI = `
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;

export const declareRotate = `
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`;

export const declareRandom = `
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
`;

export const declareSimplexNoise = `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
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
