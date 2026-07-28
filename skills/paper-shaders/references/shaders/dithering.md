# Dithering

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Animated 2-color dithering over multiple pattern sources (noise, warp, dots, waves, ripple, swirl, sphere).

- React: `Dithering` and `ditheringPresets` from `@paper-design/shaders-react`.
- Vanilla: `ditheringFragmentShader` and `DitheringParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="none", scale=0.6, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/dithering.ts`, `packages/shaders-react/src/shaders/dithering.tsx`, `docs/src/shader-defs/dithering-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#000000"` | — | Background color |
| `colorFront` | `string` | no | `"#00b2ff"` | — | The foreground (ink) color |
| `shape` | `DitheringShape` | no | `"sphere"` | options: "simplex", "warp", "dots", "wave", "ripple", "swirl", "sphere" | Shape pattern type |
| `type` | `DitheringType` | no | `"4x4"` | options: "random", "2x2", "4x4", "8x8" | Dithering type |
| `size` | `number` | no | `2` | editor range: 1…20; shader source documents 0.5…20 | Pixel size of dithering grid |
| `pxSize` | `number` | no | — | — | React-only. @deprecated use `size` instead |
