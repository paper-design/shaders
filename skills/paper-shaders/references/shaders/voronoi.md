# Voronoi

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Anti-aliased animated Voronoi pattern with smooth and customizable edges.

- React: `Voronoi` and `voronoiPresets` from `@paper-design/shaders-react`.
- Vanilla: `voronoiFragmentShader` and `VoronoiParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0.5, frame=0, fit="none", scale=0.5, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: create `u_noiseTexture` with `getShaderNoiseTexture()` and wait for the image to load before constructing `ShaderMount`.
- Source: `packages/shaders/src/shaders/voronoi.ts`, `packages/shaders-react/src/shaders/voronoi.tsx`, `docs/src/shader-defs/voronoi-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colors` | `string[]` | no | `["#ff8247","#ffe53d"]` | — | Colors used by the shader; implementation capacity is 5. |
| `stepsPerColor` | `number` | no | `3` | editor range: 1…3; step: 1 | Number of extra colors between base colors (1 = N color palette, 2 = 2×N color palette, 3 = 3×N color palette, etc) |
| `colorGap` | `string` | no | `"#2e0000"` | — | Color used for cell borders/gaps |
| `colorGlow` | `string` | no | `"#ffffff"` | — | Color tint for the radial inner shadow effect inside cells (effective with glow > 0) |
| `distortion` | `number` | no | `0.4` | editor range: 0…0.5 | Strength of noise-driven displacement of cell centers |
| `gap` | `number` | no | `0.04` | editor range: 0…0.1 | Width of the border/gap between cells |
| `glow` | `number` | no | `0` | editor range: 0…1 | Strength of the radial inner shadow inside cells |
