export type MetaballsUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_scale: number;
  u_dotSize: number;
  u_visibilityRange: number;
};

/**
 * Metaballs pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_scale: The scale applied to pattern
 */

export const metaballsFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_scale;
uniform float u_dotSize;
uniform float u_visibilityRange;

uniform float u_time;
uniform float u_ratio;
uniform vec2 u_resolution;

#define TWO_PI 6.28318530718

out vec4 fragColor;

float hash(float x) {
    return fract(sin(x) * 43758.5453123);
}
float lerp(float a, float b, float t) {
    return a + t * (b - a);
}
float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f); // Smoothstep function for interpolation
    return lerp(hash(i), hash(i + 1.0), u);
}
    
float get_dot_shape(vec2 uv, vec2 c, float p) {
    float s = .5 * length(uv - c);
    s = 1. - clamp(s, 0., 1.);
    s = pow(s, p);
    return s;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float ratio = u_resolution.x / u_resolution.y;

    uv -= .5;
    uv *= u_scale;
    uv += .5;
    uv.x *= ratio;

    float t = u_time;

    vec3 total_color = vec3(0.);
    float total_shape = 0.;

    const int max_balls_number = 15;
    for (int i = 0; i < max_balls_number; i++) {
        vec2 pos = vec2(.5) + 1e-4;
        float idx_fract = float(i) / float(max_balls_number);
        float angle = TWO_PI * idx_fract;
    
        float speed = 1. - .2 * idx_fract;
        float noiseX = noise(angle * 10. + float(i) + t * speed);
        float noiseY = noise(angle * 20. + float(i) - t * speed);
        
        pos += 7. * (vec2(noiseX, noiseY) - .5);
                       
        vec4 dot_color;
        if (i % 3 == 0) {
            dot_color = u_color1;
        } else if (i % 3 == 1) {
            dot_color = u_color2;
        } else {
            dot_color = u_color3;
        }
        
        float shape = get_dot_shape(uv, pos, 6. - 4. * u_dotSize) * dot_color.a;
        
        shape *= smoothstep((float(i) - 1.) / float(max_balls_number), idx_fract, u_visibilityRange);

        total_color += dot_color.rgb * shape;
        total_shape += shape;
    }

    total_color /= max(total_shape, 1e-4);

    float edge_width = fwidth(total_shape);
    float final_shape = smoothstep(.4, .4 + edge_width, total_shape);

    vec3 color = total_color * final_shape;
    float opacity = final_shape;

    if (opacity < .01) {
        discard;
    }

    fragColor = vec4(color, opacity);
}
`;
