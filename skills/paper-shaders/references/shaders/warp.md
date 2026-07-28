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
| `colors` | `string[]` | no | `["#121212","#9470ff","#121212","#8838ff"]` | — | Colors used by the shader; implementation capacity is 10. |
| `rotation` | `number` | no | `0` | editor range: 0…360 | Overall rotation angle of the graphics. |
| `proportion` | `number` | no | `0.45` | editor range: 0…1 | Blend point between 2 colors (0.5 = equal distribution) |
| `softness` | `number` | no | `1` | editor range: 0…1 | Color transition sharpness (0 = hard edge, 1 = smooth gradient) |
| `shape` | `WarpPattern` | no | `"checks"` | options: "checks", "stripes", "edge" | Base pattern type |
| `shapeScale` | `number` | no | `0.1` | editor range: 0…1 | Zoom level of the base pattern |
| `distortion` | `number` | no | `0.25` | editor range: 0…1 | Strength of noise-based distortion |
| `swirl` | `number` | no | `0.8` | editor range: 0…1 | Strength of the swirl distortion |
| `swirlIterations` | `number` | no | `10` | editor range: 0…20; hard loop capacity: 20 | Exclusive integer loop bound for layered swirl passes. For an integer `N` in the editor range, the shader executes indices 1 through `N - 1`; the default 10 therefore runs 9 passes, and 20 runs 19. Values of 21 or more reach the hard 20-pass loop capacity. |
