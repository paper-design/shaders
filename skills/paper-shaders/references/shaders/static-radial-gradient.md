# Static Radial Gradient

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Radial gradient with up to 10 blended colors, featuring advanced mixing modes, focal point controls, shape distortion, and grain effects.

- React: `StaticRadialGradient` and `staticRadialGradientPresets` from `@paper-design/shaders-react`.
- Vanilla: `staticRadialGradientFragmentShader` and `StaticRadialGradientParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0, frame=0, fit="contain", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/static-radial-gradient.ts`, `packages/shaders-react/src/shaders/static-radial-gradient.tsx`, `docs/src/shader-defs/static-radial-gradient-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#000000"` | — | Background color in RGBA |
| `colors` | `string[]` | no | `["#00bbff","#00ffe1","#ffffff"]` | — | Up to 10 gradient colors in RGBA |
| `radius` | `number` | no | `0.8` | editor range: 0…3 | Size of the shape |
| `focalDistance` | `number` | no | `0.99` | editor range: 0…3 | Distance of the focal point from center |
| `focalAngle` | `number` | no | `0` | editor range: 0…360 | Angle of the focal point in degrees, effective with focalDistance > 0 |
| `falloff` | `number` | no | `0.24` | editor range: -1…1 | Gradient decay, 0 = linear gradient |
| `mixing` | `number` | no | `0.5` | editor range: 0…1 | Blending behavior, 0 = hard stripes, 1 = smooth gradient |
| `distortion` | `number` | no | `0` | editor range: 0…1 | Strength of radial distortion |
| `distortionShift` | `number` | no | `0` | editor range: -1…1 | Radial distortion offset, effective with distortion > 0 |
| `distortionFreq` | `number` | no | `12` | editor range: 0…20; step: 1 | Radial distortion frequency, effective with distortion > 0 |
| `grainMixer` | `number` | no | `0` | editor range: 0…1 | Strength of grain distortion applied to shape edges |
| `grainOverlay` | `number` | no | `0` | editor range: 0…1 | Post-processing black/white grain overlay |
