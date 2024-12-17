export type SmokeRingUniforms = {
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_scale: number;
  u_thickness: number;
};

/**
 * Smoke Ring, based on https://codepen.io/ksenia-k/full/zYyqRWE
 * Renders a fractional Brownian motion (fBm) noise over the
 * polar coordinates masked with ring shape
 *
 * Uniforms include:
 * u_colorBack: The back color of the scene
 * u_color1: Main color of the ring
 * u_color2: The third color of the mesh gradient
 * u_color4: The fourth color of the mesh gradient
 * u_scale: The scale of the noise
 * u_thickness: The thickness of the ring
 */

export const smokeRingFragmentShader = `

  precision highp float;

  uniform vec4 u_colorBack;
  uniform vec4 u_color1;
  uniform vec4 u_color2;
  uniform float u_scale;
  uniform float u_thickness;
  uniform vec2 u_resolution;
  uniform float u_time;

    #define TWO_PI 6.28318530718
    #define PI 3.14159265358979323846

    float rand(vec2 n) {
        return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }
    float noise(vec2 n) {
        const vec2 d = vec2(0.0, 1.0);
        vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
        return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
    }
    float fbm(vec2 n) {
        float total = 0.0, amplitude = .4;
        for (int i = 0; i < 12; i++) {
            total += noise(n) * amplitude;
            n += n;
            amplitude *= 0.6;
        }
        return total;
    }

    float get_ring_shape(vec2 uv, float innerRadius, float outerRadius) {
        float distance = length(uv);
        float line_width = outerRadius - innerRadius;
        float ringValue = smoothstep(innerRadius, innerRadius + .8 * line_width, distance);
        ringValue -= smoothstep(outerRadius, outerRadius + 1.2 * line_width, distance);
        return clamp(ringValue, 0., 1.);
    }

    void main() {

        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float ratio = u_resolution.x / u_resolution.y;

        uv -= .5;
        uv *= 2.;
        uv.x *= ratio;

        float t = u_time;

        float atg = atan(uv.y, uv.x);

        vec2 polar_uv = vec2(atg, length(uv));
        // polar_uv *= u_scale;

        float noise_left = fbm(polar_uv);
        // polar_uv.x = mod(polar_uv.x, u_scale * TWO_PI);
        // float noise_right = fbm(polar_uv);
        float noise = noise_left;

        float center_shape = 1. - pow(smoothstep(2., .0, length(uv)), 50.);

        float radius = .4 - .25 * u_thickness;
        float thickness = u_thickness;
        thickness = pow(thickness, 2.);

        float ring_shape = get_ring_shape(uv * (.5 + .6 * noise), radius - .2 * thickness, radius + .5 * thickness);
        
        float ring_shape_outer = 1. - pow(ring_shape, 7.);
        ring_shape_outer *= ring_shape;
        
        float ring_shape_inner = ring_shape - ring_shape_outer;
        ring_shape_inner *= ring_shape;

        float background = u_colorBack.a;
        
        float opacity = ring_shape_outer * u_color2.a;
        opacity += ring_shape_inner * u_color1.a;
        opacity += background * (1. - ring_shape_inner * u_color1.a - ring_shape_outer * u_color2.a);
        
        vec3 color = u_colorBack.rgb * (1. - ring_shape) * background;
        color += u_color2.rgb * ring_shape_outer * u_color2.a;
        color += u_color1.rgb * ring_shape_inner * u_color1.a;
        
        color += u_colorBack.rgb * ring_shape_inner * (1. - u_color1.a) * background;
        color += u_colorBack.rgb * ring_shape_outer * (1. - u_color2.a) * background;
                
        gl_FragColor = vec4(color, opacity);
    }
`;
