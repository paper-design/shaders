# Simplex Noise

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

A multi-color gradient mapped into smooth, animated curves built as a combination of 2 Simplex noises.

- React: `SimplexNoise` and `simplexNoisePresets` from `@paper-design/shaders-react`.
- Vanilla: `simplexNoiseFragmentShader` and `SimplexNoiseParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0.5, frame=0, fit="none", scale=0.6, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/simplex-noise.ts`, `packages/shaders-react/src/shaders/simplex-noise.tsx`, `docs/src/shader-defs/simplex-noise-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colors` | `string[]` | no | `["#4449CF","#FFD1E0","#F94446","#FFD36B","#FFFFFF"]` | — | Colors used by the shader; implementation capacity is 10. |
| `stepsPerColor` | `number` | no | `2` | editor range: 1…10; step: 1 | Number of extra colors between base colors (1 = N color palette, 2 = 2×N color palette, 3 = 3×N color palette, etc) |
| `softness` | `number` | no | `0` | editor range: 0…1 | Color transition sharpness (0 = hard edge, 1 = smooth gradient) |
