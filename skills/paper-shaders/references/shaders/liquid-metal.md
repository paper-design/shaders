# Liquid Metal

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Futuristic liquid metal material applied to uploaded logo or abstract shape. Fluid motion imitation applied over user image with animated stripe pattern getting distorted along shape edges.

- React: `LiquidMetal` and `liquidMetalPresets` from `@paper-design/shaders-react`.
- Vanilla: `liquidMetalFragmentShader` and `LiquidMetalParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="contain", scale=0.6, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: preprocess image input with `toProcessedLiquidMetal`; pass `["u_image"]` as the `ShaderMount` mipmaps argument.
- Source: `packages/shaders/src/shaders/liquid-metal.ts`, `packages/shaders-react/src/shaders/liquid-metal.tsx`, `docs/src/shader-defs/liquid-metal-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#AAAAAC"` | — | Background color in RGBA |
| `colorTint` | `string` | no | `"#ffffff"` | — | Overlay color in RGBA (color burn blending used) |
| `image` | `HTMLImageElement \| string \| undefined` | no | `""` | — | Pre-processed source image texture (R = edge gradient, G = opacity) |
| `repetition` | `number` | no | `2` | editor range: 1…10 | Density of pattern stripes |
| `shiftRed` | `number` | no | `0.3` | editor range: -1…1 | R-channel dispersion |
| `shiftBlue` | `number` | no | `0.3` | editor range: -1…1 | B-channel dispersion |
| `contour` | `number` | no | `0.4` | editor range: 0…1 | Strength of the distortion on the shape edges |
| `softness` | `number` | no | `0.1` | editor range: 0…1 | Color transition sharpness, 0 = hard edge, 1 = smooth gradient |
| `distortion` | `number` | no | `0.07` | editor range: 0…1 | Noise distortion over the stripes pattern |
| `angle` | `number` | no | `70` | editor range: 0…360 | Direction of pattern animation in degrees |
| `shape` | `LiquidMetalShape` | no | `"diamond"` | options: "none", "circle", "daisy", "diamond", "metaballs" | Predefined shape when no image provided (0 = none, 1 = circle, 2 = daisy, 3 = diamond, 4 = metaballs) |
| `suspendWhenProcessingImage` | `boolean` | no | `false` | — | React-only. Suspends the component when the image is being processed. |
