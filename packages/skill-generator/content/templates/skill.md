---
name: paper-shaders
description: Implement, convert, customize, debug, or review Paper Shaders effects in React or vanilla JavaScript using `@paper-design/shaders-react` and `@paper-design/shaders`.
---

# Paper Shaders

Implement Paper Shaders from the package source contract. Do not infer prop names, defaults, enum values, uniform mappings, color limits, or image behavior.

## Workflow

1. Inspect the target project's package manager and installed Paper Shaders package/version. Preserve the existing framework and dependency style.
2. Read [references/usage.md](references/usage.md) before writing integration code.
3. Read only the relevant file under [Shader references](#shader-references). Use its exact component export, fragment-shader export, props, defaults, enum options, and implementation capacity.
4. For React, prefer the named shader component. Use the low-level React `ShaderMount` only for a custom fragment shader or an explicitly requested uniform-level integration.
5. For vanilla JavaScript or TypeScript, reproduce the named React component's uniform construction. Apply every conversion and special requirement listed in `usage.md` and the matching shader reference.
6. Give the mount element an explicit rendered size. Keep shader props separate from layout styles and ordinary DOM props.
7. Verify with the project's type-check/build and, when rendering is available, inspect the result at the intended dimensions.

## Source authority

- Treat `packages/shaders/src/shaders/*.ts` and `packages/shaders-react/src/shaders/*.tsx` as authoritative for runtime behavior, types, defaults, enum mappings, and uniforms.
- Treat `packages/shaders/src/shader-mount.ts`, `packages/shaders/src/shader-sizing.ts`, and `packages/shaders-react/src/shader-mount.tsx` as authoritative for mounting, images, sizing, motion, and performance controls.
- Treat numeric ranges and steps in `docs/src/shader-defs/*-def.ts` as editor guidance, not runtime validation. Components pass values through without clamping.
- Resolve source contradictions in favor of the shader implementation and its exported types/constants. Never repeat a stale prose claim when an array size, type, constant, or component mapping contradicts it.
- Recheck current source when working against a different repository revision. Do not assume this reference overrides changed code.

## Implementation rules

- Import only public exports from the package entry point.
- Use `@paper-design/shaders-react` for named React components and presets.
- Use `@paper-design/shaders` for `ShaderMount`, fragment shaders, uniform types, enum maps, color conversion, noise textures, and image preprocessors.
- Supply all required initial vanilla uniforms. `ShaderMount` records uniform locations from the constructor's initial uniform object; later partial updates cannot introduce an unregistered uniform.
- Dispose vanilla mounts during teardown.
- Keep color arrays non-empty and do not exceed the shader reference's implementation capacity for colors or other fixed-size loops.
- Do not pass CSS named colors. The source color parser accepts hex, `rgb`/`rgba`, and `hsl`/`hsla` syntax.
- Do not use deprecated React aliases in new code.

## References

- [Usage and integration](references/usage.md): React, vanilla, common controls, uniform conversion, images, lifecycle, and special cases.

## Shader references

Read only the file for the shader being used:

{{shaderLinks}}
