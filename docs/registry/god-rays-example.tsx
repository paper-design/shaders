import { GodRays, GodRaysProps } from '@paper-design/shaders-react';

export function GodRaysExample(props: GodRaysProps) {
  return (
    <GodRays
      colorBack="#404040"
      color1="#6669ff"
      color2="#66ffb3"
      color3="#66ccff"
      offsetX={0}
      offsetY={0}
      spotty={0.15}
      midIntensity={0}
      midSize={0}
      density={0.8}
      blending={0.4}
      frequency={1.2}
      speed={2}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
}
