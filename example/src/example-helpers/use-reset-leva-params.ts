import { useEffect } from 'react';

/** Leva will try to cache values for params with the same name, so we need to explicitly reset params to defaults when a new example is mounted */
export function useResetLevaParams(params: any, setParams: any, defaults: any) {
  const newParamObject: Record<string, any> = {};

  useEffect(() => {
    // We need to prune off any extra keys from the defaults if there isn't a leva control for it
    // Not all shaders have leva controls for all params, like seed is often not needed
    // But leva will throw an error if we try to set a param for a control that doesn't exist
    for (const [key, value] of Object.entries(defaults)) {
      if (key in params) {
        newParamObject[key] = value;
      }
    }

    setParams(newParamObject);
  }, [params, setParams, defaults]);
}
