// language=GLSL
export const declarePI = `
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;

// language=GLSL
export const rotation2 = `
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`;

// language=GLSL
export const proceduralHash11 = `
  float hash11(float p) {
    p = fract(p * 0.3183099) + 0.1;
    p *= p + 19.19;
    return fract(p * p);
  }
`;

// language=GLSL
export const proceduralHash21 = `
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`;

// language=GLSL
export const proceduralHash22 = `
  vec2 hash22(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p.yx + 19.19);
    return fract(vec2(p.x * p.y, p.x + p.y));
  }
`;

// language=GLSL
export const textureRandomizerR = `
  float randomR(vec2 p) {
    vec2 uv = floor(p) / 100. + .5;
    return texture(u_noiseTexture, fract(uv)).r;
  }
`;

// language=GLSL
export const textureRandomizerGB = `
  vec2 randomGB(vec2 p) {
    vec2 uv = floor(p) / 100. + .5;
    return texture(u_noiseTexture, fract(uv)).gb;
  }
`;

// language=GLSL
export const colorBandingFix = `
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`;

// language=GLSL
export const simplexNoise = `
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

// language=GLSL
export const fiberNoise = `
float fiberRandom(vec2 p) {
  vec2 uv = floor(p) / 100.;
  return texture(u_noiseTexture, fract(uv)).b;
}

float fiberValueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = fiberRandom(i);
  float b = fiberRandom(i + vec2(1.0, 0.0));
  float c = fiberRandom(i + vec2(0.0, 1.0));
  float d = fiberRandom(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float fiberNoiseFbm(in vec2 n, vec2 seedOffset) {
  float total = 0.0, amplitude = 1.;
  for (int i = 0; i < 4; i++) {
    n = rotate(n, .7);
    total += fiberValueNoise(n + seedOffset) * amplitude;
    n *= 2.;
    amplitude *= 0.6;
  }
  return total;
}

float fiberNoise(vec2 uv, vec2 seedOffset) {
  float epsilon = 0.001;
  float n1 = fiberNoiseFbm(uv + vec2(epsilon, 0.0), seedOffset);
  float n2 = fiberNoiseFbm(uv - vec2(epsilon, 0.0), seedOffset);
  float n3 = fiberNoiseFbm(uv + vec2(0.0, epsilon), seedOffset);
  float n4 = fiberNoiseFbm(uv - vec2(0.0, epsilon), seedOffset);
  return length(vec2(n1 - n2, n3 - n4)) / (2.0 * epsilon);
}
`;


// language=GLSL
export const paperTextureeeeFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec2 u_resulution;
uniform vec4 u_colorFront;
uniform vec4 u_colorBack;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_roughness;
uniform float u_fiber;
uniform float u_fiberSize;
uniform float u_folds;
uniform float u_foldType;
uniform float u_foldCount;
uniform float u_foldSize;
uniform bool u_foldY;
uniform float u_foldsShape;
uniform float u_foldOffset;
uniform float u_drops;
uniform float u_seed;
uniform float u_fade;
uniform float u_blending;
uniform float u_distortion;
uniform float u_roughnessSize;
uniform bool u_background;
uniform sampler2D u_noiseTexture;

in vec2 v_imageUV;
out vec4 fragColor;

float getUvFrame(vec2 uv, float blur) {
  float left = smoothstep(0., blur, uv.x);
  float right = 1. - smoothstep(1. - blur, 1., uv.x);
  float bottom = smoothstep(0., blur, uv.y);
  float top = 1. - smoothstep(1. - blur, 1., uv.y);
  return left * right * bottom * top;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}
float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

${ declarePI }
${ rotation2 }
float randomR(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, fract(uv)).r;
}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
float getFadeMask(vec2 n) {
  float total = 0.0, amplitude = .4;
  for (int i = 0; i < 2; i++) {
    total += valueNoise(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}

float getRoughness(vec2 p) {
  vec2 u = p / vec2(2, 4);
  float w = max(length(dFdx(p * .1)), length(dFdy(p * .1)));
  float eps = 4. * w;

  float size = mix(3.2, .6, u_roughnessSize);
  float logLac = log2(2.1);
  float level = -log2(w + 1e-8) / logLac;
  float baseLevel = floor(level) - 2.;
  float fade = fract(level);

  vec2 px = (u.x + vec2(eps, -eps)) * .1;
  float py = u.y * .1;

  vec2 sum = vec2(0.);
  float norm = 0., amp = .5;
  for (int i = 0; i < 4; i++) {
    float absIdx = baseLevel + float(i);
    float freq = pow(2.1, absIdx);
    vec2 qx = size * px * freq;
    float qy = size * py * freq;

    float wi = 1.;
    if (i == 0) wi = 1. - fade;
    if (i == 4) wi = fade;

    vec2 fx = fract(qx);
    float fy = fract(qy);
    float shift = .5 + absIdx * .3;
    float uvY = floor(qy) / 50. + shift;
    vec2 s0a = texture(u_noiseTexture, fract(vec2(floor(qx.x) / 50. + shift, uvY))).rg;
    vec2 s1a = texture(u_noiseTexture, fract(vec2( ceil(qx.x) / 50. + shift, uvY))).rg;
    vec2 s0b = texture(u_noiseTexture, fract(vec2(floor(qx.y) / 50. + shift, uvY))).rg;
    vec2 s1b = texture(u_noiseTexture, fract(vec2( ceil(qx.y) / 50. + shift, uvY))).rg;
    vec2 ny0 = mix(vec2(s0a.r, s0b.r), vec2(s0a.g, s0b.g), fy);
    vec2 ny1 = mix(vec2(s1a.r, s1b.r), vec2(s1a.g, s1b.g), fy);
    vec2 n = mix(ny0, ny1, fx);

    sum += amp * wi * n;
    norm += amp * wi;
    amp *= .8;
  }

  vec2 r = sum / norm;
  float dx = .5 + r.x - r.y;
  return 3. * dx * dx;
}

float getFiber(vec2 p) {
  float size = mix(2., .4, u_fiberSize);
  float w = max(length(dFdx(p)), length(dFdy(p)));
  float level = -log2(w + 1e-8);
  float baseLevel = floor(level) - 3.;
  float fade = fract(level);

  vec2 grad = vec2(0.);
  float scale = 1.;
  float amp = 1.;
  for (int i = 0; i < 5; i++) {
    float absIdx = baseLevel + float(i);
    float freq = pow(1.7, absIdx);
    vec2 q = size * p * freq;

    float an = absIdx * .8;
    float rc = cos(an), rs = sin(an);
    q = vec2(rc * q.x - rs * q.y, rs * q.x + rc * q.y);

    float wi = 1.;
    if (i == 0) wi = 1. - fade;
    if (i == 4) wi = fade;

    vec2 iq = floor(q);
    vec2 fq = fract(q);
    float shift = absIdx * .3;
    vec4 uv = fract(vec4(iq, iq + 1.) / 50. + .5 + shift);
    float aF = texture(u_noiseTexture, uv.xy).b;
    float bF = texture(u_noiseTexture, uv.zy).b;
    float cF = texture(u_noiseTexture, uv.xw).b;
    float dF = texture(u_noiseTexture, uv.zw).b;
    vec2 u = fq * fq * (3. - 2. * fq);
    vec2 du = 8. * fq * (1. - fq);
    float dx = du.x * mix(bF - aF, dF - cF, u.y);
    float dy = du.y * mix(cF - aF, dF - bF, u.x);
    grad += wi * amp * scale * vec2(rc * dx + rs * dy, -rs * dx + rc * dy);
    scale *= 1.7;
    amp *= .5;
  }

  return min(1., .5 * length(grad));
}

vec2 randomGB(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, fract(uv)).gb;
}

float getDrops(vec2 uv) {
  vec2 iDropsUV = floor(uv);
  vec2 fDropsUV = fract(uv);
  float dropsMinDist = 1.;
  for (int y = -1; y < 2; y += 1) {
    for (int x = -1; x < 2; x += 1) {
      vec2 neighbor = vec2(float(y), float(x));
      vec2 offset = randomGB(iDropsUV + neighbor);
      offset = .5 + .5 * sin(10. * u_seed + TWO_PI * offset);
      vec2 pos = neighbor + offset - fDropsUV;
      float dist = length(pos);
      dropsMinDist = min(dropsMinDist, dropsMinDist*dist);
    }
  }
  return 1. - lst(.05, .09, sqrt(dropsMinDist));
}

vec4 getFolds(vec2 uv1, vec2 uv2) {
  vec3 pp1 = vec3(0.), pp2 = vec3(0.);
  float l1 = 9., l2 = 9.;
  float cellRand = 0.;
  for (int i = 0; i < 20; i++) {
    if (float(i) >= floor(u_foldCount + .5)) break;
    vec2 rand = randomGB(vec2(float(i), float(i) * u_seed));
    float an = rand.x * TWO_PI;
    vec2 p = vec2(cos(an), sin(an)) * rand.y;
    float dist1 = distance(uv1, p);
    if (dist1 < l1) {
      l1 = dist1;
      pp1 = vec3(uv1.x - p.x, dist1, rand.y);
    }
    float dist2 = distance(uv2, p);
    if (dist2 < l2) {
      l2 = dist2;
      pp2 = vec3(uv2.x - p.x, dist2, rand.y);
      cellRand = .5 * (rand.x + rand.y);
    }
  }
  float mult2 = mix(.22, .02, 1.);
  return vec4(
    mix(pp1.x, .17 * pp1.z, pow(pp1.y, mult2)),
    mix(pp2.x, .18 * pp2.z, pow(pp2.y, mult2)),
    .2 * pp2.y,
    cellRand
  );
}

vec4 getCrease(float coord, float offset, float count) {
  float g = (coord - 1.) * count + .5 * offset;
  float crX = fract(g);
  float creaseIdx = floor(g);
  float depthMod = .7 + .3 * fract(sin(creaseIdx * 127.1 + u_seed * 3.7) * 43758.5453);
  float dx = crX - .5;
  float foldWidth = mix(.1, .5, u_foldsShape);
  float foldAmount = (1. - smoothstep(0., foldWidth, abs(dx))) * depthMod;
  float slope = sign(dx) * foldAmount;
  float creaseDark = smoothstep(0., foldWidth * .5, abs(dx));
  return vec4(slope, creaseDark, abs(dx), foldAmount);
}

vec3 blendMultiply(vec3 base, vec3 blend) {
  return base * blend;
}
vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
  return blendMultiply(base, blend) * opacity + base * (1. - opacity);
}

void main() {

  vec2 imageUV = v_imageUV;
  vec2 fromCenter = imageUV - .5;
  vec2 patternUV = v_imageUV - .5;
  patternUV *= 5. * vec2(u_imageAspectRatio, 1.);

  float pattern = 0.;
  float radialDistortion = 0.;
  float xDistortion = 0.;
  float yShift = 0.;
  float scaleDistortion = 0.;

  float fade = u_fade * getFadeMask(.3 * patternUV + 10. * u_seed);
  fade = clamp(8. * fade * fade * fade, 0., 1.);

  float drops = 0.;
  if (u_drops > 0.) {
    drops = getDrops(patternUV * 2.);
    drops = mix(drops, 0., fade);
  }

  if (u_folds > 0.) {
    if (u_foldType < .5) {
      vec2 foldsUV1 = rotate(patternUV * .18, 4. * u_seed);
      vec2 foldsUV2 = foldsUV1 + .02 * sin(2. * u_seed) * (texture(u_noiseTexture, fract(patternUV * .02 + u_seed)).rg - .5);
      vec4 foldsRaw = getFolds(foldsUV1, foldsUV2);
      vec4 radialFolds = vec4(clamp(5. * foldsRaw.xyz, 0., 1.), foldsRaw.w);
      radialFolds.xyz = mix(radialFolds.xyz, vec3(.5), .4 * fade);
      float foldsPattern = radialFolds.x + radialFolds.y;

      pattern += u_folds * foldsPattern;

      vec2 fromCenter = imageUV - .5;
      scaleDistortion = .22 * radialFolds.z * u_folds;
    } else {
      vec2 uv = imageUV + .5;
      float countX = mix(25., 1., pow(u_foldSize, .4));
      vec4 h = getCrease(uv.x, 1. - u_foldOffset, countX);

      if (u_foldY) {
        vec4 v = getCrease(uv.y, 1., 1.);
        float ax = h.x * 1.1345;
        float ay = v.x * 1.1345;
        float gridDark = h.y * v.y;
        float crLight = max(-.7 * sin(ax) - .2 * sin(ay) + .5 * cos(ax) * cos(ay), 0.) * mix(.9, 1., gridDark);
        drops *= mix(1., gridDark, u_folds);

        pattern += u_folds * crLight;
        float distortBaseH = mix(pow(h.y, .2), h.z, .5 * u_foldsShape);
        float distortBaseV = mix(pow(v.y, .2), v.z, .5 * u_foldsShape);
        xDistortion += .022 * u_folds * (1. - distortBaseV) * 2. * (imageUV.x - .5);
        patternUV.x += .022 * u_folds * (1. - distortBaseV);
        yShift += .022 * u_folds * (1. - distortBaseH);
      } else {
        float angle = h.x * 1.1345;
        float crLight = max(-.5 * sin(angle) + .5 * cos(angle), 0.) * mix(.9, 1., h.y);
        drops *= mix(1., h.y, u_folds);

        pattern += u_folds * crLight;
        float distortBase = mix(pow(h.y, .2), h.z, .5 * u_foldsShape);
        yShift += .022 * u_folds * (1. - distortBase);
      }
      patternUV.y += yShift;
    }
  }

  if (u_roughness > 0.) {
    float roughness = getRoughness(200. * patternUV);
    roughness *= mix(1., .3, fade);
    roughness *= u_roughness;
    pattern += roughness;
    radialDistortion += .02 * roughness;
  }

  if (u_fiber > 0.) {
    float fiber = getFiber(10. * patternUV);
    fiber *= mix(1., .3, fade);
    fiber *= u_fiber;
    pattern += fiber;
    radialDistortion += .02 * fiber;
  }

  if (u_drops > 0.) {
    drops *= u_drops;
    pattern += drops;
    xDistortion += .03 * drops;
  }

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  imageUV = .5 + fromCenter * (1. + u_distortion * scaleDistortion);
  imageUV.x += u_distortion * xDistortion;
  imageUV.y -= u_distortion * yShift;
  vec2 dc = imageUV - .5;
  float r2 = dot(dc, dc);
  imageUV = .5 + dc * (1. - abs(u_distortion) * radialDistortion * r2);

  float frameSoftness = .002 + .005 * abs(u_distortion) * (.7 * u_fiber + u_roughness);
  float frame = getUvFrame(imageUV, frameSoftness);
  vec4 image = texture(u_image, imageUV);
  frame *= image.a;

  vec3 color = fgColor * pattern;
  float opacity = fgOpacity * pattern;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  float maxC = max(max(image.r, image.g), image.b);
  float minC = min(min(image.r, image.g), image.b);
  float sat = maxC > 0. ? (maxC - minC) / maxC : 0.;
  float midC = image.r + image.g + image.b - maxC - minC;
  float secondaryness = maxC > minC ? (midC - minC) / (maxC - minC) : 0.;
  float satDampen = sat * (1. - .5 * secondaryness);
  float darkDampen = 1. - dot(vec3(.2126, .7152, .0722), image.rgb);
  float dampen = mix(0., .7, u_blending) * max(satDampen, darkDampen);

  vec3 pic = blendMultiply(image.rgb, color, u_blending);
  pic = mix(pic, vec3(1.), .4 * pow(dampen, 2. + 3. * pattern));

  color = mix(color, pic, frame);

  if (!u_background) {
    vec2 shadowUV = imageUV + vec2(-.01, -.015);
    float shadowFrame = getUvFrame(shadowUV, .05) * texture(u_image, shadowUV).a;
    float shadow = 1.2 * shadowFrame * (1. - frame);
    opacity = opacity * frame + shadow;
    color *= frame;
  }
  frame = mix(frame, 0., .2 * fade);


  fragColor = vec4(color, opacity);
}
`;
