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
    const hashContent = window.location.hash.slice(1); // Remove #

    if (!hashContent) {
      return;
    }

    let urlParams;
    try {
      urlParams = deserializeParams(hashContent, shaderDef.params);
    } catch (error) {
      console.warn('Failed to parse URL parameters:', error);
    }

    if (!urlParams || Object.keys(urlParams).length === 0) {
      return;
    }

    if (setColors) {
      const colorArrayParam = shaderDef.params.find((param) => param.type === 'string[]' && param.isColor);
      if (colorArrayParam && urlParams[colorArrayParam.name]) {
        const colorsValue = urlParams[colorArrayParam.name];
        const colorsArray = Array.isArray(colorsValue) ? colorsValue : [colorsValue];
        setColors(colorsArray as string[]);
      }
    }

    setParamsSafe(params, setParams, urlParams);

    // Clear hash from URL
    const url = new URL(window.location.href);
    url.hash = '';
    window.history.replaceState({}, '', url.toString());
  }, [params, setParams, setColors, shaderDef]);
};
