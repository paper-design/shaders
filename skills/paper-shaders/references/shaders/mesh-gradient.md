# Mesh Gradient

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

A flowing composition of color spots, moving along distinct trajectories and transformed by organic distortion.

- React: `MeshGradient` and `meshGradientPresets` from `@paper-design/shaders-react`.
- Vanilla: `meshGradientFragmentShader` and `MeshGradientParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="contain", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/mesh-gradient.ts`, `packages/shaders-react/src/shaders/mesh-gradient.tsx`, `docs/src/shader-defs/mesh-gradient-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colors` | `string[]` | no | `["#e0eaff","#241d9a","#f75092","#9f50d3"]` | implementation capacity: 10 | Up to 10 color spots in RGBA |
| `distortion` | `number` | no | `0.8` | editor range: 0…1 | Power of organic noise distortion |
| `swirl` | `number` | no | `0.1` | editor range: 0…1 | Power of vortex distortion |
| `grainMixer` | `number` | no | `0` | editor range: 0…1 | Strength of grain distortion applied to shape edges |
| `grainOverlay` | `number` | no | `0` | editor range: 0…1 | Post-processing black/white grain overlay |
