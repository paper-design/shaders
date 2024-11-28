export type NeuroNoiseUniforms = {
    u_color1: [number, number, number];
};

export const neuroNoiseFragmentShader = `
    precision mediump float;

    uniform vec3 u_color1;
    uniform float u_time;
    uniform float u_ratio;
    uniform vec2 u_resolution;

    vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
    }

    float neuro_shape(vec2 uv, float t) {
        vec2 sine_acc = vec2(0.);
        vec2 res = vec2(0.);
        float scale = 8.;

        for (int j = 0; j < 15; j++) {
            uv = rotate(uv, 1.);
            sine_acc = rotate(sine_acc, 1.);
            vec2 layer = uv * scale + float(j) + sine_acc - t;
            sine_acc += sin(layer);
            res += (.5 + .5 * cos(layer)) / scale;
            scale *= (1.2);
        }
        return res.x + res.y;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float ratio = u_resolution.x / u_resolution.y;
        vec2 uv_r = uv;
        uv_r.x *= ratio;

        float t = u_time;
        vec3 color = vec3(0.);

        float noise = neuro_shape(uv_r, t);

        noise = 1.2 * pow(noise, 3.);
        noise += pow(noise, 10.);
        noise = max(.0, noise - .5);
        noise *= (1. - length(uv - .5));

        color = normalize(u_color1);

        color = mix(vec3(0.), color, noise);

        gl_FragColor = vec4(color, 1.);
    }
`;
