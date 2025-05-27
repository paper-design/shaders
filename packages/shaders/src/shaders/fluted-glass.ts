import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';

/**
 */
export const flutedGlassFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_image;
uniform float u_image_aspect_ratio;

uniform float u_numSegments;
uniform float u_inputOutputRatio;
uniform float u_overlap;
//uniform float u_frost;
uniform float u_lightStrength;

${sizingVariablesDeclaration}

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec2 rotate(vec2 v, float angle) {
  float cosA = cos(angle);
  float sinA = sin(angle);
  return vec2(
    v.x * cosA - v.y * sinA,
    v.x * sinA + v.y * cosA
  );
}

float uvFrame(vec2 uv) {
  return step(1e-3, uv.x) * step(uv.x, 1. - 1e-3) * step(1e-3, uv.y) * step(uv.y, 1. - 1e-3);
}

void main() {
  vec2 patternUV = v_patternUV;

  vec2 imageUV = v_responsiveUV + .5;
  float screenRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  float imageRatio = u_image_aspect_ratio;

  imageUV.y = 1. - imageUV.y;

  imageUV -= .5;
  if (screenRatio > imageRatio) {
    imageUV.x = imageUV.x * screenRatio / imageRatio;
  } else {
    imageUV.y = imageUV.y * imageRatio / screenRatio;
  }
  imageUV += .5;

  vec2 uv = imageUV;

  float segmentWidth = 1.0 / u_numSegments;
  float inputSegmentWidth = segmentWidth * u_inputOutputRatio;
  float overlapWidth = segmentWidth * u_overlap;

  // Determine which segment we are in
  float segmentIndex = floor(uv.x / segmentWidth);
  float segmentStart = segmentIndex * segmentWidth;
  float segmentEnd = segmentStart + segmentWidth;

  // Calculate the local uv within the segment
  float localUVx = (uv.x - segmentStart) / segmentWidth;

  // Apply log compression to the x coordinate within the segment
  float compressedX = log(1.0 + localUVx * 9.0) / log(10.0);

  // Calculate the corresponding input UV
  float inputSegmentStart = segmentIndex * (inputSegmentWidth - overlapWidth);
  vec2 inputUV = vec2(inputSegmentStart + compressedX * inputSegmentWidth, uv.y);

  // Get the color from the input image
  vec4 color = texture(u_image, inputUV);

  // Apply the vertical gradient
  float gradientMidpoint = 0.8;
  float gradientStrength = smoothstep(gradientMidpoint, 1.0, uv.y);
  color = mix(color, vec4(0.0, 0.0, 0.0, 0.5), gradientStrength * 0.5);

  // Apply the black gradient on the right side of each segment
  float rightGradientStrength = smoothstep(0.8, 1.0, localUVx);
  color = mix(color, vec4(0.0, 0.0, 0.0, rightGradientStrength), rightGradientStrength * u_lightStrength);

  // Apply the white gradient on the left side of each segment
  float leftGradientStrength = smoothstep(0.1, 0.0, localUVx);
  color = mix(color, vec4(1.0, 1.0, 1.0, leftGradientStrength), leftGradientStrength * u_lightStrength);

  // vec4 imgTexture = texture(u_image, imageUV);
  // vec3 color = imgTexture.rgb;
  //  float opacity = uvFrame(uv);
  float opacity = 1.;

  //  fragColor = vec4(color, opacity);
  fragColor = vec4(color.rgb, opacity);
}

`;

export interface FlutedGlassUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | null;
  u_numSegments: number;
  u_inputOutputRatio: number;
  u_overlap: number;
  // u_frost: number;
  u_lightStrength: number;
}

export interface FlutedGlassParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | null;
  numSegments?: number;
  inputOutputRatio?: number;
  overlap?: number;
  // frost?: number;
  lightStrength?: number;
}
