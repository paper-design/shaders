# Paper Shaders

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
