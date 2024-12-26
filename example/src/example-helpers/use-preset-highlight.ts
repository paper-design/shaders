import { useEffect } from 'react';

export function usePresetHighlight(presets: Record<string, any>[], params: Record<string, any>) {
  useEffect(() => {
    const matchingPreset = presets.find((preset) => {
      // Remove anything present in the preset that is not a param
      const { seed, ...rest } = preset.params;

      return Object.entries(rest).every(([key, value]) => {
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
          buttons[presetIndex].style.backgroundColor = 'var(--leva-colors-elevation3)';
        } else {
          buttons[presetIndex].style.backgroundColor = 'var(--leva-colors-elevation1)';
        }
      }
    });
  }, [params, presets]);
}
