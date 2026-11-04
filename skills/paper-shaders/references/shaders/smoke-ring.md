# Smoke Ring

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Radial multi-colored gradient shaped with layered noise for a natural, smoky aesthetic.

- React: `SmokeRing` and `smokeRingPresets` from `@paper-design/shaders-react`.
- Vanilla: `smokeRingFragmentShader` and `SmokeRingParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0.5, frame=0, fit="contain", scale=0.8, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: create `u_noiseTexture` with `getShaderNoiseTexture()` and wait for the image to load before constructing `ShaderMount`.
- Source: `packages/shaders/src/shaders/smoke-ring.ts`, `packages/shaders-react/src/shaders/smoke-ring.tsx`, `docs/src/shader-defs/smoke-ring-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#000000"` | — | Background color in RGBA |
| `colors` | `string[]` | no | `["#ffffff"]` | implementation capacity: 10 | Up to 10 gradient colors in RGBA |
| `noiseScale` | `number` | no | `3` | editor range: 0.01…5 | Noise frequency |
| `thickness` | `number` | no | `0.65` | editor range: 0.01…1 | Thickness of the ring shape |
| `radius` | `number` | no | `0.25` | editor range: 0…1 | Radius of the ring shape |
| `innerShape` | `number` | no | `0.7` | editor range: 0…4 | Ring inner fill amount |
| `noiseIterations` | `number` | no | `8` | editor range: 1…8; step: 1 | Number of noise layers, more layers gives more details |
