# Warp

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Animated color fields warped by noise and swirls, applied over base patterns (checks, stripes, or split edge). Blends up to 10 colors with adjustable distribution, softness, distortion, and swirl. Great for fluid, smoky, or marbled effects.

- React: `Warp` and `warpPresets` from `@paper-design/shaders-react`.
- Vanilla: `warpFragmentShader` and `WarpParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="none", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: create `u_noiseTexture` with `getShaderNoiseTexture()` and wait for the image to load before constructing `ShaderMount`.
- Source: `packages/shaders/src/shaders/warp.ts`, `packages/shaders-react/src/shaders/warp.tsx`, `docs/src/shader-defs/warp-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colors` | `string[]` | no | `["#121212","#9470ff","#121212","#8838ff"]` | — | Up to 10 gradient colors in RGBA |
| `rotation` | `number` | no | `0` | editor range: 0…360 | Overall rotation angle of the graphics in degrees |
| `proportion` | `number` | no | `0.45` | editor range: 0…1 | Blend point between colors, 0.5 = equal distribution |
| `softness` | `number` | no | `1` | editor range: 0…1 | Color transition sharpness, 0 = hard edge, 1 = smooth gradient |
| `shape` | `WarpPattern` | no | `"checks"` | options: "checks", "stripes", "edge" | Base pattern type (0 = checks, 1 = stripes, 2 = edge) |
| `shapeScale` | `number` | no | `0.1` | editor range: 0…1 | Zoom level of the base pattern |
| `distortion` | `number` | no | `0.25` | editor range: 0…1 | Strength of noise-based distortion |
| `swirl` | `number` | no | `0.8` | editor range: 0…1 | Strength of the swirl distortion |
| `swirlIterations` | `number` | no | `10` | editor range: 0…20 | Number of layered swirl passes, effective with swirl > 0 |
