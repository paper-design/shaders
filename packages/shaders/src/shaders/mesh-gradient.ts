export type MeshGradientUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_color4: [number, number, number, number];
};

/**
 * Mesh Gradient, based on https://www.shadertoy.com/view/wdyczG
 * Renders a mesh gradient with a rotating noise pattern
 * and several layers of fractal noise
 *
 * Uniforms include:
 * u_color1: The first color of the mesh gradient
 * u_color2: The second color of the mesh gradient
 * u_color3: The third color of the mesh gradient
 * u_color4: The fourth color of the mesh gradient
 */

export const meshGradientFragmentShader = `#version 300 es
precision highp float;

// Mesh Gradient: https://www.shadertoy.com/view/wdyczG
#define S(a,b,t) smoothstep(a,b,t)

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

vec2 hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
    vec2 u = f*f*(3.0-2.0*f);

    float n = mix( mix( dot( -1.0+2.0*hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                        dot( -1.0+2.0*hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                   mix( dot( -1.0+2.0*hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                        dot( -1.0+2.0*hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
    return 0.5 + 0.5*n;
}


void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float ratio = u_resolution.x / u_resolution.y;
    
    uv /= u_pixelRatio;
    
    vec2 tuv = uv;
    tuv -= .5;

    // rotate with Noise
    float degree = noise(vec2(u_time, tuv.x * tuv.y));

    tuv.y *= 1./ratio;
    tuv *= Rot(radians((degree-.5)*720.+180.));
    tuv.y *= ratio;


    // Wave warp with sin
    float frequency = 5.;
    float amplitude = 30.;
    float speed = u_time * 2.;
    tuv.x += sin(tuv.y*frequency+speed)/amplitude;
    tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);


    float proportion_1 = S(-.3, .2, (tuv*Rot(radians(-5.))).x);
    vec3 layer1_color = mix(u_color1.rgb * u_color1.a, u_color2.rgb * u_color2.a, proportion_1);
    float layer1_opacity = mix(u_color1.a, u_color2.a, proportion_1);
    vec3 layer2_color = mix(u_color3.rgb * u_color3.a, u_color4.rgb * u_color4.a, proportion_1);
    float layer2_opacity = mix(u_color3.a, u_color4.a, proportion_1);

    float proportion_2 = S(.5, -.3, tuv.y);
    vec3 color = mix(layer1_color, layer2_color, proportion_2);
    float opacity = mix(layer1_opacity, layer2_opacity, proportion_2);
    
    fragColor = vec4(color, opacity);
}
`;
