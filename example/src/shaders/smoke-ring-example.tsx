import { SmokeRing, type SmokeRingParams, smokeRingPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';

const usePresetHighlight = (presets: typeof smokeRingPresets, params: SmokeRingParams) => {
  useEffect(() => {
    const matchingPreset = presets.find((preset) => {
      return Object.entries(preset.params).every(([key, value]) => {
        const paramValue = params[key as keyof typeof params];
        const presetValue =
          typeof value === 'string' && value.startsWith('hsla') && value.endsWith(', 1)')
            ? value.replace('hsla', 'hsl').slice(0, -4) + ')'
            : value;
        return paramValue === presetValue;
      });
    });

    presets.forEach((preset, presetIndex) => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(`#leva__root button`);
      if (buttons.length > 0) {
        if (preset === matchingPreset) {
          buttons[presetIndex].style.backgroundColor = 'var(--leva-colors-accent1)';
        } else {
          buttons[presetIndex].style.backgroundColor = 'var(--leva-colors-elevation3)';
        }
      }
    });
  }, [params, presets]);
};

/**
 * You can copy/paste this example to use SmokeRing in your app
 */
const SmokeRingExample = () => {
  return (
    <SmokeRing
      colorBack="#6a5496"
      color1="#9b8ab8"
      color2="#f5d03b"
      noiseScale={1}
      speed={1.2}
      thickness={0.3}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = smokeRingPresets[0].params;

export const SmokeRingWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: SmokeRingParams = Object.fromEntries(
      smokeRingPresets.map((preset) => [preset.name, button(() => setParams(preset.params))])
    );
    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 1 },
          color1: { value: defaults.color1, order: 2 },
          color2: { value: defaults.color2, order: 3 },
          speed: { value: defaults.speed, order: 4, min: -4, max: 4 },
          thickness: { value: defaults.thickness, order: 5, min: 0.1, max: 2 },
          noiseScale: { value: defaults.thickness, order: 6, min: 0.01, max: 5 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useEffect(() => {
    setParams(defaults);
  }, []);

  usePresetHighlight(smokeRingPresets, params);

  return <SmokeRing {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};
