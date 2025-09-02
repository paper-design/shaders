'use client';

import { useEffect, useRef } from 'react';
import { extractParamsFromUrl, clearUrlParams } from './shader-url-params';
import { setParamsSafe } from './use-reset-leva-params';
import type { ShaderDef } from '../shader-defs/shader-def-types';

/**
 * Hook to load parameters from URL hash as a secondary effect after Leva initialization
 * This approach keeps page components simple - no need to modify initialization logic
 */
export const useUrlParams = (
  params: any,
  setParams: any,
  shaderDef: ShaderDef,
  setColors?: (colors: string[]) => void
) => {
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasLoadedRef.current) return;

    // Small delay to ensure Leva controls are fully initialized
    const timeoutId = setTimeout(() => {
      const urlParams = extractParamsFromUrl(shaderDef.params);

      if (urlParams && Object.keys(urlParams).length > 0) {
        console.log('Loading shared params from URL:', urlParams);

        // Find color parameters from shader definition
        const colorParams = shaderDef.params.filter((param) => param.isColor);
        const colorArrayParam = colorParams.find((param) => param.type === 'string[]');

        // Handle dynamic colors array (like 'colors' param)
        if (setColors && colorArrayParam && urlParams[colorArrayParam.name]) {
          const colorsValue = urlParams[colorArrayParam.name];
          const colorsArray = Array.isArray(colorsValue)
            ? colorsValue.filter((color): color is string => typeof color === 'string')
            : [String(colorsValue)];
          console.log('Setting dynamic colors from URL:', colorsArray);
          setColors(colorsArray);

          // Remove colors from urlParams to avoid setting it through setParamsSafe
          const { [colorArrayParam.name]: _, ...otherParams } = urlParams;
          setParamsSafe(params, setParams, otherParams);
        } else {
          setParamsSafe(params, setParams, urlParams);
        }

        // Clear the URL hash after a short delay to ensure React has processed the state
        setTimeout(() => {
          clearUrlParams();
          console.log('URL hash cleared');
        }, 100);
      }

      hasLoadedRef.current = true;
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [params, setParams, setColors, shaderDef]);
};
