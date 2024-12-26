<script lang="ts">
import { computed } from 'vue';
import ShaderMount, { type GlobalParams, type ShaderMountProps } from '../shader-mount.vue';
import { getShaderColorFromString, metaballsFragmentShader, type MetaballsUniforms } from '@paper-design/shaders';

export type MetaballsParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  scale?: number;
  dotSize?: number;
  visibilityRange?: number;
} & GlobalParams;

export type MetaballsProps = Omit<ShaderMountProps, 'fragmentShader'> & MetaballsParams;

type MetaballsPreset = { name: string; params: Required<MetaballsParams> };

export const defaultPreset: MetaballsPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    color1: 'hsla(350, 90%, 55%, 1)',
    color2: 'hsla(350, 80%, 60%, 1)',
    color3: 'hsla(20, 85%, 70%, 1)',
    scale: 10,
    speed: 0.6,
    dotSize: 1,
    visibilityRange: 0.4,
    seed: 0,
  },
};

export const metaballsPresets: MetaballsPreset[] = [defaultPreset];
</script>

<script setup lang="ts">
const props = defineProps<MetaballsProps>();

const uniforms = computed<MetaballsUniforms>(() => {
  return {
    u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
    u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
    u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
    u_scale: props.scale ?? defaultPreset.params.scale,
    u_dotSize: props.dotSize ?? defaultPreset.params.dotSize,
    u_visibilityRange: props.visibilityRange ?? defaultPreset.params.visibilityRange,
    u_seed: props.seed ?? defaultPreset.params.seed,
  };
});
</script>

<template>
  <ShaderMount v-bind="props" :fragment-shader="metaballsFragmentShader" :uniforms />
</template>
