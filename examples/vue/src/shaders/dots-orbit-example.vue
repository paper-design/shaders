<script setup lang="ts">
import { DotsOrbit, type DotsOrbitParams, dotsOrbitPresets } from '@paper-design/shaders-vue';
</script>

<template>
  <DotsOrbit
    color1="#6a5496"
    color2="#9b8ab8"
    color3="#f5d03b"
    color4="#e48b97"
    scale="11"
    dotSize="0.15"
    dotSizeRange="0.01"
    speed="3"
    spreading="0.1"
    class="dots-orbit-example"
  />
</template>

<style scoped>
.dots-orbit-example {
  position: fixed;
  width: 100%;
  height: 100%;
}
</style>
