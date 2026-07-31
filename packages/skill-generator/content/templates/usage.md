# Paper Shaders usage

This reference is derived from:

- `packages/shaders/src/index.ts`
- `packages/shaders/src/shader-mount.ts`
- `packages/shaders/src/shader-sizing.ts`
- `packages/shaders/src/get-shader-color-from-string.ts`
- `packages/shaders-react/src/index.ts`
- `packages/shaders-react/src/shader-mount.tsx`
- `packages/shaders-react/src/shaders/*.tsx`

Read the matching file under [Shader references](../SKILL.md#shader-references) for shader-specific props, defaults, ranges, enum options, exports, capacities, and special vanilla requirements.

## Contents

- [Packages](#packages)
- [React](#react)
  - [Presets](#presets)
  - [Low-level React mount](#low-level-react-mount)
- [Vanilla](#vanilla)
  - [Convert React props to vanilla uniforms](#convert-react-props-to-vanilla-uniforms)
  - [Noise textures](#noise-textures)
  - [Images](#images)
  - [Preprocessed image shaders](#preprocessed-image-shaders)
  - [Color syntax](#color-syntax)
- [Common sizing and motion](#common-sizing-and-motion)
- [Verification](#verification)

## Packages

- React: `@paper-design/shaders-react`
- Vanilla JavaScript or TypeScript: `@paper-design/shaders`

The repository README asks consumers to pin the dependency because breaking changes may ship under `0.0.x` versioning. Match the project's existing package manager and version policy.

## React

Use the named component exported by `@paper-design/shaders-react`.

```tsx
import { MeshGradient } from '@paper-design/shaders-react';

export function HeroShader() {
  return (
    <MeshGradient
      colors={['#e0eaff', '#241d9a', '#f75092', '#9f50d3']}
      distortion={0.8}
      swirl={0.1}
      grainMixer={0}
      grainOverlay={0}
      speed={1}
      width="100%"
      height={320}
    />
  );
}
```

Every named shader component accepts its shader-specific params plus the common component controls:

- ordinary `div` props except `color` and `ref`
{{componentControls}}

`width` and `height` become inline styles. Other layout styles can be passed through `style`. Ensure the element resolves to a non-zero width and height.

### Presets

Each named React component has a corresponding exported preset array, such as `meshGradientPresets`. Preset `params` contain the shader params plus all sizing defaults and, when the shader supports motion, `speed` and `frame`. Image presets intentionally omit `image`; React-only component controls are also outside preset `params`.

```tsx
import { MeshGradient, meshGradientPresets } from '@paper-design/shaders-react';

const preset = meshGradientPresets[0].params;

<MeshGradient {...preset} width="100%" height={320} />;
```

Use the catalog's exact preset export name.

### Low-level React mount

`ShaderMount` from `@paper-design/shaders-react` accepts:

- `fragmentShader`
- `uniforms`
- `speed` and `frame`
- `mipmaps`
- `minPixelRatio` and `maxPixelCount`
- `webGlContextAttributes`
- `width`, `height`, and ordinary supported `div` props

String uniform values are treated as image URLs, not arbitrary string uniforms. Prefer named components for package shaders because they construct and convert uniforms correctly.

## Vanilla

The vanilla package exports fragment shader source and `ShaderMount`; it does not provide named convenience mount functions. Construct the complete uniform object yourself.
Create and dispose the mount in a browser/client lifecycle: the class requires DOM, `navigator`, canvas, and WebGL APIs.

```ts
import {
  ShaderFitOptions,
  ShaderMount,
  getShaderColorFromString,
  meshGradientFragmentShader,
  type MeshGradientUniforms,
} from '@paper-design/shaders';

const host = document.querySelector<HTMLElement>('#shader');
if (!host) throw new Error('Missing #shader element');

const colors = ['#e0eaff', '#241d9a', '#f75092', '#9f50d3'];

const uniforms: MeshGradientUniforms = {
  u_colors: colors.map(getShaderColorFromString),
  u_colorsCount: colors.length,
  u_distortion: 0.8,
  u_swirl: 0.1,
  u_grainMixer: 0,
  u_grainOverlay: 0,
  u_fit: ShaderFitOptions.contain,
  u_scale: 1,
  u_rotation: 0,
  u_offsetX: 0,
  u_offsetY: 0,
  u_originX: 0.5,
  u_originY: 0.5,
  u_worldWidth: 0,
  u_worldHeight: 0,
};

const mount = new ShaderMount(
  host,
  meshGradientFragmentShader,
  uniforms,
  undefined,
  1,
  0
);

mount.setUniforms({ u_distortion: 0.5 });
mount.setSpeed(0.5);

// Call during teardown:
mount.dispose();
```

The constructor arguments, in order, are:

1. parent `HTMLElement`
2. fragment shader string
3. initial uniform object
4. optional `WebGLContextAttributes`
5. speed, default `0`
6. frame, default `0`
7. minimum pixel ratio, default `2`
8. maximum pixel count, default `1920 * 1080 * 4`
9. uniform names that require mipmaps, default `[]`

The parent receives a prepended canvas, `data-paper-shader`, and `paperShaderMount`. `dispose()` removes the canvas and WebGL resources.

`ShaderMount` supports partial updates with `setUniforms`, and also exposes `getCurrentFrame`, `setFrame`, `setSpeed`, `setMinPixelRatio`, and `setMaxPixelCount`.

### Convert React props to vanilla uniforms

Follow the named React component's `uniforms` object. Apply these source-defined rules:

- Convert each color string with `getShaderColorFromString`.
- Convert `colors` with `.map(getShaderColorFromString)` and also set `u_colorsCount`.
- Convert `fit` with `ShaderFitOptions[fit]`.
- Convert enum props with their exported mapping object, such as `WarpPatterns[shape]`.
- Pass `speed` and `frame` to `ShaderMount`; they are not shader-specific uniforms.
- Map common sizing props to `u_fit`, `u_scale`, `u_rotation`, `u_offsetX`, `u_offsetY`, `u_originX`, `u_originY`, `u_worldWidth`, and `u_worldHeight`.
- Pass booleans as booleans. `ShaderMount` converts them to integer uniforms.
- Pass textures as fully loaded `HTMLImageElement` instances.

Do not assume every prop becomes `u_${prop}`. These package mappings differ:

- `Dithering.size` and `ImageDithering.size` → `u_pxSize`
- `DotGrid.size` → `u_dotSize`
- `FlutedGlass.margin` and `PulsingBorder.margin` → defaults for all four side-specific margin uniforms; an explicitly supplied side value wins
- `width`, `height`, `minPixelRatio`, `maxPixelCount`, `webGlContextAttributes`, and `ref` configure the mount/container and are not uniforms
- `suspendWhenProcessingImage` and deprecated compatibility props are React-only

Always inspect the catalog's source paths when constructing a vanilla shader. The uniform interfaces in `packages/shaders/src/shaders/*.ts` list the complete required uniform object.

### Noise textures

For shaders whose catalog says to set `u_noiseTexture`, import `getShaderNoiseTexture` and include:

```ts
const noiseTexture = getShaderNoiseTexture();
if (!noiseTexture) throw new Error('Noise textures require a browser');
await noiseTexture.decode();

// Include in the initial uniforms:
u_noiseTexture: noiseTexture
```

The source returns `undefined` outside the browser and a newly created `HTMLImageElement` in the browser. Wait for it to load before constructing the vanilla `ShaderMount`; the mount rejects incomplete images. The React mount performs this wait itself.

### Images

The low-level vanilla mount accepts `HTMLImageElement`, not URL strings. The image must be fully loaded and have a non-zero `naturalWidth`; otherwise mounting the texture throws.

The React mount accepts an `HTMLImageElement` or a string that is either:

- an absolute path beginning with `/`
- a URL accepted by `new URL(value)`
- an empty string, which becomes a transparent pixel

For an external URL, the React loader sets `crossOrigin = "anonymous"`. When both natural dimensions are below 1024, it sets the image dimensions so the shorter side is 1024 before upload.

When a texture is supplied as `u_image`, `ShaderMount` automatically looks up and fills `u_imageAspectRatio`.

Pass `["u_image"]` as the final vanilla constructor argument when the catalog requires mipmaps.

### Preprocessed image shaders

`Heatmap`, `LiquidMetal`, and `GemSmoke` preprocess image inputs in their React components. Reproduce this in vanilla:

- `toProcessedHeatmap(fileOrUrl)` returns `Promise<{ blob: Blob }>`
- `toProcessedLiquidMetal(fileOrUrl)` returns `Promise<{ imageData: ImageData; pngBlob: Blob }>`
- `toProcessedGemSmoke(fileOrUrl)` returns `Promise<{ imageData: ImageData; pngBlob: Blob }>`

Each function accepts `File | string` and requires browser document/canvas APIs. Load the returned blob into an `HTMLImageElement`, pass that loaded image as `u_image`, and enable mipmaps for `u_image`.

For `LiquidMetal` and `GemSmoke`, also set `u_isImage` from whether an original image was supplied and convert `shape` with `LiquidMetalShapes` or `GemSmokeShapes`. When no original image is supplied, load the exported `emptyPixel` into an `HTMLImageElement`, use that placeholder as the initial `u_image`, and set `u_isImage` to `false`; the shader still declares and samples `u_image`.

### Color syntax

`getShaderColorFromString` supports:

- 3-, 4-, 6-, and 8-digit hex
- comma-form `rgb(...)` and `rgba(...)`
- comma-form `hsl(...)` and `hsla(...)`
- already-normalized RGB or RGBA number tuples when calling the utility directly

It does not parse CSS named colors. Invalid values fall back to `[0.5, 0.5, 0.5, 1]`.

## Common sizing and motion

All named shader components accept:

{{sizingProperties}}

Defaults come from one of two source objects, then may be overridden by the component's default preset:

- `defaultObjectSizing`: `fit="contain"` and otherwise `scale=1`, `rotation=0`, offsets `0`, origins `0.5`, and world dimensions `0`
- `defaultPatternSizing`: the same values except `fit="none"`

The catalog lists the effective defaults for every shader.

Shaders whose params extend `ShaderMotionParams` also accept:

{{motionProperties}}

The mount pauses animated rendering when the document is hidden. It also pauses when the element leaves the viewport when `IntersectionObserver` is available in the element's window.

`minPixelRatio` defaults to `2`. `maxPixelCount` defaults to `1920 * 1080 * 4` physical pixels. The `Waves` React component overrides its `maxPixelCount` default to `6016 * 3384`.
The `DotGrid` React component uses the same `6016 * 3384` override.

## Verification

- Type-check against the installed package version.
- Confirm the mount has a non-zero layout size.
- Confirm all initial vanilla uniforms are present.
- Confirm color arrays are non-empty and do not exceed the implementation capacity in the catalog.
- Confirm image inputs load and satisfy CORS rules.
- Confirm preprocessors run only in a browser environment.
- Call `dispose()` for vanilla mounts during teardown.
