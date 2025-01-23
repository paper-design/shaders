import { useEffect } from 'react';

export const usePresetHighlight = (presets: Record<string, any>[], levaParams: Record<string, any>) => {
  useEffect(() => {
    const highlightPreset = () => {
      const matchingPreset = presets.find((preset) => {
        // We might need to remove properties present in the preset that are not changeable params in the future
        const { ...changeableParams } = preset.params;

        return Object.entries(changeableParams).every(([key, value]) => {
          const levaValue = levaParams[key as keyof typeof levaParams];
          const presetValue =
            typeof value === 'string' && value.startsWith('hsla') && value.endsWith(', 1)')
              ? value.replace('hsla', 'hsl').slice(0, -4) + ')'
              : value;

          if (key === 'speed') {
            return presetValue === (levaParams.reverse ? -levaValue : levaValue);
          }

          return levaValue === presetValue;
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
    };

    // Leva takes a little longer to mount on some examples, so buttons are not present at the time of the
    // first render. Delaying this hook with a timeout to ensure the buttons are present.
    const timeoutId = setTimeout(highlightPreset, 1);

    return () => clearTimeout(timeoutId);
  }, [levaParams, presets]);
};
