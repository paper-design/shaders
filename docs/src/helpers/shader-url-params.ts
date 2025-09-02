/**
 * Utilities for serializing and deserializing shader parameters to/from URL hash
 */

import {
  serializeParams as customSerializeParams,
  deserializeParams as customDeserializeParams,
  type SerializableValue,
} from './url-serializer';
import type { ParamDef } from '../shader-defs/shader-def-types';

export type { SerializableValue };

export const serializeParams = (params: Record<string, SerializableValue>, paramDefs?: ParamDef[]): string => {
  return customSerializeParams(params, paramDefs);
};

export const deserializeParams = (urlParams: string, paramDefs?: ParamDef[]): Record<string, SerializableValue> => {
  return customDeserializeParams(urlParams, paramDefs);
};

export const getShareableUrl = (params: Record<string, SerializableValue>, paramDefs?: ParamDef[]): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const serialized = serializeParams(params, paramDefs);
  return `${baseUrl}#${serialized}`;
};

export const extractParamsFromUrl = (paramDefs?: ParamDef[]): Record<string, SerializableValue> | null => {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash.slice(1); // Remove the # character
  if (!hash) return null;

  try {
    // No need to decode since our custom serializer produces URL-safe strings
    return deserializeParams(hash, paramDefs);
  } catch (error) {
    console.warn('Failed to parse URL parameters:', error);
    return null;
  }
};

export const clearUrlParams = (): void => {
  if (typeof window === 'undefined') return;

  // Remove the hash without triggering a navigation
  const url = new URL(window.location.href);
  url.hash = '';
  window.history.replaceState({}, '', url.toString());
};
