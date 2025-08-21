import { GrainAndNoise, type GrainAndNoiseProps } from '@paper-design/shaders-react';

export function GrainAndNoiseExample(props: GrainAndNoiseProps) {
  return <GrainAndNoise style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}
