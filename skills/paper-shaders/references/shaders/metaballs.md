# Metaballs

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Up to 20 colored gooey balls moving around the center and merging into smooth organic shapes.

- React: `Metaballs` and `metaballsPresets` from `@paper-design/shaders-react`.
- Vanilla: `metaballsFragmentShader` and `MetaballsParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="contain", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: create `u_noiseTexture` with `getShaderNoiseTexture()` and wait for the image to load before constructing `ShaderMount`.
- Source: `packages/shaders/src/shaders/metaballs.ts`, `packages/shaders-react/src/shaders/metaballs.tsx`, `docs/src/shader-defs/metaballs-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#000000"` | — | Background color in RGBA |
| `colors` | `string[]` | no | `["#6e33cc","#ff5500","#ffc105","#ffc800","#f585ff"]` | — | Up to 8 base colors in RGBA |
| `count` | `number` | no | `10` | editor range: 1…20 | Number of balls |
| `size` | `number` | no | `0.83` | editor range: 0…1 | Size of the balls |
