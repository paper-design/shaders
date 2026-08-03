# God Rays

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Animated rays of light radiating from the center, blended with up to 5 colors.

- React: `GodRays` and `godRaysPresets` from `@paper-design/shaders-react`.
- Vanilla: `godRaysFragmentShader` and `GodRaysParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0.75, frame=0, fit="contain", scale=1, rotation=0, offsetX=0, offsetY=-0.55, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: create `u_noiseTexture` with `getShaderNoiseTexture()` and wait for the image to load before constructing `ShaderMount`.
- Source: `packages/shaders/src/shaders/god-rays.ts`, `packages/shaders-react/src/shaders/god-rays.tsx`, `docs/src/shader-defs/god-rays-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#000000"` | — | Background color in RGBA |
| `colorBloom` | `string` | no | `"#0000ff"` | — | Color overlay blended with the rays in RGBA |
| `colors` | `string[]` | no | `["#a600ff6e","#6200fff0","#ffffff","#33fff5"]` | implementation capacity: 5 | Up to 5 ray colors in RGBA |
| `spotty` | `number` | no | `0.3` | editor range: 0…1 | The length of the rays, higher = more spots/shorter rays |
| `midSize` | `number` | no | `0.2` | editor range: 0…1 | Size of the circular glow shape in the center |
| `midIntensity` | `number` | no | `0.4` | editor range: 0…1 | Brightness/intensity of the central glow |
| `density` | `number` | no | `0.3` | editor range: 0…1 | The number of rays |
| `intensity` | `number` | no | `0.8` | editor range: 0…1 | Visibility/strength of the rays |
| `bloom` | `number` | no | `0.4` | editor range: 0…1 | Strength of the bloom/overlay effect, 0 = alpha blend, 1 = additive blend |
