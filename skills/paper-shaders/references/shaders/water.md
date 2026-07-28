# Water

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Water-like surface distortion with natural caustic realism. Works as an image filter or standalone animated texture.

- React: `Water` and `waterPresets` from `@paper-design/shaders-react`.
- Vanilla: `waterFragmentShader` and `WaterParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="contain", scale=0.8, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: pass `["u_image"]` as the `ShaderMount` mipmaps argument.
- Source: `packages/shaders/src/shaders/water.ts`, `packages/shaders-react/src/shaders/water.tsx`, `docs/src/shader-defs/water-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `image` | `HTMLImageElement \| string` | no | `""` | — | The image to use for the effect |
| `colorBack` | `string` | no | `"#909090"` | — | Background color |
| `colorHighlight` | `string` | no | `"#ffffff"` | — | Highlight color |
| `highlights` | `number` | no | `0.07` | editor range: 0…1 | A coloring added over the image/background, following the caustic shape |
| `layering` | `number` | no | `0.5` | editor range: 0…1 | The power of 2nd layer of caustic distortion |
| `edges` | `number` | no | `0.8` | editor range: 0…1 | Caustic distortion power on the image edges |
| `caustic` | `number` | no | `0.1` | editor range: 0…1 | Power of caustic distortion |
| `waves` | `number` | no | `0.3` | editor range: 0…1 | Additional distortion based on simplex noise, independent from caustic |
| `size` | `number` | no | `1` | editor range: 0.01…7 | Pattern scale relative to the image |
| `effectScale` | `number` | no | — | — | React-only. @deprecated use `size` instead |
