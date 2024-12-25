<script lang="ts">
import { type CSSProperties, type Ref, ref, watch, onScopeDispose, type MaybeRefOrGetter, toRef } from 'vue';
import { ShaderMount as ShaderMountVanilla } from '@paper-design/shaders';

export interface ShaderMountProps {
  ref?: Ref<HTMLCanvasElement>;
  fragmentShader: string;
  style?: CSSProperties;
  uniforms?: MaybeRefOrGetter<Record<string, number | number[]>>;
  webGlContextAttributes?: WebGLContextAttributes;
  speed?: number;
  seed?: number;
}

/** Params that every shader can set as part of their controls */
export type GlobalParams = Pick<ShaderMountProps, 'speed' | 'seed'>;
</script>

<script setup lang="ts">
const {
  ref: defaultRef,
  fragmentShader,
  style,
  uniforms = {},
  webGlContextAttributes,
  speed = 1,
  seed = 0,
} = defineProps<ShaderMountProps>();

const canvasRef = defaultRef ?? ref<HTMLCanvasElement | null>(null);
const shaderMountRef = ref<ShaderMountVanilla | null>(null);
const uniformsRef = toRef(uniforms);

watch(
  () => [fragmentShader, webGlContextAttributes],
  () => {
    if (canvasRef.value) {
      shaderMountRef.value = new ShaderMountVanilla(
        canvasRef.value,
        fragmentShader,
        uniformsRef.value,
        webGlContextAttributes,
        speed,
        seed
      );
    }
  }
);

onScopeDispose(() => {
  shaderMountRef.value?.dispose();
});

watch(uniformsRef, (v) => {
  shaderMountRef.value?.setUniforms(v);
});

watch(
  () => speed,
  (v) => {
    shaderMountRef.value?.setSpeed(v);
  }
);

watch(
  () => seed,
  (v) => {
    shaderMountRef.value?.setSeed(v);
  }
);
</script>

<template>
  <canvas ref="canvasRef" :style />
</template>
