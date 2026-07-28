# Grain Gradient

Use the listed implementation types, options, capacities, exports, and defaults. Values labeled “editor range” come from the documentation UI definitions; the component does not clamp props to that range.

Multi-color gradients with grainy, noise-textured distortion available in 7 animated abstract forms.

- React: `GrainGradient` and `grainGradientPresets` from `@paper-design/shaders-react`.
- Vanilla: `grainGradientFragmentShader` and `GrainGradientParams` from `@paper-design/shaders`.
- Common controls: sizing and motion. Defaults: speed=1, frame=0, fit="contain", scale=1, rotation=0, offsetX=0, offsetY=0, originX=0.5, originY=0.5, worldWidth=0, worldHeight=0.
- Vanilla requirements: create `u_noiseTexture` with `getShaderNoiseTexture()` and wait for the image to load before constructing `ShaderMount`.
- Source: `packages/shaders/src/shaders/grain-gradient.ts`, `packages/shaders-react/src/shaders/grain-gradient.tsx`, `docs/src/shader-defs/grain-gradient-def.ts`.

| Prop | Type | Required | React default | Constraints | Effect |
| --- | --- | --- | --- | --- | --- |
| `colorBack` | `string` | no | `"#000000"` | — | Background color |
| `colors` | `string[]` | no | `["#7300ff","#eba8ff","#00bfff","#2a00ff"]` | — | Colors used by the shader; implementation capacity is 7. |
| `softness` | `number` | no | `0.5` | editor range: 0…1 | Color transition sharpness (0 = hard edge, 1 = smooth gradient) |
| `intensity` | `number` | no | `0.5` | editor range: 0…1 | Distortion between color bands |
| `noise` | `number` | no | `0.25` | editor range: 0…1 | Grainy noise overlay |
| `shape` | `GrainGradientShape` | no | `"corners"` | options: "wave", "dots", "truchet", "corners", "ripple", "blob", "sphere" | Shape type |
