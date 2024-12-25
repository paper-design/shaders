<script lang="ts">
import { computed } from 'vue';
import ShaderMount, { type GlobalParams, type ShaderMountProps } from '../shader-mount.vue';
import {
  getShaderColorFromString,
  steppedSimplexNoiseFragmentShader,
  type SteppedSimplexNoiseUniforms,
} from '@paper-design/shaders';

export type SteppedSimplexNoiseParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  color5?: string;
  scale?: number;
  stepsNumber?: number;
} & GlobalParams;

export type SteppedSimplexNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & SteppedSimplexNoiseParams;

type SteppedSimplexNoisePreset = { name: string; params: Required<SteppedSimplexNoiseParams> };

export const defaultPreset: SteppedSimplexNoisePreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    color1: 'hsla(208.42, 24.68%, 45.29%, 1)',
    color2: 'hsla(94.07, 38.39%, 58.63%, 1)',
    color3: 'hsla(359.02, 93.88%, 61.57%, 1)',
    color4: 'hsla(42.35, 93.41%, 64.31%, 1)',
    color5: 'hsla(0, 0%, 100%, 1)',
    scale: 0.5,
    speed: 0.15,
    stepsNumber: 13,
    seed: 0,
  },
} as const;

const magmaPreset: SteppedSimplexNoisePreset = {
  name: 'Magma',
  params: {
    color1: 'hsla(0, 100%, 36.47%, 1)',
    color2: 'hsla(0, 95.54%, 43.92%, 1)',
    color3: 'hsla(20.08, 100%, 48.63%, 1)',
    color4: 'hsla(45, 100%, 45.49%, 1)',
    color5: 'hsla(31.87, 100%, 93.73%, 1)',
    speed: 0.2,
    scale: 2,
    stepsNumber: 8,
    seed: 0,
  },
};

const bloodCellPreset: SteppedSimplexNoisePreset = {
  name: 'Blood cell',
  params: {
    color1: '#30132f',
    color2: '#540332',
    color3: '#720d32',
    color4: '#720d32',
    color5: '#f4807c',
    scale: 0.72,
    speed: 0.22,
    stepsNumber: 29,
    seed: 0,
  },
};

const firstContactPreset: SteppedSimplexNoisePreset = {
  name: 'First contact',
  params: {
    color1: '#e5bde5',
    color2: '#150727',
    color3: '#512a5a',
    color4: '#deb0b0',
    color5: '#ffebeb',
    scale: 0.62,
    speed: -0.1,
    stepsNumber: 40,
    seed: 0,
  },
};

export const steppedSimplexNoisePresets: SteppedSimplexNoisePreset[] = [
  defaultPreset,
  magmaPreset,
  bloodCellPreset,
  firstContactPreset,
];
</script>

<script setup lang="ts">
const props = defineProps<SteppedSimplexNoiseProps>();

const uniforms = computed<SteppedSimplexNoiseUniforms>(() => {
  return {
    u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
    u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
    u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
    u_color4: getShaderColorFromString(props.color4, defaultPreset.params.color4),
    u_color5: getShaderColorFromString(props.color5, defaultPreset.params.color5),
    u_scale: props.scale ?? defaultPreset.params.scale,
    u_speed: props.speed ?? defaultPreset.params.speed,
    u_steps_number: props.stepsNumber ?? defaultPreset.params.stepsNumber,
    u_seed: props.seed ?? defaultPreset.params.seed,
  };
});
</script>

<template>
  <ShaderMount v-bind="props" :fragment-shader="steppedSimplexNoiseFragmentShader" :uniforms />
</template>
