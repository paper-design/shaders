# Paper Texture

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

A static texture built from multiple noise layers, usable for realistic paper and cardboard surfaces. Can be used as an image filter or as a standalone texture.

- React: `PaperTexture` and `paperTexturePresets` from `@paper-design/shaders-react`.
- Vanilla: `paperTextureFragmentShader` and `PaperTextureParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0, frame=0, fit="cover", scale=0.6, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: create `u_noiseTexture` with `getShaderNoiseTexture()` and wait for the image to load before constructing `ShaderMount`; pass `["u_image"]` as the `ShaderMount` mipmaps argument.
- Source: `packages/shaders/src/shaders/paper-texture.ts`, `packages/shaders-react/src/shaders/paper-texture.tsx`, `docs/src/shader-defs/paper-texture-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `image` | `HTMLImageElement \| string` | no | `""` | — | The image to use for the effect |
| `colorFront` | `string` | no | `"#9fadbc"` | — | Foreground color |
| `colorBack` | `string` | no | `"#ffffff"` | — | Background color |
| `contrast` | `number` | no | `0.3` | editor range: 0…1 | Blending behavior (sharper vs. smoother color transitions) |
| `roughness` | `number` | no | `0.4` | editor range: 0…1 | Pixel noise, related to canvas (not scalable) |
| `fiber` | `number` | no | `0.3` | editor range: 0…1 | Curly-shaped noise |
| `fiberSize` | `number` | no | `0.2` | editor range: 0…1 | Curly-shaped noise scale |
| `crumples` | `number` | no | `0.3` | editor range: 0…1 | Cell-based crumple pattern |
| `foldCount` | `number` | no | `5` | editor range: 1…15; step: 1 | Number of folds (15 max) |
| `folds` | `number` | no | `0.65` | editor range: 0…1 | Depth of the folds |
| `fade` | `number` | no | `0` | editor range: 0…1 | Big-scale noise mask applied to the pattern |
| `crumpleSize` | `number` | no | `0.35` | editor range: 0…1 | Cell-based crumple pattern scale |
| `drops` | `number` | no | `0.2` | editor range: 0…1 | The visibility of speckle pattern |
| `seed` | `number` | no | `5.8` | editor range: 0…1000 | Seed applied to folds, crumples and dots |
| `fiberScale` | `number` | no | — | — | React-only. @deprecated use `fiberSize` instead |
| `crumplesScale` | `number` | no | — | — | React-only. @deprecated use `crumpleSize` instead |
| `foldsNumber` | `number` | no | — | — | React-only. @deprecated use `foldCount` instead |
| `blur` | `number` | no | — | — | React-only. @deprecated use `fade` instead |
