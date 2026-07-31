# Static Mesh Gradient

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Multi-point mesh gradient with up to 10 color spots, enhanced by two-direction warping, adjustable blend sharpness, and grain controls.

- React: `StaticMeshGradient` and `staticMeshGradientPresets` from `@paper-design/shaders-react`.
- Vanilla: `staticMeshGradientFragmentShader` and `StaticMeshGradientParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0, frame=0, fit="contain", scale=1, rotation=270, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/static-mesh-gradient.ts`, `packages/shaders-react/src/shaders/static-mesh-gradient.tsx`, `docs/src/shader-defs/static-mesh-gradient-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colors` | `string[]` | no | `["#ffad0a","#6200ff","#e2a3ff","#ff99fd"]` | — | Up to 10 gradient colors in RGBA |
| `positions` | `number` | no | `2` | editor range: 0…100 | Color spots placement seed |
| `waveX` | `number` | no | `1` | editor range: 0…1 | Strength of sine wave distortion along X axis |
| `waveXShift` | `number` | no | `0.6` | editor range: 0…1 | Phase offset applied to the X-axis wave |
| `waveY` | `number` | no | `1` | editor range: 0…1 | Strength of sine wave distortion along Y axis |
| `waveYShift` | `number` | no | `0.21` | editor range: 0…1 | Phase offset applied to the Y-axis wave |
| `mixing` | `number` | no | `0.93` | editor range: 0…1 | Blending behavior, 0 = hard stripes, 0.5 = smooth, 1 = gradual blend |
| `grainMixer` | `number` | no | `0` | editor range: 0…1 | Strength of grain distortion applied to shape edges |
| `grainOverlay` | `number` | no | `0` | editor range: 0…1 | Post-processing black/white grain overlay |
