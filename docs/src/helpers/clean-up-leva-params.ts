// Remove presets from params so they are not passed as props
export const cleanUpLevaParams = (params: Record<string, unknown>) => {
  for (const key of Object.keys(params)) {
    if (key === 'default' || key.match(/^[A-Z]/)) {
      delete params[key];
    }
  }
};
