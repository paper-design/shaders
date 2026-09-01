import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, proceduralHash11, proceduralHash22 } from '../shader-utils.js';

export const paperTextureMeta = {
  maxCrumpleCount: 15,
} as const;

/**
 * Static paper-like texture built from a combination of grain, noise and multiple fold patterns.
 * Works as an image filter or as a standalone texture.
 *
 * Fragment shader uniforms:
 * - u_image (sampler2D): Optional source image texture
 * - u_isImage (bool): Whether a source image was provided
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorBack (vec4): Color of the bottom layer, behind the sheet; visible where u_clip cuts the sheet away, in RGBA
 * - u_colorPaper (vec4): Color of the paper sheet, usually light; multiplied into the image by u_blending, in RGBA
 * - u_colorShadow (vec4): Color used for crumples, folds, grain and speckles, blends into the image, in RGBA
 * - u_roughness (float): Grain noise, sized independently of scaling, with its level of detail depending on the scale (0 to 1)
 * - u_roughnessSize (float): Scale of the roughness noise, needs u_roughness > 0 (0 to 1)
 * - u_roughnessRows (float): Lines the grain up into horizontal rows; 0 = even scatter, 1 = laid-paper rows, needs u_roughness > 0 (0 to 1)
 * - u_fiber (float): Curly fiber noise, simulating real paper (0 to 1)
 * - u_fiberSize (float): Scale of the fiber noise, needs u_fiber > 0 (0 to 1)
 * - u_crumples (float): Depth of the centered, irregular field of facets across the sheet (0 to 1)
 * - u_crumpleCount (float): Number of crumples, needs u_crumples > 0 (2 to 15)
 * - u_wrinkles (float): Depth of a field of fine facets, independent of the crumples (0 to 1)
 * - u_wrinkleSize (float): Size of the fine facets, needs u_wrinkles > 0 (0 to 1)
 * - u_folds (float): Depth of the straight folds, alternating between ridges and valleys (0 to 1)
 * - u_foldSizeX (float): Size of the vertical folds, needs u_folds > 0 (0 to 1)
 * - u_foldSizeY (float): Size of the horizontal folds, needs u_folds > 0 (0 to 1)
 * - u_foldOffsetX (float): Shifts the vertical folds across the surface, needs u_folds > 0 (0 to 1)
 * - u_foldOffsetY (float): Shifts the horizontal folds across the surface, needs u_folds > 0 (0 to 1)
 * - u_angle (float): Direction the surface is lit from in degrees, clockwise from the top of the canvas, needs u_crumples, u_folds or u_wrinkles > 0 (0 to 360)
 * - u_drops (float): Visibility of the speckle pattern (0 to 1)
 * - u_seed (float): Seed applied to every pattern (0 to 1000)
 * - u_blending (float): Amount of image-to-paper blending; 0 = original image color, 1 = image multiplied with the paper (colorPaper toned by colorShadow), needs image (0 to 1)
 * - u_distortion (float): How much the image bends with the paper surface; negative values bend it the opposite direction, needs image (-1 to 1)
 * - u_clip (bool): Cuts the paper sheet to the distorted image frame, revealing u_colorBack outside it, needs image
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): UV coordinates for sampling the source image, with fit, scale, rotation, and offset applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.01 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 *
 */

// language=GLSL
export const paperTextureFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colorBack;
uniform vec4 u_colorPaper;
uniform vec4 u_colorShadow;

uniform sampler2D u_image;
uniform bool u_isImage;
uniform float u_imageAspectRatio;

uniform float u_roughness;
uniform float u_fiber;
uniform float u_fiberSize;
uniform float u_crumples;
uniform float u_crumpleCount;
uniform float u_wrinkles;
uniform float u_wrinkleSize;
uniform float u_folds;
uniform float u_foldSizeX;
uniform float u_foldSizeY;
uniform float u_foldOffsetX;
uniform float u_foldOffsetY;
uniform float u_angle;
uniform float u_drops;
uniform float u_seed;
uniform float u_blending;
uniform float u_distortion;
uniform float u_roughnessSize;
uniform float u_roughnessRows;
uniform bool u_clip;
uniform sampler2D u_noiseTexture;

in vec2 v_imageUV;
out vec4 fragColor;

float getUvFrame(vec2 uv) {
  vec2 invAA = .5 / clamp(fwidth(uv), 1e-5, .02);
  vec2 lo = clamp(uv * invAA + .5, 0., 1.);
  vec2 hi = clamp((1. - uv) * invAA + .5, 0., 1.);
  return lo.x * hi.x * lo.y * hi.y;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

${declarePI}
${proceduralHash11}
${proceduralHash22}

float getRoughness(vec2 p, vec2 lightDir, vec2 seedShift, float basePixel) {
  vec2 u = p / vec2(2, 4);
  float w = 100. * basePixel;
  float eps = 4. * w;

  float size = mix(3.2, .8, u_roughnessSize);
  float logLac = log2(2.1);
  float level = -log2(w + 1e-8) / logLac;
  float baseLevel = floor(level) - 2.;
  float fade = fract(level);

  vec2 px = (u.x + vec2(eps, -eps)) * .1;
  float py = u.y * .1;

  vec2 sum = vec2(0.);
  float norm = 0., amp = .5;
  float freq = exp2(baseLevel * logLac);
  for (int i = 0; i < 4; i++) {
    float absIdx = baseLevel + float(i);
    vec2 qx = size * px * freq;
    float qy = size * py * freq;

    float wi = 1.;
    if (i == 0) wi = 1. - fade;
    if (i == 3) wi = fade;

    vec2 fx = fract(qx);
    float fy = fract(qy);
    vec2 shift = .5 + absIdx * .3 + seedShift;
    float uvY = floor(qy) / 50. + shift.y;
    vec2 s0a = texture(u_noiseTexture, fract(vec2(floor(qx.x) / 50. + shift.x, uvY))).rg;
    vec2 s1a = texture(u_noiseTexture, fract(vec2( ceil(qx.x) / 50. + shift.x, uvY))).rg;
    vec2 s0b = texture(u_noiseTexture, fract(vec2(floor(qx.y) / 50. + shift.x, uvY))).rg;
    vec2 s1b = texture(u_noiseTexture, fract(vec2( ceil(qx.y) / 50. + shift.x, uvY))).rg;
    vec2 ny0 = mix(vec2(s0a.r, s0b.r), vec2(s0a.g, s0b.g), fy);
    vec2 ny1 = mix(vec2(s1a.r, s1b.r), vec2(s1a.g, s1b.g), fy);
    vec2 n = mix(ny0, ny1, fx);

    sum += amp * wi * n;
    norm += amp * wi;
    amp *= .8;
    freq *= 2.1;
  }

  vec2 r = sum / norm;
  float dx = .5 + r.x - r.y;
  float grain = 3. * dx * dx - .7;

  float rowBand = fract(dot(p, lightDir) * .05 * size);
  return grain + .6 * u_roughnessRows * (rowBand - .5);
}

float getFiber(vec2 p, vec2 seedShift, float basePixel) {
  float size = mix(4., 1., u_fiberSize);
  float w = 50. * basePixel;
  float level = -log2(w + 1e-8);
  float baseLevel = floor(level) - 3.;
  float fade = fract(level);

  vec2 grad = vec2(0.);
  float scale = 1.;
  float amp = 1.;
  float freq = pow(1.7, baseLevel);
  for (int i = 0; i < 5; i++) {
    float absIdx = baseLevel + float(i);
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
    vec4 uv = fract(vec4(iq, iq + 1.) / 50. + .5 + shift + seedShift.xyxy);
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
    freq *= 1.7;
  }

  return clamp(.333 * length(grad), 0., 1.);
}

vec2 smoothNoise(vec2 p) {
  vec2 t = p * 50. - .5;
  vec2 i = floor(t);
  vec2 f = fract(t);
  f = f * f * (3. - 2. * f);
  return texture(u_noiseTexture, fract((i + f + .5) / vec2(50.))).rg;
}

float getDrops(vec2 uv, vec2 seedShift) {
  vec2 iDropsUV = floor(uv);
  vec2 fDropsUV = fract(uv);
  float dropsMinDist = 1.;
  for (int y = -1; y < 2; y += 1) {
    for (int x = -1; x < 2; x += 1) {
      vec2 neighbor = vec2(float(y), float(x));
      vec2 offset = hash22(iDropsUV + neighbor);
      offset = .5 + .5 * sin(10. * u_seed + TWO_PI * offset);
      vec2 pos = neighbor + offset - fDropsUV;
      dropsMinDist *= min(1., dot(pos, pos));
    }
  }
  return .5 * lst(.09, .08, sqrt(sqrt(dropsMinDist)));
}

vec2 getCellTilt(float idx, float radius) {
  vec2 rand = hash22(vec2(idx + 31., idx * u_seed + 17.));
  float an = rand.x * TWO_PI;
  return vec2(cos(an), sin(an)) * mix(.3, 1.7, rand.y * rand.y) * mix(.7, 1., radius);
}

vec2 getCrumpleDetail(vec2 uv, float freq, float shift, float basePixel, out float depth) {
  depth = 0.;
  vec2 v = uv * freq;
  float pixel = .9 * freq * basePixel;
  vec2 base = floor(v);
  float n1 = 9., n2 = 9.;
  vec2 s1 = vec2(0.), s2 = vec2(0.), q1 = vec2(0.), q2 = vec2(0.);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 cell = base + vec2(float(x), float(y));
      vec2 q = hash22(vec2(cell.y * 1.9 + 3.1 + shift, cell.x * 1.3 + .11 * u_seed));
      float keep = .8;
      if (q.y > keep) continue;

      vec2 r = hash22(vec2(cell.x + .37 * u_seed + shift + 11.1, cell.y - .21 * u_seed + 5.7));
      vec2 s = cell + .06 + .88 * r;

      vec2 d = v - s;
      float dsq = dot(d, d);
      if (dsq < n1) {
        n2 = n1;
        s2 = s1;
        q2 = q1;
        n1 = dsq;
        s1 = s;
        q1 = q;
      } else if (dsq < n2) {
        n2 = dsq;
        s2 = s;
        q2 = q;
      }
    }
  }

  if (n1 > 8.) return vec2(0.);

  float an1 = q1.x * TWO_PI, mag1 = q1.y / .8;
  vec2 t1 = vec2(cos(an1), sin(an1)) * mix(.3, 1.7, mag1 * mag1);
  float an2 = q2.x * TWO_PI, mag2 = q2.y / .8;
  vec2 t2 = vec2(cos(an2), sin(an2)) * mix(.3, 1.7, mag2 * mag2);

  vec2 span = s1 - s2;
  float spanLen = max(length(span), 1e-4);
  float toEdge = (n2 - n1) / (2. * spanLen);

  vec2 pair = hash22(s1 + s2 + 1.7 * abs(s1 - s2));
  float pairSoft = .01 + .1 * step(pair.x, .4);
  float b = clamp(toEdge / max(1.5 * pixel, .5 * pairSoft), 0., 1.);
  float d1 = max(sqrt(n1), 1e-4);
  depth = .2 * d1;
  float shoulderAmt = max(0., 1. - toEdge / .42) * b;
  vec2 shoulder = vec2(0.);
  if (shoulderAmt > 0.) {
    float d2 = max(sqrt(n2), 1e-4);
    shoulder = shoulderAmt * ((v - s2) / d2 - (v - s1) / d1);
  }

  vec2 mid = .5 * (t1 + t2);
  return mid + (t1 - mid) * b + .9 * shoulder;
}

vec4 getCrumples(vec2 uv) {
  float crumpleN = max(2., floor(u_crumpleCount + .5));
  float near = 9., nearB = 9.;
  float idx = 0., rad = 0.;
  vec2 nearP = vec2(0.), nearPb = vec2(0.);
  vec4 seeds[${paperTextureMeta.maxCrumpleCount}];
  for (int i = 0; i < ${paperTextureMeta.maxCrumpleCount}; i++) {
    if (float(i) >= crumpleN) break;
    vec2 rand = hash22(vec2(float(i), float(i) * u_seed));
    float an = rand.x * TWO_PI;
    vec2 p = vec2(cos(an), sin(an)) * rand.y;
    seeds[i] = vec4(p, rand);

    vec2 d = uv - p;
    float dsq = dot(d, d);
    if (dsq < near) {
      nearB = near;
      nearPb = nearP;
      near = dsq;
      idx = float(i);
      rad = rand.y;
      nearP = p;
    } else if (dsq < nearB) {
      nearB = dsq;
      nearPb = p;
    }
  }
  float l = sqrt(near), lb = sqrt(nearB);
  vec2 dir = (uv - nearP) / max(l, 1e-4);
  float edge = lst(0., .5, lb - l);

  float shoulderLimit = l + .5;

  vec2 tilt = getCellTilt(idx, rad);
  float tiltSum = 1.;
  vec2 wide = vec2(0.);
  float wideSum = 0.;
  float toEdge = 9., edgeSoft = 0.;

  for (int i = 0; i < ${paperTextureMeta.maxCrumpleCount}; i++) {
    if (float(i) >= crumpleN) break;
    if (float(i) == idx) continue;
    vec4 seed = seeds[i];
    vec2 p = seed.xy;
    vec2 rand = seed.zw;

    vec2 d = uv - p;
    float dsq = dot(d, d);

    if (dsq < shoulderLimit * shoulderLimit) {
      float di = sqrt(dsq);
      float shoulder = lst(.5, 0., di - l);
      wide += shoulder * (d / max(di, 1e-4) - dir);
      wideSum += shoulder;
    }

    float pairSoft = .01 + .05 * step(.2, rand.x) + .3 * rand.y;
    float toBisector = (dsq - near) / (.2 * max(length(p - nearP), 1e-4));
    if (toBisector < toEdge) {
      toEdge = toBisector;
      edgeSoft = pairSoft;
    }

    float w = 1. - toBisector / pairSoft;
    if (w > 0.) {
      w *= w;
      tilt += w * getCellTilt(float(i), rand.y);
      tiltSum += w;
    }
  }

  float blend = clamp(toEdge / edgeSoft, 0., 1.);
  vec2 sharp = (1. - edge) * ((uv - nearPb) / max(lb, 1e-4) - dir);
  vec2 rounding = mix(sharp, wide / max(wideSum, 1.), min(2. * edgeSoft, 1.));
  float radial = l / max(l + toEdge, 1e-4);

  return vec4(tilt / tiltSum + rounding * blend * radial, .2 * l, edge);
}

void getFolds(vec2 coord, vec2 offset, vec2 count, vec2 noise, vec2 baseFwidth, out vec2 slope, out vec2 dark, out vec2 lift) {
  vec2 g = coord * count + .5 * offset + noise;
  vec2 dx = fract(g) - .5;
  vec2 adx = abs(dx);
  float foldRadius = .3;
  vec2 t = clamp(adx / foldRadius, 0., 1.);
  dark = t * t * (3. - 2. * t);
  lift = 1. - t;
  lift *= lift;

  vec2 crease = clamp(dx / max(count * baseFwidth, 1e-5), -1., 1.);
  slope = crease * (1. - dark);

  vec2 lineWidth = .02 * count * mix(vec2(2.5), vec2(.8), dark.yx) + .1 * noise;
  slope -= 1. - smoothstep(vec2(0.), lineWidth, adx);
}

void main() {

  vec2 patternUV = (v_imageUV - .5) * vec2(u_imageAspectRatio, 1.);
  float basePixel = max(length(dFdx(patternUV)), length(dFdy(patternUV)));
  vec2 baseFwidth = fwidth(patternUV);

  float pattern = 0.;

  float crumpleDepth = 0.;
  float wrinkleDepth = 0.;
  float foldDepth = 0.;
  float roughness = 0.;
  float fiber = 0.;
  float drops = 0.;

  float grazing = 0.7;
  float lightRad = radians(u_angle);
  vec2 lightDir = vec2(sin(lightRad), -cos(lightRad));
  vec2 relief = vec2(0.);
  float reliefAmount = 0.;
  float foldInk = 1.;
  vec2 crumpleFlow = vec2(0.);

  vec2 warpNoise = vec2(0.);
  if (u_crumples > 0. || u_folds > 0. || u_wrinkles > 0.) {
    warpNoise = smoothNoise(patternUV * .1 + .2 + .6 * fract(.017 * u_seed)) - .5;
  }
  vec2 crumplesUV = (patternUV * .9) + .012 * warpNoise;

  if (u_crumples > 0.) {
    vec4 crumples = getCrumples(crumplesUV);

    vec2 crumpleTilt = .5 * u_crumples * crumples.xy;
    crumpleTilt -= .1 * max(dot(crumpleTilt, lightDir), 0.) * lightDir;
    relief += crumpleTilt;
    reliefAmount += .6 * u_crumples;
    crumpleFlow = crumples.w * crumpleTilt;

    crumpleDepth = clamp(5. * crumples.z, 0., 1.);
  }

  if (u_wrinkles > 0.) {
    float detailFreq = mix(10., 1., u_wrinkleSize);
    float detailAmp = .2;
    vec2 detailGrad = vec2(0.);
    float detailDepth = 0., depthSum = 0.;
    for (int i = 0; i < 3; i++) {
      float layerDepth;
      detailGrad += detailAmp * getCrumpleDetail(crumplesUV, detailFreq, 31. * float(i), basePixel, layerDepth);
      detailDepth += detailAmp * layerDepth;
      depthSum += detailAmp;
      detailAmp *= (.5 + .2 * detailGrad.x);
      detailFreq *= 2.1;
    }

    vec2 detailTilt = 1.5 * u_wrinkles * detailGrad;
    detailTilt -= .65 * max(dot(detailTilt, lightDir), 0.) * lightDir;
    relief += detailTilt;
    reliefAmount += .6 * u_wrinkles;

    wrinkleDepth = clamp(5. * detailDepth / max(depthSum, 1e-4), 0., 1.);
  }

  if (u_folds > 0.) {
    vec2 foldOffset = vec2(1. - 2. * u_foldOffsetX, 1. - 2. * u_foldOffsetY);
    vec2 foldCount = vec2(mix(3., .5, u_foldSizeX), mix(3., .5, u_foldSizeY));
    vec2 foldNoise = .005 * warpNoise * foldCount;
    vec2 uv = patternUV + .03 * crumpleFlow;

    vec2 slope, dark, lift;
    getFolds(uv, foldOffset, foldCount, foldNoise, baseFwidth, slope, dark, lift);

    relief += u_folds * slope;
    reliefAmount += 1. * u_folds;
    vec2 ink = mix(vec2(.96), vec2(1.), dark);
    float flatness = dark.x * dark.y;
    foldInk *= mix(1., ink.x * ink.y * mix(.5, .3, flatness), u_folds);

    foldDepth = u_folds * (lift.y * lightDir.y - lift.x * lightDir.x);
  }

  float unlit = cos(grazing);
  float lit = unlit;

  if (reliefAmount > 0.) {
    float lightFalloff = clamp(.5 + dot(v_imageUV - .5, lightDir), 0., 1.);
    float lightPower = mix(.5, 1., lightFalloff);
    float slope = clamp(dot(relief, lightDir), -1.2, 1.2);
    lit = max(cos(slope + grazing), 0.);

    pattern += (clamp(reliefAmount, 0., 1.) * unlit + (lit - unlit)) * foldInk * lightPower;
  }

  patternUV += .04 * crumpleFlow;

  vec2 seedShift = floor(fract(u_seed * vec2(.7548776662, .5698402909)) * 50.) / 50.;

  if (u_roughness > 0.) {
    roughness = u_roughness * getRoughness(1000. * patternUV, lightDir, seedShift, basePixel);
    pattern += roughness;
  }

  if (u_fiber > 0.) {
    fiber = u_fiber * getFiber(50. * patternUV, seedShift, basePixel);
    pattern += fiber;
  }

  if (u_drops > 0.) {
    drops = u_drops * getDrops(patternUV * 10., seedShift);
  }

  pattern = clamp(pattern, 0., 1.);

  vec3 backColor = u_colorBack.rgb * u_colorBack.a;
  float backOpacity = u_colorBack.a;
  vec3 baseColor = u_colorPaper.rgb * u_colorPaper.a;
  float baseOpacity = u_colorPaper.a;
  vec3 shadowColor = u_colorShadow.rgb * u_colorShadow.a;
  float shadowOpacity = u_colorShadow.a;

  float notClipped = u_clip ? .1 : 1.;
  float scaleDistortion = .15 * u_crumples * (crumpleDepth - .5) + .09 * u_wrinkles * (wrinkleDepth - .5) + .05 * (foldDepth);
  vec2 linearDistortion = notClipped * .002 * lightDir * drops;
  float radialDistortion = notClipped * .02 * (roughness + fiber);
  vec2 centeredUV = (v_imageUV - .5) * (1. - u_distortion * scaleDistortion);
  centeredUV -= u_distortion * linearDistortion;
  vec2 imageUV = .5 + centeredUV * (1. - abs(u_distortion) * radialDistortion * dot(centeredUV, centeredUV));

  vec3 color = shadowColor * pattern;
  float opacity = shadowOpacity * pattern;
  color += baseColor * (1. - opacity);
  opacity += baseOpacity * (1. - opacity);

  if (u_isImage) {
    float frame = getUvFrame(imageUV);
    vec4 image = texture(u_image, imageUV);
    frame *= image.a;

    float maxC = max(max(image.r, image.g), image.b);
    float minC = min(min(image.r, image.g), image.b);
    float sat = maxC > 0. ? (maxC - minC) / maxC : 0.;
    float midC = image.r + image.g + image.b - maxC - minC;
    float secondaryness = maxC > minC ? (midC - minC) / (maxC - minC) : 0.;
    float satDampen = sat * (1. - .5 * secondaryness);
    float darkDampen = 1. - dot(vec3(.2126, .7152, .0722), image.rgb);
    float dampen = mix(0., .7, u_blending) * max(satDampen, darkDampen);

    vec3 paper = vec3(1.) - opacity + color;
    vec3 pic = image.rgb * paper * u_blending + image.rgb * (1. - u_blending);
    pic = mix(pic, vec3(1.), .6 * pow(dampen, 2. + 3. * pattern));

    color = mix(color, pic, frame);
    opacity = frame + opacity * (1. - frame);

    if (u_clip) {
      color *= frame;
      opacity *= frame;
    }
  }

  color *= mix(vec3(1.), .5 * u_colorShadow.rgb, drops * shadowOpacity);

  color += backColor * (1. - opacity);
  opacity += backOpacity * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`;

export interface PaperTextureUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_isImage: boolean;
  u_noiseTexture?: HTMLImageElement;
  u_colorBack: [number, number, number, number];
  u_colorPaper: [number, number, number, number];
  u_colorShadow: [number, number, number, number];
  u_roughness: number;
  u_roughnessSize: number;
  u_roughnessRows: number;
  u_fiber: number;
  u_fiberSize: number;
  u_crumples: number;
  u_crumpleCount: number;
  u_wrinkles: number;
  u_wrinkleSize: number;
  u_folds: number;
  u_foldSizeX: number;
  u_foldSizeY: number;
  u_foldOffsetX: number;
  u_foldOffsetY: number;
  u_angle: number;
  u_drops: number;
  u_seed: number;
  u_blending: number;
  u_distortion: number;
  u_clip: boolean;
}

export interface PaperTextureParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  colorPaper?: string;
  colorShadow?: string;
  roughness?: number;
  roughnessSize?: number;
  roughnessRows?: number;
  fiber?: number;
  fiberSize?: number;
  crumples?: number;
  crumpleCount?: number;
  wrinkles?: number;
  wrinkleSize?: number;
  folds?: number;
  foldSizeX?: number;
  foldSizeY?: number;
  foldOffsetX?: number;
  foldOffsetY?: number;
  angle?: number;
  drops?: number;
  seed?: number;
  blending?: number;
  distortion?: number;
  clip?: boolean;
}
