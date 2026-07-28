# Fluted Glass

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Fluted glass image filter that transforms an image into streaked, ribbed distortions, giving a mix of clarity and obscurity.

- React: `FlutedGlass` and `flutedGlassPresets` from `@paper-design/shaders-react`.
- Vanilla: `flutedGlassFragmentShader` and `FlutedGlassParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0, frame=0, fit="cover", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: pass `["u_image"]` as the `ShaderMount` mipmaps argument.
- Enum source note: the documentation UI definition contains stale `facete`; the exported `GlassDistortionShapes` mapping and component type use `flat`.
- Source: `packages/shaders/src/shaders/fluted-glass.ts`, `packages/shaders-react/src/shaders/fluted-glass.tsx`, `docs/src/shader-defs/fluted-glass-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `image` | `HTMLImageElement \| string` | no | `""` | — | The image to use for the effect |
| `colorBack` | `string` | no | `"#00000000"` | — | Background color |
| `colorShadow` | `string` | no | `"#000000"` | — | Shadows color |
| `colorHighlight` | `string` | no | `"#ffffff"` | — | Highlights color |
| `shadows` | `number` | no | `0.25` | editor range: 0…1 | A color gradient added over both image and background, following the distortion shape |
| `size` | `number` | no | `0.5` | editor range: 0…1; step: 0.001 | The size of the distortion shape grid |
| `angle` | `number` | no | `0` | editor range: 0…180 | Direction of the grid relative to the image |
| `distortion` | `number` | no | `0.5` | editor range: 0…1 | The power of distortion applied within each stripe |
| `shift` | `number` | no | `0` | editor range: -1…1 | Texture shift in direction opposite to the grid |
| `blur` | `number` | no | `0` | editor range: 0…1 | One-directional blur over the image and extra blur around the edges |
| `edges` | `number` | no | `0.25` | editor range: 0…1 | Glass distortion and softness on the image edges |
| `margin` | `number` | no | `0` | editor range: 0…1 | Distance from image edges to the effect |
| `marginLeft` | `number` | no | `0` | editor range: 0…1 | Distance from the left edge to the effect |
| `marginRight` | `number` | no | `0` | editor range: 0…1 | Distance from the right edge to the effect |
| `marginTop` | `number` | no | `0` | editor range: 0…1 | Distance from the top edge to the effect |
| `marginBottom` | `number` | no | `0` | editor range: 0…1 | Distance from the bottom edge to the effect |
| `stretch` | `number` | no | `0` | editor range: 0…1 | Extra distortion along the grid lines |
| `distortionShape` | `GlassDistortionShape` | no | `"prism"` | options: "prism", "lens", "contour", "cascade", "flat" | The shape of the distortion |
| `highlights` | `number` | no | `0.1` | editor range: 0…1 | Thin strokes along the distortion shape; useful for antialiasing on a small grid |
| `shape` | `GlassGridShape` | no | `"lines"` | options: "lines", "linesIrregular", "wave", "zigzag", "pattern" | The shape of the grid |
| `grainMixer` | `number` | no | `0` | editor range: 0…1 | Strength of grain distortion applied to the shapes’ edges |
| `grainOverlay` | `number` | no | `0` | editor range: 0…1 | Post-processing b/w grain overlay |
| `count` | `number` | no | — | — | React-only. @deprecated use `size` instead |
