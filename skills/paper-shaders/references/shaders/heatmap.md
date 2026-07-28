# Heatmap

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

A glowing gradient of colors flowing through an input shape. The effect creates a smoothly animated wave of intensity across the image.

- React: `Heatmap` and `heatmapPresets` from `@paper-design/shaders-react`.
- Vanilla: `heatmapFragmentShader` and `HeatmapParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="contain", scale=0.75, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: preprocess image input with `toProcessedHeatmap`; pass `["u_image"]` as the `ShaderMount` mipmaps argument.
- Source: `packages/shaders/src/shaders/heatmap.ts`, `packages/shaders-react/src/shaders/heatmap.tsx`, `docs/src/shader-defs/heatmap-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `image` | `HTMLImageElement \| string` | yes | `""` | — | The image to use for the effect |
| `contour` | `number` | no | `0.5` | editor range: 0…1 | The heat intensity near the edges of the input shape |
| `angle` | `number` | no | `0` | editor range: 0…360 | The direction of the heatwaves (angle relative to the shape) |
| `noise` | `number` | no | `0` | editor range: 0…1 | Grain applied across the entire graphic |
| `innerGlow` | `number` | no | `0.5` | editor range: 0…1 | The size of the heated area inside the input shape |
| `outerGlow` | `number` | no | `0.5` | editor range: 0…1 | Size of the heated area outside the input shape |
| `colorBack` | `string` | no | `"#000000"` | — | Background color |
| `colors` | `string[]` | no | `["#11206a","#1f3ba2","#2f63e7","#6bd7ff","#ffe679","#ff991e","#ff4c00"]` | — | Colors used by the shader; implementation capacity is 10. |
| `suspendWhenProcessingImage` | `boolean` | no | `false` | — | React-only. Suspends the component when the image is being processed. |
