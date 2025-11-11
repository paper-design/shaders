import type { ShaderDef } from './shader-def-types';

import { colorPanelsDef } from './color-panels-def';
import { ditheringDef } from './dithering-def';
import { dotGridDef } from './dot-grid-def';
import { dotOrbitDef } from './dot-orbit-def';
import { flutedGlassDef } from './fluted-glass-def';
import { godRaysDef } from './god-rays-def';
import { grainGradientDef } from './grain-gradient-def';
import { imageDitheringDef } from './image-dithering-def';
import { liquidMetalDef } from './liquid-metal-def';
import { meshGradientDef } from './mesh-gradient-def';
import { metaballsDef } from './metaballs-def';
import { neuroNoiseDef } from './neuro-noise-def';
import { paperTextureDef } from './paper-texture-def';
import { perlinNoiseDef } from './perlin-noise-def';
import { pulsingBorderDef } from './pulsing-border-def';
import { simplexNoiseDef } from './simplex-noise-def';
import { smokeRingDef } from './smoke-ring-def';
import { spiralDef } from './spiral-def';
import { staticMeshGradientDef } from './static-mesh-gradient-def';
import { staticRadialGradientDef } from './static-radial-gradient-def';
import { swirlDef } from './swirl-def';
import { voronoiDef } from './voronoi-def';
import { warpDef } from './warp-def';
import { waterDef } from './water-def';
import { wavesDef } from './waves-def';
import { halftoneDotsDef } from './halftone-dots-def';

export const shaderDefs: ShaderDef[] = [
  grainGradientDef,
  meshGradientDef,
  staticMeshGradientDef,
  staticRadialGradientDef,
  ditheringDef,
  dotOrbitDef,
  dotGridDef,
  warpDef,
  spiralDef,
  swirlDef,
  wavesDef,
  neuroNoiseDef,
  perlinNoiseDef,
  simplexNoiseDef,
  voronoiDef,
  pulsingBorderDef,
  metaballsDef,
  colorPanelsDef,
  smokeRingDef,
  liquidMetalDef,
  godRaysDef,
  paperTextureDef,
  flutedGlassDef,
  imageDitheringDef,
  waterDef,
  halftoneDotsDef,
];
