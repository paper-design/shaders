import { ReactNode } from 'react';

export type BaseControl<T = unknown> = {
  value: T;
  onChange: (value: T) => void;
};

import type { SliderControl } from './slider';
import type { SelectControl } from './select';
import type { CheckboxControl } from './checkbox';

export type CustomControl = {
  type: 'custom';
  render: () => ReactNode;
};

export type ButtonControl = {
  type: 'button';
  onClick: () => void;
};

export type Control = SliderControl | SelectControl | CheckboxControl | CustomControl | ButtonControl;

export type FolderDefinition = {
  _isFolder: true;
  config: Record<string, Control>;
  options: {
    collapsed?: boolean;
    spacing?: string;
  };
};

export type ControlSchema = Record<string, Control | FolderDefinition>;

export type SimpleSliderControl = {
  min: number;
  max: number;
  step?: number;
};

export type SimpleSelectControl = {
  options: string[];
};

export type SimpleBooleanControl = Record<string, never>; // Empty object type

export type SimpleControl =
  | SimpleSliderControl
  | SimpleSelectControl
  | SimpleBooleanControl
  | CustomControl
  | ButtonControl;
