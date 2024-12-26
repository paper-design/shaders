<script lang="ts">
import { computed } from 'vue';
import ShaderMount, { type GlobalParams, type ShaderMountProps } from '../shader-mount.vue';
import { getShaderColorFromString, meshGradientFragmentShader, type MeshGradientUniforms } from '@paper-design/shaders';

export type MeshGradientParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
} & GlobalParams;

export type MeshGradientProps = Omit<ShaderMountProps, 'fragmentShader'> & MeshGradientParams;

type MeshGradientPreset = { name: string; params: Required<MeshGradientParams> };

export const defaultPreset: MeshGradientPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    color1: 'hsla(259, 29%, 73%, 1)',
    color2: 'hsla(263, 57%, 39%, 1)',
    color3: 'hsla(48, 73%, 84%,1)',
    color4: 'hsla(295, 32%, 70%, 1)',
    speed: 0.15,
    seed: 0,
  },
};

export const beachPreset: MeshGradientPreset = {
  name: 'Beach',
  params: {
    color1: 'hsla(186, 81%, 83%, 1)',
    color2: 'hsla(198, 55%, 68%, 1)',
    color3: 'hsla(53, 67%, 88%, 1)',
    color4: 'hsla(45, 93%, 73%, 1)',
    speed: 0.1,
    seed: 0,
  },
};

export const meshGradientPresets: MeshGradientPreset[] = [defaultPreset, beachPreset];
</script>

<script setup lang="ts">
const props = defineProps<MeshGradientProps>();

const uniforms = computed<MeshGradientUniforms>(() => {
  return {
    u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
    u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
    u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
    u_color4: getShaderColorFromString(props.color4, defaultPreset.params.color4),
    u_speed: props.speed ?? defaultPreset.params.speed,
    u_seed: props.seed ?? defaultPreset.params.seed,
  };
});
</script>

<template>
  <ShaderMount v-bind="props" :fragment-shader="meshGradientFragmentShader" :uniforms />
</template>
