# Swirl

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Animated bands of color twisting and bending, producing spirals, arcs, and flowing circular patterns.

- React: `Swirl` and `swirlPresets` from `@paper-design/shaders-react`.
- Vanilla: `swirlFragmentShader` and `SwirlParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0.32, frame=0, fit="contain", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/swirl.ts`, `packages/shaders-react/src/shaders/swirl.tsx`, `docs/src/shader-defs/swirl-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#330000"` | — | Background color in RGBA |
| `colors` | `string[]` | no | `["#ffd1d1","#ff8a8a","#660000"]` | implementation capacity: 10 | Up to 10 stripe colors in RGBA |
| `bandCount` | `number` | no | `4` | editor range: 0…15; step: 1 | Number of color bands, 0 = concentric ripples |
| `twist` | `number` | no | `0.1` | editor range: 0…1 | Vortex power, 0 = straight sectoral shapes |
| `center` | `number` | no | `0.2` | editor range: 0…1 | How far from the center the swirl colors begin to appear |
| `proportion` | `number` | no | `0.5` | editor range: 0…1 | Blend point between colors, 0.5 = equal distribution |
| `softness` | `number` | no | `0` | editor range: 0…1 | Color transition sharpness, 0 = hard edge, 1 = smooth gradient |
| `noiseFrequency` | `number` | no | `0.4` | editor range: 0…1 | Noise frequency, no effect with noise = 0 |
| `noise` | `number` | no | `0.2` | editor range: 0…1 | Strength of noise distortion, no effect with noiseFrequency = 0 |
