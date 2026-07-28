# Color Panels

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Pseudo-3D semi-transparent panels rotating around a central axis.

- React: `ColorPanels` and `colorPanelsPresets` from `@paper-design/shaders-react`.
- Vanilla: `colorPanelsFragmentShader` and `ColorPanelsParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=0.5, frame=0, fit="contain", scale=0.8, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Source: `packages/shaders/src/shaders/color-panels.ts`, `packages/shaders-react/src/shaders/color-panels.tsx`, `docs/src/shader-defs/color-panels-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colors` | `string[]` | no | `["#ff9d00","#fd4f30","#809bff","#6d2eff","#333aff","#f15cff","#ffd557"]` | — | Colors used by the shader; implementation capacity is 7. |
| `colorBack` | `string` | no | `"#000000"` | — | Background color |
| `angle1` | `number` | no | `0` | editor range: -1…1 | Skew angle applied to all panes |
| `angle2` | `number` | no | `0` | editor range: -1…1 | Skew angle applied to all panes |
| `length` | `number` | no | `1.1` | editor range: 0…3 | Panel length (relative to total height) |
| `edges` | `boolean` | no | `false` | options: "true", "false" | Color highlight on the panels edges |
| `blur` | `number` | no | `0` | editor range: 0…0.5 | Side blur (0 for sharp edges) |
| `fadeIn` | `number` | no | `1` | editor range: 0…1 | Transparency near central axis |
| `fadeOut` | `number` | no | `0.3` | editor range: 0…1 | Transparency near viewer |
| `density` | `number` | no | `3` | editor range: 0.25…7 | Controls the angular spacing between panels |
| `gradient` | `number` | no | `0` | editor range: 0…1 | Color mixing within a panel (0 = solid panel color, 1 = gradient of two colors) |
