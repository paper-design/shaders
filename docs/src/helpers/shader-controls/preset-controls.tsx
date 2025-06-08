import { customButton } from '@/components/controllers';

interface PresetControlsProps<T> {
  presets: Array<{
    name: string;
    params: T & { colors: string[] };
  }>;
  onPresetSelect: (colors: string[], params: Omit<T, 'colors'>) => void;
}

export const createPresetControls = <T extends Record<string, unknown>>({
  presets,
  onPresetSelect,
}: PresetControlsProps<T>) => {
  const handlePresetClick = (preset: { params: T & { colors: string[] } }) => {
    const { colors, ...params } = preset.params;
    onPresetSelect(colors, params as Omit<T, 'colors'>);
  };

  return Object.fromEntries(
    presets.map(({ name, params }) => [name, customButton(() => handlePresetClick({ params }))])
  );
};
