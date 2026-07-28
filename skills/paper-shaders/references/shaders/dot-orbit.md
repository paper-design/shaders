# Dot Orbit

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Animated multi-color dots pattern with each dot orbiting around its cell center. Supports up to 10 colors and various shape and motion controls.

- React: `DotOrbit` and `dotOrbitPresets` from `@paper-design/shaders-react`.
- Vanilla: `dotOrbitFragmentShader` and `DotOrbitParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1.5, frame=0, fit="none", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: create `u_noiseTexture` with `getShaderNoiseTexture()` and wait for the image to load before constructing `ShaderMount`.
- Source: `packages/shaders/src/shaders/dot-orbit.ts`, `packages/shaders-react/src/shaders/dot-orbit.tsx`, `docs/src/shader-defs/dot-orbit-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#000000"` | — | Background color |
| `colors` | `string[]` | no | `["#ffc96b","#ff6200","#ff2f00","#421100","#1a0000"]` | — | Colors used by the shader; implementation capacity is 10. |
| `size` | `number` | no | `1` | editor range: 0…1 | Dot radius relative to cell size |
| `sizeRange` | `number` | no | `0` | editor range: 0…1 | Random variation in shape size (0 = uniform size, higher = random value up to base size) |
| `spreading` | `number` | no | `1` | editor range: 0…1 | Maximum orbit distance |
| `stepsPerColor` | `number` | no | `4` | editor range: 1…4; step: 1 | Number of extra colors between base colors (1 = N color palette, 2 = 2×N color palette, 3 = 3×N color palette, etc) |
