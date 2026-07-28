# Image Dithering

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

A dithering image filter with support for 4 dithering modes and multiple color palettes (2-color, 3-color, and multicolor options, using either predefined colors or colors sampled from the original image).

- React: `ImageDithering` and `imageDitheringPresets` from `@paper-design/shaders-react`.
- Vanilla: `imageDitheringFragmentShader` and `ImageDitheringParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0, frame=0, fit="cover", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/image-dithering.ts`, `packages/shaders-react/src/shaders/image-dithering.tsx`, `docs/src/shader-defs/image-dithering-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `image` | `HTMLImageElement \| string` | yes | `""` | — | The image to use for the effect |
| `colorFront` | `string` | no | `"#94ffaf"` | — | Foreground color |
| `colorBack` | `string` | no | `"#000c38"` | — | Background color |
| `colorHighlight` | `string` | no | `"#eaff94"` | — | The secondary foreground color (set it same as colorFront to get a classic 2-color dithering) |
| `type` | `DitheringType` | no | `"8x8"` | options: "random", "2x2", "4x4", "8x8" | Dithering type |
| `size` | `number` | no | `2` | editor range: 0.5…20 | Pixel size of dithering grid; linked to the screen space, not to the image box |
| `colorSteps` | `number` | no | `2` | editor range: 1…7; step: 1 | Number of colors to use (applies to both color modes) |
| `originalColors` | `boolean` | no | `false` | options: "true", "false" | Use the original colors of the image |
| `inverted` | `boolean` | no | `false` | — | Inverts image luminance without changing the color scheme. |
| `pxSize` | `number` | no | — | — | React-only. @deprecated use `size` instead |
