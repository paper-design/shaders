# Pulsing Border

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Luminous trails of color merging into a glowing gradient contour.

- React: `PulsingBorder` and `pulsingBorderPresets` from `@paper-design/shaders-react`.
- Vanilla: `pulsingBorderFragmentShader` and `PulsingBorderParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="contain", scale=0.6, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: create `u_noiseTexture` with `getShaderNoiseTexture()` and wait for the image to load before constructing `ShaderMount`.
- Source: `packages/shaders/src/shaders/pulsing-border.ts`, `packages/shaders-react/src/shaders/pulsing-border.tsx`, `docs/src/shader-defs/pulsing-border-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#000000"` | — | Background color in RGBA |
| `colors` | `string[]` | no | `["#0dc1fd","#d915ef","#ff3f2ecc"]` | implementation capacity: 5 | Up to 5 spot colors in RGBA |
| `roundness` | `number` | no | `0.25` | editor range: 0…1 | Border radius |
| `thickness` | `number` | no | `0.1` | editor range: 0…1 | Border base width |
| `margin` | `number` | no | `0` | editor range: 0…1 | Distance from canvas edges to the effect |
| `marginLeft` | `number` | no | `0` | editor range: 0…1 | Distance from the left edge to the effect |
| `marginRight` | `number` | no | `0` | editor range: 0…1 | Distance from the right edge to the effect |
| `marginTop` | `number` | no | `0` | editor range: 0…1 | Distance from the top edge to the effect |
| `marginBottom` | `number` | no | `0` | editor range: 0…1 | Distance from the bottom edge to the effect |
| `aspectRatio` | `PulsingBorderAspectRatio` | no | `"auto"` | options: "auto", "square" | Aspect ratio mode (0 = auto, 1 = square) |
| `softness` | `number` | no | `0.75` | editor range: 0…1 | Border edge sharpness, 0 = hard edge, 1 = smooth gradient |
| `intensity` | `number` | no | `0.2` | editor range: 0…1 | Thickness of individual color spots |
| `bloom` | `number` | no | `0.25` | editor range: 0…1 | Power of glow, 0 = normal blending, 1 = additive blending |
| `spots` | `number` | no | `5` | editor range: 1…20; step: 1; implementation capacity: 4 | Number of spots added for each color |
| `spotSize` | `number` | no | `0.5` | editor range: 0…1 | Angular size of spots |
| `pulse` | `number` | no | `0.25` | editor range: 0…1 | Optional pulsing animation intensity |
| `smoke` | `number` | no | `0.3` | editor range: 0…1 | Optional noisy shape extending the border |
| `smokeSize` | `number` | no | `0.6` | editor range: 0…1 | Size of the smoke effect |
