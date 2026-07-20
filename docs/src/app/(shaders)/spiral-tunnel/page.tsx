'use client';

import { SpiralTunnel, spiralTunnelPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { spiralTunnelDef } from '@/shader-defs/spiral-tunnel-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

// First preset defaults
const firstPresetParams = spiralTunnelPresets[0].params;

// Extract worldWidth/worldHeight separately if you need them for ShaderContainer or def
const { worldWidth, worldHeight, ...defaults } = {
  ...firstPresetParams,
  speed: Math.abs(firstPresetParams.speed),
  reverse: firstPresetParams.speed < 0,
  style: { background: 'hsla(0, 0%, 0%, 0)' },
};

const SpiralTunnelWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      // Colors (converted to HSLA for Leva color picker)
      color1: { value: toHsla(defaults.color1), order: 100 },
      color2: { value: toHsla(defaults.color2), order: 101 },
      color3: { value: toHsla(defaults.color3), order: 102 },
      color4: { value: toHsla(defaults.color4), order: 103 },

      // Tunnel controls
      fieldOfView: { value: defaults.fieldOfView, min: 3, max: 600, order: 201 },
      luminosity: { value: defaults.luminosity, min: 0, max: 20, order: 202 },
      openingSize: { value: defaults.openingSize, min: 0, max: 500, order: 203 },
      ribbonCount: { value: defaults.ribbonCount, min: 1, max: 50, step: 1, order: 204 },
      ribbonWidth: { value: defaults.ribbonWidth, min: 0.01, max: 1.2, order: 205 },
      spiralDensity: { value: defaults.spiralDensity, min: 0.5, max: 50, order: 206 },
      spiralCount: { value: defaults.spiralCount, min: 1, max: 8, step: 1, order: 207 },
      lightIntensity: { value: defaults.lightIntensity, min: 0.1, max: 3, order: 208 },
      distortion: { value: defaults.distortion, min: 0, max: 30, order: 209 },
      hue: { value: defaults.hue, min: -180, max: 180, order: 210 },
      saturation: { value: defaults.saturation, min: 0, max: 2, order: 211 },

      // Motion / sizing
      speed: { value: defaults.speed, min: 0, max: 50, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
    };
  });

  // Preset buttons folder
  useControls(() => {
    const presets = Object.fromEntries(
      spiralTunnelPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );

    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount (same pattern as Spiral)
  useResetLevaParams(params, setParams, defaults);

  // URL params + preset highlight + cleanup
  useUrlParams(params, setParams, spiralTunnelDef);
  usePresetHighlight(spiralTunnelPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={spiralTunnelDef} currentParams={params}>
        <SpiralTunnel {...params} />
      </ShaderContainer>
      <ShaderDetails
        shaderDef={spiralTunnelDef}
        currentParams={params}
        notes={
          <>
            Made by [Maxim Bortnikov](https://maxim-bortnikov.netlify.app/)
            <br/><br/>
            This shader has been made from the following code:
            <br/>
            [GradientGen](https://github.com/noegarsoux/GradientGen) by [noegarsoux](https://github.com/noegarsoux)
            <br/>
            [Velustro](https://uvcanvas.com/docs/components/velustro) by [UVCanvas](https://uvcanvas.com/)
            <br/>
            [Tranquiluxe](https://uvcanvas.com/docs/components/tranquiluxe) by [UVCanvas](https://uvcanvas.com/)
            <br/>
            [swirl](/swirl) by [Paper Shaders](/)
            <br/>
            [Highway to Heaven](https://codepen.io/sabosugi/pen/azpqWKE) by [Sabo Sugi](https://codepen.io/sabosugi)
            <br/>
            [Hall of Fractals](https://codepen.io/sabosugi/pen/gbgeXja) by [Sabo Sugi](https://codepen.io/sabosugi)
            <br/><br/>
            Originally published on [Merucav](https://merucav.netlify.app/)
          </>
        }
      />
    </>
  );
};

export default SpiralTunnelWithControls;