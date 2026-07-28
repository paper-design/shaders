# Dot Grid

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Static grid pattern made of circles, diamonds, squares or triangles.

- React: `DotGrid` and `dotGridPresets` from `@paper-design/shaders-react`.
- Vanilla: `dotGridFragmentShader` and `DotGridParams` from `@paper-design/shaders`.
- Common controls: sizing. Defaults: fit="none", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- React performance override: `maxPixelCount` defaults to `6016 * 3384`.
- Source: `packages/shaders/src/shaders/dot-grid.ts`, `packages/shaders-react/src/shaders/dot-grid.tsx`, `docs/src/shader-defs/dot-grid-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#000000"` | — | Background color |
| `colorFill` | `string` | no | `"#ffffff"` | — | Shape fill color |
| `colorStroke` | `string` | no | `"#ffaa00"` | — | Shape stroke color |
| `size` | `number` | no | `2` | editor range: 1…100 | Base size of each shape, pixels |
| `gapX` | `number` | no | `32` | editor range: 2…500 | Pattern horizontal spacing, pixels |
| `gapY` | `number` | no | `32` | editor range: 2…500 | Pattern vertical spacing, pixels |
| `strokeWidth` | `number` | no | `0` | editor range: 0…50 | The outline stroke width, pixels |
| `sizeRange` | `number` | no | `0` | editor range: 0…1 | Random variation in shape size (0 = uniform size, higher = random value up to base size) |
| `opacityRange` | `number` | no | `0` | editor range: 0…1 | Random variation in shape opacity (0 = all shapes opaque, higher = semi-transparent dots) |
| `shape` | `DotGridShape` | no | `"circle"` | options: "circle", "diamond", "square", "triangle" | The shape type |
