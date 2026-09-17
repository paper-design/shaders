# Neuro Noise

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

A glowing, web-like structure of fluid lines and soft intersections. Great for creating atmospheric, organic-yet-futuristic visuals.

- React: `NeuroNoise` and `neuroNoisePresets` from `@paper-design/shaders-react`.
- Vanilla: `neuroNoiseFragmentShader` and `NeuroNoiseParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="none", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/neuro-noise.ts`, `packages/shaders-react/src/shaders/neuro-noise.tsx`, `docs/src/shader-defs/neuro-noise-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorFront` | `string` | no | `"#ffffff"` | — | Graphics highlight color in RGBA |
| `colorMid` | `string` | no | `"#47a6ff"` | — | Graphics main color in RGBA |
| `colorBack` | `string` | no | `"#000000"` | — | Background color in RGBA |
| `brightness` | `number` | no | `0.05` | editor range: 0…1 | Luminosity of the crossing points |
| `contrast` | `number` | no | `0.3` | editor range: 0…1 | Sharpness of the bright-dark transition |
