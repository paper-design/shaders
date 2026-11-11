# Perlin Noise

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Classic animated 3D Perlin noise with exposed controls. Original algorithm: https://www.shadertoy.com/view/NlSGDz

- React: `PerlinNoise` and `perlinNoisePresets` from `@paper-design/shaders-react`.
- Vanilla: `perlinNoiseFragmentShader` and `PerlinNoiseParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0.5, frame=0, fit="none", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/perlin-noise.ts`, `packages/shaders-react/src/shaders/perlin-noise.tsx`, `docs/src/shader-defs/perlin-noise-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorFront` | `string` | no | `"#fccff7"` | — | Foreground color in RGBA |
| `colorBack` | `string` | no | `"#632ad5"` | — | Background color in RGBA |
| `proportion` | `number` | no | `0.35` | editor range: 0…1 | Blend point between 2 colors, 0.5 = equal distribution |
| `softness` | `number` | no | `0.1` | editor range: 0…1 | Color transition sharpness, 0 = hard edge, 1 = smooth gradient |
| `octaveCount` | `number` | no | `1` | editor range: 1…8; step: 1 | Perlin noise octaves number, more octaves for more detailed patterns |
| `persistence` | `number` | no | `1` | editor range: 0.3…1 | Roughness, falloff between octaves |
| `lacunarity` | `number` | no | `1.5` | editor range: 1.5…10 | Frequency step, defines how compressed the pattern is |
