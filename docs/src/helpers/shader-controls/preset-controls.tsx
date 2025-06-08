import { customButton } from '@/components/controllers';

/**
 * Configuration for a shader preset
 * @template T - Type of shader parameters (excluding colors)
 */
interface PresetControlsProps<T> {
  presets: Array<{
    name: string;
    params: T & { colors: string[] };
  }>;
  onPresetSelect: (colors: string[], params: Omit<T, 'colors'>) => void;
}

/**
 * Creates preset button controls for shader UI
 * @template T - Type of shader-specific parameters (e.g., intensity, scale, etc.)
 * @param props - Configuration options
 * @param props.presets - Array of preset configurations, each containing a name and full parameter set
 * @param props.onPresetSelect - Callback invoked when user clicks a preset button.
 * @returns Object mapping preset names to button control configurations
 */
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
