'use client';

import { useEffect } from 'react';
import { deserializeParams } from './url-serializer';
import { setParamsSafe } from './use-reset-leva-params';
import type { ShaderDef } from '../shader-defs/shader-def-types';

export const useUrlParams = (
  params: any,
  setParams: any,
  shaderDef: ShaderDef,
  setColors?: (colors: string[]) => void
) => {
  useEffect(() => {
    const urlParams = (() => {
      if (typeof window === 'undefined') return null;

      const hash = window.location.hash.slice(1); // Remove #
      if (!hash) return null;

      try {
        return deserializeParams(hash, shaderDef.params);
      } catch (error) {
        console.warn('Failed to parse URL parameters:', error);
        return null;
      }
    })();

    if (urlParams && Object.keys(urlParams).length > 0) {
      const colorParams = shaderDef.params.filter((param) => param.isColor);
      const colorArrayParam = colorParams.find((param) => param.type === 'string[]');

      // Handle dynamic colors array (like 'colors' param)
      if (setColors && colorArrayParam && urlParams[colorArrayParam.name]) {
        const colorsValue = urlParams[colorArrayParam.name];
        const colorsArray = Array.isArray(colorsValue)
          ? colorsValue.filter((color): color is string => typeof color === 'string')
          : [String(colorsValue)];
        setColors(colorsArray);

        const { [colorArrayParam.name]: _, ...otherParams } = urlParams;
        setParamsSafe(params, setParams, otherParams);
      } else {
        setParamsSafe(params, setParams, urlParams);
      }

      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState({}, '', url.toString());
    }
  }, [params, setParams, setColors, shaderDef]);
};
