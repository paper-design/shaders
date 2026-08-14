import { LensDistortion, LensDistortionProps } from '@paper-design/shaders-react';

export function LensDistortionExample(props: LensDistortionProps) {
  return <LensDistortion style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}
