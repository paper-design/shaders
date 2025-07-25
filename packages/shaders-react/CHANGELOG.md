# @paper-design/shaders

## Version 0.0.40 (unreleased)

### General

- `v_patternUV` now comes from the vertex shader with a `×100` multiplier to avoid precision errors
- Renamed `totalFrameTime` to `currentFrame`
- Fixed precision errors on Android devices by checking actual device float precision. `highp` is now forced
  if `mediump` float has less than 23 bits
- Added hash-based caching for texture uniforms
- Updated usage documentation (`README.md`)

---

### Existing Shader Improvements

- **Antialiasing** improved across multiple shaders:
    - *Waves, Warp, Swirl, Spiral, SimplexNoise, PulsingBorder, LiquidMetal, GrainGradient*

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
    - *Spiral, SimplexNoise, PulsingBorder, NeuroNoise, GrainGradient, DotGrid, Dithering*

---

### 🆕 New Shaders

- Added `StaticMeshGradient` component
- Added `StaticRadialGradient` component