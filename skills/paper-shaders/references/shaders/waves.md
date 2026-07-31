# Waves

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Static line pattern configurable into textures ranging from sharp zigzags to smooth flowing waves.

- React: `Waves` and `wavesPresets` from `@paper-design/shaders-react`.
- Vanilla: `wavesFragmentShader` and `WavesParams` from `@paper-design/shaders`.
- Common controls: sizing. Defaults: fit="none", scale=0.6, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- React performance override: `maxPixelCount` defaults to `6016 * 3384`.
- Source: `packages/shaders/src/shaders/waves.ts`, `packages/shaders-react/src/shaders/waves.tsx`, `docs/src/shader-defs/waves-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorFront` | `string` | no | `"#ffbb00"` | — | Foreground color in RGBA |
| `colorBack` | `string` | no | `"#000000"` | — | Background color in RGBA |
| `rotation` | `number` | no | `0` | editor range: 0…360 | Overall rotation angle of the graphics in degrees |
| `shape` | `number` | no | `0` | editor range: 0…3 | Line shape, 0 = zigzag, 1 = sine, 2-3 = irregular waves, fractional values morph between shapes |
| `frequency` | `number` | no | `0.5` | editor range: 0…2 | Wave frequency |
| `amplitude` | `number` | no | `0.5` | editor range: 0…1 | Wave amplitude |
| `spacing` | `number` | no | `1.2` | editor range: 0…2 | Space between every two wavy lines |
| `proportion` | `number` | no | `0.1` | editor range: 0…1 | Blend point between front and back colors, 0.5 = equal distribution |
| `softness` | `number` | no | `0` | editor range: 0…1 | Color transition sharpness, 0 = hard edge, 1 = smooth gradient |
