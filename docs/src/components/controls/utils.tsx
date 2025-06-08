import React from 'react';
import { Slider } from './slider';
import { Select } from './select';
import { Checkbox } from './checkbox';
import { ControlGroup } from './control-group';
import type { Control, ControlSchema, FolderDefinition, SimpleControl, ButtonControl, CustomControl } from './types';

/**
 * Creates a unique identifier by combining a prefix with a kebab-cased label.
 * Useful for generating consistent DOM IDs for form controls.
 *
 * @param prefix - The prefix to prepend to the ID
 * @param label - The label to convert to kebab-case
 * @returns A kebab-cased ID string
 *
 * @example
 * createId('shader', 'Color Mode') // returns 'shader-color-mode'
 * createId('control', 'Max Value') // returns 'control-max-value'
 */
export const createId = (prefix: string, label: string) => `${prefix}-${label.replace(/\s+/g, '-').toLowerCase()}`;

/**
 * Renders a single control component based on its type.
 * Acts as a factory function that returns the appropriate React component
 * for different control types (button, custom, select, checkbox, or slider).
 *
 * @param key - The unique key/label for the control
 * @param control - The control configuration object
 * @returns A React element representing the control
 *
 * @example
 * renderControl('brightness', { type: 'slider', value: 0.5, min: 0, max: 1 })
 * renderControl('reset', { type: 'button', onClick: () => reset() })
 */
export const renderControl = (key: string, control: Control) => {
  switch (control.type) {
    case 'button':
      return (
        <button
          key={key}
          onClick={control.onClick}
          className="w-full rounded-sm bg-white/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/20 active:bg-white/30"
        >
          {key}
        </button>
      );

    case 'custom':
      return <div key={key}>{control.render()}</div>;

    case 'select':
      return <Select key={key} label={key} {...control} />;

    case 'checkbox':
      return <Checkbox key={key} label={key} {...control} />;

    default:
      return <Slider key={key} label={key} {...control} />;
  }
};

/**
 * Renders a complete control schema, which can contain both individual controls
 * and folders (groups) of controls. Folders are rendered as collapsible groups
 * with their nested controls inside.
 *
 * @param schema - The control schema object containing controls and/or folders
 * @returns An array of React elements representing the entire control panel
 *
 * @example
 * const schema = {
 *   brightness: { value: 0.5, min: 0, max: 1 },
 *   colors: {
 *     _isFolder: true,
 *     config: {
 *       hue: { value: 180, min: 0, max: 360 },
 *       saturation: { value: 100, min: 0, max: 100 }
 *     }
 *   }
 * };
 * renderControlSchema(schema)
 */
export const renderControlSchema = (schema: ControlSchema) => {
  return Object.entries(schema).map(([key, item]) => {
    if ('_isFolder' in item) {
      return (
        <ControlGroup key={key} title={key} defaultCollapsed={item.options?.collapsed} spacing={item.options?.spacing}>
          {Object.entries(item.config).map(([k, control]) => renderControl(k, control))}
        </ControlGroup>
      );
    }
    return <div key={key}>{renderControl(key, item as Control)}</div>;
  });
};

/**
 * Creates a folder definition from a simplified control configuration.
 * This function transforms a simple control config into a full control schema
 * with proper event handlers and type inference.
 *
 * @template T - The type of the parameters object
 * @param simpleConfig - Simplified control definitions without event handlers
 * @param params - Current parameter values
 * @param setParams - Function to update parameter values
 * @param options - Optional folder configuration (e.g., collapsed state, spacing)
 * @returns A FolderDefinition object ready to be rendered
 *
 * @example
 * const params = { brightness: 0.5, contrast: 1.0, invert: false };
 * const folder = createFolder(
 *   {
 *     brightness: { min: 0, max: 1, step: 0.01 },
 *     contrast: { min: 0, max: 2, step: 0.1 },
 *     invert: {} // checkbox
 *   },
 *   params,
 *   (updates) => setParams({ ...params, ...updates }),
 *   { collapsed: false }
 * );
 */
export const createFolder = <T extends Record<string, unknown>>(
  simpleConfig: Record<string, SimpleControl>,
  params: T,
  setParams: (updates: Partial<T>) => void,
  options: FolderDefinition['options'] = {}
): FolderDefinition => {
  const config: Record<string, Control> = {};

  for (const [key, control] of Object.entries(simpleConfig)) {
    /** Handle custom controls */
    if ('type' in control && control.type === 'custom') {
      config[key] = control;
      continue;
    }

    /** Handle button controls */
    if ('type' in control && control.type === 'button') {
      config[key] = control;
      continue;
    }

    /** Handle select controls */
    if ('options' in control) {
      config[key] = {
        type: 'select',
        value: params[key as keyof T] as string,
        options: control.options,
        onChange: (v) => setParams({ [key]: v } as Partial<T>),
      };
      continue;
    }

    /** Handle slider controls */
    if ('min' in control && 'max' in control) {
      config[key] = {
        value: params[key as keyof T] as number,
        min: control.min,
        max: control.max,
        step: control.step,
        onChange: (v) => setParams({ [key]: v } as Partial<T>),
      };
      continue;
    }

    /** Handle checkbox controls */
    if (Object.keys(control).length === 0 || typeof params[key as keyof T] === 'boolean') {
      config[key] = {
        type: 'checkbox',
        value: params[key as keyof T] as boolean,
        onChange: (v) => setParams({ [key]: v } as Partial<T>),
      };
    }
  }

  return { _isFolder: true, config, options };
};

/**
 * Creates a button control configuration object.
 *
 * @param onClick - The click handler function for the button
 * @returns A ButtonControl configuration object
 *
 * @example
 * const resetButton = customButton(() => {
 *   console.log('Resetting values...');
 *   resetToDefaults();
 * });
 */
export const customButton = (onClick: () => void): ButtonControl => ({
  type: 'button',
  onClick,
});
