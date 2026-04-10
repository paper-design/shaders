# @paper-design/shaders-vue

## Usage

```vue
<script setup lang="ts">
import { MeshGradient, DotOrbit } from '@paper-design/shaders-vue';
</script>

<template>
  <MeshGradient
    :colors="['#5100ff', '#00ff80', '#ffcc00', '#ea00ff']"
    :distortion="1"
    :swirl="0.8"
    :speed="0.2"
    :style="{ width: '200px', height: '200px' }"
  />

  <DotOrbit
    :colors="['#d2822d', '#0c3b7e', '#b31a57', '#37a066']"
    color-back="#000000"
    :scale="0.3"
    :style="{ width: '200px', height: '200px' }"
  />
</template>
```

For Vue templates, bind booleans, numbers, arrays, and objects with `:prop="..."`.

## Nuxt

```vue
<script setup lang="ts">
import { MeshGradient } from '@paper-design/shaders-vue';
</script>

<template>
  <MeshGradient class="hero-shader" :speed="0.6" />
</template>
```

The components are SSR-safe and mount WebGL on the client after hydration.

## Release notes

[View changelog →](https://github.com/paper-design/shaders/blob/main/CHANGELOG.md)
