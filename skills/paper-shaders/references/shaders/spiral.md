# Spiral

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

A single-colored animated spiral that morphs across a wide range of shapes - from crisp, thin-lined geometry to flowing whirlpool forms and wavy, abstract rings.

- React: `Spiral` and `spiralPresets` from `@paper-design/shaders-react`.
- Vanilla: `spiralFragmentShader` and `SpiralParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="none", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/spiral.ts`, `packages/shaders-react/src/shaders/spiral.tsx`, `docs/src/shader-defs/spiral-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#001429"` | — | Background color in RGBA |
| `colorFront` | `string` | no | `"#79D1FF"` | — | Foreground (ink) color in RGBA |
| `density` | `number` | no | `1` | editor range: 0…1 | Spacing falloff simulating perspective, 0 = flat spiral |
| `distortion` | `number` | no | `0` | editor range: 0…1 | Power of shape distortion applied along the spiral |
| `strokeWidth` | `number` | no | `0.5` | editor range: 0…1 | Thickness of spiral curve |
| `strokeTaper` | `number` | no | `0` | editor range: 0…1 | How much stroke loses width away from center, 0 = full visibility |
| `strokeCap` | `number` | no | `0` | editor range: 0…1 | Extra stroke width at the center, no effect with strokeWidth = 0.5 |
| `noise` | `number` | no | `0` | editor range: 0…1 | Noise distortion applied over the canvas, no effect with noiseFrequency = 0 |
| `noiseFrequency` | `number` | no | `0` | editor range: 0…1 | Noise frequency, no effect with noise = 0 |
| `softness` | `number` | no | `0` | editor range: 0…1 | Color transition sharpness, 0 = hard edge, 1 = smooth gradient |
