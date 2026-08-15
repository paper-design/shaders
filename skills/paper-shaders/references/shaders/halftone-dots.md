# Halftone Dots

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

A halftone-dot image filter featuring customizable grids, color palettes, and dot styles.

- React: `HalftoneDots` and `halftoneDotsPresets` from `@paper-design/shaders-react`.
- Vanilla: `halftoneDotsFragmentShader` and `HalftoneDotsParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0, frame=0, fit="cover", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/halftone-dots.ts`, `packages/shaders-react/src/shaders/halftone-dots.tsx`, `docs/src/shader-defs/halftone-dots-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `image` | `HTMLImageElement \| string` | no | `""` | — | Source image texture |
| `colorFront` | `string` | no | `"#2b2b2b"` | — | Foreground color in RGBA |
| `colorBack` | `string` | no | `"#f2f1e8"` | — | Background color in RGBA |
| `size` | `number` | no | `0.5` | editor range: 0…1 | Grid size relative to the image box |
| `grid` | `HalftoneDotsGrid` | no | `"hex"` | options: "square", "hex" | Grid type (0 = square, 1 = hex) |
| `radius` | `number` | no | `1.25` | editor range: 0…2 | Maximum dot size relative to grid cell |
| `contrast` | `number` | no | `0.4` | editor range: 0…1 | Contrast applied to the sampled image |
| `originalColors` | `boolean` | no | `false` | — | Use sampled image's original colors instead of colorFront |
| `inverted` | `boolean` | no | `false` | — | Inverts the image luminance, doesn't affect the color scheme; not effective at zero contrast |
| `grainMixer` | `number` | no | `0.2` | editor range: 0…1 | Strength of grain distortion applied to shape edges |
| `grainOverlay` | `number` | no | `0.2` | editor range: 0…1 | Post-processing black/white grain overlay |
| `grainSize` | `number` | no | `0.5` | editor range: 0…1 | Scale applied to both grain distortion and grain overlay |
| `type` | `HalftoneDotsType` | no | `"gooey"` | options: "classic", "gooey", "holes", "soft" | Dot style (0 = classic, 1 = gooey, 2 = holes, 3 = soft) |
