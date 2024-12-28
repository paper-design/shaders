import { useEffect } from 'react';

export const usePresetHighlight = (presets: Record<string, any>[], params: Record<string, any>) => {
  useEffect(() => {
    // Leva takes a little longer to mount on some examples, so buttons are not present at the time of the
    // first render. Delaying this hook with a timeout, even if it's 0, ensures that the buttons are present.
    const timeoutId = setTimeout(() => {
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
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [params, presets]);
};
