# Halftone CMYK

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

CMYK halftone printing effect applied to images with customizable dot patterns and ink colors for each channel (Cyan, Magenta, Yellow, Black).

- React: `HalftoneCmyk` and `halftoneCmykPresets` from `@paper-design/shaders-react`.
- Vanilla: `halftoneCmykFragmentShader` and `HalftoneCmykParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0, frame=0, fit="cover", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: create `u_noiseTexture` with `getShaderNoiseTexture()` and wait for the image to load before constructing `ShaderMount`.
- Source: `packages/shaders/src/shaders/halftone-cmyk.ts`, `packages/shaders-react/src/shaders/halftone-cmyk.tsx`, `docs/src/shader-defs/halftone-cmyk-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `image` | `HTMLImageElement \| string` | no | `""` | — | The image to use for the effect |
| `colorBack` | `string` | no | `"#fbfaf5"` | — | Background (paper) color |
| `colorC` | `string` | no | `"#00b4ff"` | — | Cyan ink color (alpha controls layer transparency, not dot size) |
| `colorM` | `string` | no | `"#fc519f"` | — | Magenta ink color (alpha controls layer transparency, not dot size) |
| `colorY` | `string` | no | `"#ffd800"` | — | Yellow ink color (alpha controls layer transparency, not dot size) |
| `colorK` | `string` | no | `"#231f20"` | — | Black ink color (alpha controls layer transparency, not dot size) |
| `size` | `number` | no | `0.2` | editor range: 0…1 | Grid size (relative to image box) |
| `contrast` | `number` | no | `1` | editor range: 0…2 | Input image contrast |
| `softness` | `number` | no | `1` | editor range: 0…1 | Dots edge softness |
| `grainSize` | `number` | no | `0.5` | editor range: 0…1 | Size of grain overlay texture (relative to image box) |
| `grainMixer` | `number` | no | `0` | editor range: 0…1 | Strength of grain affecting dot size |
| `grainOverlay` | `number` | no | `0` | editor range: 0…1 | Strength of the black-and-white grain overlay on the final output |
| `gridNoise` | `number` | no | `0.2` | editor range: 0…1 | Displaces both dot positions and color sampling points; naturally makes the background more visible |
| `floodC` | `number` | no | `0.15` | editor range: 0…1; shader source documents -1…1 | Flat cyan dot-size adjustment applied uniformly |
| `floodM` | `number` | no | `0` | editor range: 0…1; shader source documents -1…1 | Flat magenta dot-size adjustment applied uniformly |
| `floodY` | `number` | no | `0` | editor range: 0…1; shader source documents -1…1 | Flat yellow dot-size adjustment applied uniformly |
| `floodK` | `number` | no | `0` | editor range: 0…1; shader source documents -1…1 | Flat black dot-size adjustment applied uniformly |
| `gainC` | `number` | no | `0.3` | editor range: -1…1 | Proportional cyan dot-size gain that enhances existing dots |
| `gainM` | `number` | no | `0` | editor range: -1…1 | Proportional magenta dot-size gain that enhances existing dots |
| `gainY` | `number` | no | `0.2` | editor range: -1…1 | Proportional yellow dot-size gain that enhances existing dots |
| `gainK` | `number` | no | `0` | editor range: -1…1 | Proportional black dot-size gain that enhances existing dots |
| `type` | `HalftoneCmykType` | no | `"ink"` | options: "dots", "ink", "sharp" | Dot type style (the difference between dots and ink is visible only with low softness) |
