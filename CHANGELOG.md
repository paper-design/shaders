# Paper Shaders

## Version 0.0.65

**Halftone Dots**

- Renamed the boolean `straight` prop to `grid = 'hex' | 'square'`
- Adjusted `size` and `contrast` parameter curves
- Fixed an issue where the dot radius would unexpectedly change when resizing the shader canvas

## Version 0.0.64

New shader: **Halftone Dots**

## Version 0.0.63

- **General**
  - Removed an unnecessary SSR warning (“Can’t create a texture on the server”)
- **Fluted Glass**
  - Added a new `edges` parameter to control the distortion and blur around the image edges, while the `blur` parameter now affects only the "inside" of the image
  - Improved the contour and blending of shadows to make them more versatile with different colors
  - Improved color mixing with semi-transparent backgrounds
  - Refined the appearance of the glass edges when using `margin`
  - Changed `colorHighlight` transparency to multiply together with the `highlights` value

## Version 0.0.62

- **General**
  - Accept numeric strings for the `width` and `height` props, e.g. `width="600" height="400"`
- **Fluted Glass**
  - New parameters: `colorBack`, `colorShadow`, `colorHighlights`, `shadows`, `highlights`, `grainMixer`, `grainOverlay`
  - Changed `angle` to go clockwise instead of counterclockwise
  - Adjusted `distortion` so it’s not restricted just to the image boundaries anymore
  - Adjusted `blur` so it also naturally softens the edges of the image
  - Renamed `edges` to `stretch`
  - Improved anti-aliasing quality
- **Image Dithering**
  - Fixed rendering artifacts visible at large dither sizes

## Version 0.0.61

- **General**
  - Cross-GPU safety improvements
- **Static Radial Gradient**
  - Changed `angle` to go clockwise instead of counterclockwise
- **Heatmap**
  - Changed `angle` to go clockwise instead of counterclockwise
- **Image Dithering**
  - Made sure that the shader works as expected in Firefox

## Version 0.0.60

- **Liquid Metal**
  - Fixed rendering for Nvidia GPUs

## Version 0.0.59

Minor adjustments to the Liquid Metal edge contour

## Version 0.0.58

- **General**
  - Improve anti-aliasing for all image shaders when the images are downscaled
- **Liquid Metal**
  - New reworked version that supports custom images
  - New default look and presets
  - Added an `angle` parameter
  - Improved contour and edge distortion
  - Speed increased 3x, repetition increased 2x

## Version 0.0.57

- Reverts the initialization timing changes introduced in 0.0.56

## Version 0.0.56

- Shaders are now paused in the background when the browser tab becomes hidden
- Improved shader initialization timing and WebGL resources clean-up

## Version 0.0.55

- **Fluted Glass**
  - The `image` param is now required
  - The default placeholder image was removed
  - Added a shorthand `margin` param to specify all 4 margin sides at once
- **Image Dithering**
  - The `image` param is now required
  - The default placeholder image was removed
  - Renamed `pxSize` → `size` for consistency with Dot Grid’s `size`, which is also pixel-based
- **Heatmap**
  - The `image` param is now required
  - The default placeholder image was removed
  - Fixed an issue that may cause Heatmap initialization failure in Safari and Firefox
- **Paper Texture**
  - Removing the `image` prop no longer loads the default placeholder
  - The default placeholder image was removed
  - Renamed `blur` → `fade`, improved the effect design
  - Renamed `foldsNumber` → `foldCount`
  - Replaced `fiberScale` with a normalized `fiberSize` parameter
  - Replaced `crumplesScale` with a normalized `crumpleSize` parameter
- **Pulsing Border**
  - Reworked the effect parameter ranges for more creative range and control
  - Improved antialiasing quality and the corner rounding shape
  - The border is now drawn on the inside at low `softness` values
  - New `aspectRatio` parameter to make it easier to create “thinking orb” designs
  - New margin parameters to control the exact distance from the shader edges
- **Water**
  - Removing the `image` prop no longer loads the default placeholder
  - The default placeholder image was removed
- **Dithering**
  - Renamed `pxSize` → `size` for consistency with Dot Grid’s `size`, which is also pixel-based

Parameter renames are backwards-compatible.

## Version 0.0.54

### General

- Improve how the final render resolution is computed for all shaders. The new heuristc is now accurate down to physical device pixels and has more reliable behavior across browsers.

### Changes

- **Static Mesh Gradient**, **Static Radial Gradient**
  - Change the grain style from the fiber effect to pixel-based grain
- **Mesh Gradient**
  - Add `grainMixer` and `grainOverlay` params
- **Water**
  - Replace `effectScale` with the `size` param
- **Fluted Glass**
  - Replace `count` with a normalized `size` param
  - Rename `highlights` to `edges`

## Version 0.0.53

### New features

- Add width/height props to shader components
- Add center and proportion params to Swirl shader

### Fixes

- Update shader preset values
- Remove image from image shader presets
- Fix effectScale in Water shader
- Fix first frame not matching for some shaders

## Version 0.0.52

- Revert heatmap shader preset param change.

## Version 0.0.51

- Add `suspendWhenProcessingImage` prop to the heatmap shader component.
- Update heatmap shader presets.

## Version 0.0.50

- Only heatmap related changes

## Version 0.0.49

- Only heatmap related changes

## Version 0.0.48

### General

- The `ShaderMount` component no longer has a race condition when updating uniforms.

### Existing Shader Improvements

- **Paper Texture**
  - Image blending bugfix for semi-transparent `colorBack` (ver46 fix wasn't working properly)

### New Shaders

- Added **Heatmap** component (not available in the docs yet)

## Version 0.0.47

### General

- Licence changed to [PolyForm Shield License 1.0.0](https://polyformproject.org/licenses/shield/1.0.0)
- Shaders documentation added to **shaders.paper.design** 🎉
- Sizing behaviour changed so graphics don’t crop if `worldBox` size is larger than canvas

### Existing Shader Improvements

- **Water**, **FlutedGlass**, **PaperTexture**, **PaperTexture**

  - Fixed default image URL

- **FlutedGlass**, **PaperTexture**, **PaperTexture**

  - Default image sizing changed (`fit`)

- **Water**
  - `highlightColor` renamed to `colorHighlight`
  - Default preset changed (`scale`, `colorBack`)
- **PaperTexture**
  - Additional presets changed
  - Image blending bugfix for semi-transparent `colorBack`
- **FlutedGlass**

  - Additional presets changed

- **ColorPanels**
  - Default preset changed (`colorBack`, `scale`)
  - Additional presets changed
  - Panels angle now independent from side `blur`
- **SmokeRing**

  - Default preset changed (scale, `colorBack`)
  - Additional presets changed
  - Reversed order of colors

- **PulsingBorder**
  - Default preset changed (scale, colors, pulse)
  - Additional presets changed
  - Nvidia 3060 bugfix ([issue #146](https://github.com/paper-design/shaders/issues/146))
- **SimplexNoise**

  - Default preset changed (`stepsPerColor`)
  - Antialiasing bugfix

- **GrainGradient**

  - Default preset changed (`noise`)
  - Better randomizing on `dots` shape

- **Waves**

  - Default preset changed (`scale`, `spacing`)

- **Voronoi**

  - Default preset changed (`gap`)

- **LiquidMetal**

  - Default preset changed (`scale`)

- **StaticRadialGradient**, **Metaballs**, **GodRays**

  - Default preset changed (`colorBack`)

- **Dithering**

  - Default preset changed (`scale`)
  - Additional presets changed

- **DotOrbit**

  - Default preset changed (`speed`, `colors`)
  - Additional presets changed

- **Swirl**, **PerlinNoise**,
  - Additional presets changes

## Version 0.0.46

### General

- New default presets for all shaders, with adjusted previews for some shaders
- Replaced procedural randomizer with a more stable hash function
- Switched from `WebGLRenderingContext` to `WebGL2RenderingContext`
- Fixed WebGL texture indexing — now possible to use 2+ texture uniforms in one shader
- Vertex shader now provides `imageUV` for image filters
- Shader chunks (`shader-utils.ts`) now have clearer naming and unified usage across shaders

### Existing Shader Improvements

- **StaticRadialGradient**, **StaticMeshGradient**

  - Fixed fiber-shape noise to make it independent of canvas resolution

- **Dithering**

  - Fixed Sphere and Dots shapes on certain Android models
  - Improved stability of the `random` dithering type

- **DotOrbit**, **GodRays**, **Metaballs**

  - Now use `u_noiseTexture` for better performance and stability across devices

- **PerlinNoise**

  - Fixed randomizer-related issues on some Android models

- **Spiral**
  - Inverted `strokeWidth` behavior
- **GrainGradient**
  - Switched to low precision

### New Shaders

- Added **FlutedGlass** component
- Added **ImageDithering** component
- Added **PaperTexture** component
- Added **Water** component

All four new effects work as photo filters. **PaperTexture** and **Water** can also be used without an image.

## Version 0.0.45

### General

- Added `'use client'` to React bundle for better RSC "out of the box" experience.
- Improved RSC and SSR handling
- Reduced bundle size by removing unused texture

## Version 0.0.44

### General

- `v_patternUV` now comes from the vertex shader with a `×100` multiplier to avoid precision errors
- Renamed `totalFrameTime` to `currentFrame`
- Fixed precision errors on Android devices by checking actual device float precision. `highp` is now forced
  if `mediump` float has less than 23 bits
- Added hash-based caching for texture uniforms
- Updated repo and npm `README.md`

### Existing Shader Improvements

- **Antialiasing** improved across multiple shaders:

  - _Waves, Warp, Swirl, Spiral, SimplexNoise, PulsingBorder, LiquidMetal, GrainGradient_

- **Voronoi**

  - Fixed glow color behavior: glow is now fully hidden when `glow = 0`

- **Swirl**

  - Improved color distribution
  - Renamed `noisePower` to `noise`
  - Normalized `noiseFrequency`

- **Spiral**

  - Enhanced algorithm for `lineWidth`, `strokeTaper`, `strokeCap`, `noise`, and `distortion`
  - Swapped `colorBack` and `colorFront`
  - Renamed `noisePower` to `noise`
  - Normalized `noiseFrequency`

- **PulsingBorder**

  - Normalized `thickness`, `intensity`, `spotSize`, and `smokeSize`
  - Renamed `spotsPerColor` to `spots`
  - `intensity` now affects only the shape, not color mixing
  - Added new `bloom` parameter to control color mixing and blending
  - Reduced maximum number of spots, but individual spots stay visible longer
  - Improved inner corner masking
  - Performance optimizations
  - Pulsing signal is now slower and simpler, (a composition of two sine waves instead of a pre-computed
    speech-mimicking
    data)

- **MeshGradient**

  - Minor performance improvements

- **ColorPanels**

  - Added new `edges` parameter

- **Default Presets** updated for the following shaders:
  - _Spiral, SimplexNoise, PulsingBorder, NeuroNoise, GrainGradient, DotGrid, Dithering_

### New Shaders

- Added `StaticMeshGradient` component
- Added `StaticRadialGradient` component
