# Gem Smoke

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Animated color fields placed over uploaded logo shape; gives the illusion of smoky noise behind the glassy shape.

- React: `GemSmoke` and `gemSmokePresets` from `@paper-design/shaders-react`.
- Vanilla: `gemSmokeFragmentShader` and `GemSmokeParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="contain", scale=0.6, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: preprocess image input with `toProcessedGemSmoke`; pass `["u_image"]` as the `ShaderMount` mipmaps argument.
- Source: `packages/shaders/src/shaders/gem-smoke.ts`, `packages/shaders-react/src/shaders/gem-smoke.tsx`, `docs/src/shader-defs/gem-smoke-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colors` | `string[]` | no | `["#333333","#e7e6df"]` | implementation capacity: 6 | Up to 6 smoke colors in RGBA |
| `colorBack` | `string` | no | `"#f0efea"` | — | Background color in RGBA |
| `image` | `HTMLImageElement \| string \| undefined` | no | `""` | — | Pre-processed source image texture (R = edge gradient, G = alpha) |
| `innerDistortion` | `number` | no | `0.8` | editor range: 0…1 | Power of smoke distortion inside the input shape |
| `outerDistortion` | `number` | no | `0.6` | editor range: 0…1 | Power of smoke distortion outside the input shape |
| `outerGlow` | `number` | no | `0.55` | editor range: 0…1 | Visibility of smoke shape outside the input shape |
| `innerGlow` | `number` | no | `1` | editor range: 0…1 | Visibility of smoke shape inside the input shape |
| `colorInner` | `string` | no | `"#fafaf5"` | — | Additional color inside the input shape, mixing with smoke (RGBA) |
| `offset` | `number` | no | `0` | editor range: -1…1 | Vertical offset of smoke inside the shape |
| `angle` | `number` | no | `0` | editor range: 0…360 | Smoke direction in degrees |
| `size` | `number` | no | `0.8` | editor range: 0…1 | Size of smoke shape relative to the image box |
| `shape` | `GemSmokeShape` | no | `"diamond"` | options: "none", "circle", "daisy", "diamond", "metaballs" | The predefined shape used as an effect mask when no image is provided. |
| `suspendWhenProcessingImage` | `boolean` | no | `false` | — | React-only. Suspends the component when the image is being processed. |
