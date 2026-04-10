import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
  type HTMLAttributes,
  type PropType,
  type VNodeProps,
} from 'vue';
import {
  ShaderMount as ShaderMountVanilla,
  emptyPixel,
  type PaperShaderElement,
  type ShaderMotionParams,
  type ShaderMountUniforms,
} from '@paper-design/shaders';
import { setMinImageSize } from './set-min-image-size.js';

export type ShaderMountInputUniformValue =
  | string
  | boolean
  | number
  | number[]
  | number[][]
  | HTMLImageElement
  | undefined;

export interface ShaderMountInputUniforms {
  [key: string]: ShaderMountInputUniformValue;
}

export interface ShaderComponentProps extends HTMLAttributes, VNodeProps {
  minPixelRatio?: number;
  maxPixelCount?: number;
  webGlContextAttributes?: WebGLContextAttributes;
  width?: string | number;
  height?: string | number;
}

export interface ShaderMountProps extends ShaderComponentProps, ShaderMotionParams {
  fragmentShader: string;
  uniforms: ShaderMountInputUniforms;
  mipmaps?: string[];
}

function normalizeDimension(value: string | number | undefined): string | number | undefined {
  if (typeof value === 'string' && Number.isNaN(Number(value)) === false) {
    return Number(value);
  }

  return value;
}

async function processUniforms(uniformsProp: ShaderMountInputUniforms): Promise<ShaderMountUniforms> {
  const processedUniforms = {} as ShaderMountUniforms;
  const imageLoadPromises: Promise<void>[] = [];

  const isValidUrl = (url: string): boolean => {
    try {
      if (url.startsWith('/')) return true;
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isExternalUrl = (url: string): boolean => {
    try {
      if (url.startsWith('/')) return false;
      const urlObject = new URL(url, window.location.origin);
      return urlObject.origin !== window.location.origin;
    } catch {
      return false;
    }
  };

  Object.entries(uniformsProp).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const url = value || emptyPixel;

      if (!isValidUrl(url)) {
        console.warn(`Uniform "${key}" has invalid URL "${url}". Skipping image loading.`);
        return;
      }

      const imagePromise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        if (isExternalUrl(url)) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          setMinImageSize(img);
          processedUniforms[key] = img;
          resolve();
        };
        img.onerror = () => {
          console.error(`Could not set uniforms. Failed to load image at ${url}`);
          reject(new Error(`Failed to load image at ${url}`));
        };
        img.src = url;
      });

      imageLoadPromises.push(imagePromise);
    } else if (value instanceof HTMLImageElement) {
      setMinImageSize(value);
      processedUniforms[key] = value;
    } else if (value !== undefined) {
      processedUniforms[key] = value;
    }
  });

  await Promise.all(imageLoadPromises);
  return processedUniforms;
}

export const ShaderMount = defineComponent({
  name: 'ShaderMount',
  inheritAttrs: false,
  props: {
    fragmentShader: {
      type: String,
      required: true,
    },
    uniforms: {
      type: Object as PropType<ShaderMountInputUniforms>,
      required: true,
    },
    speed: {
      type: Number,
      default: 0,
    },
    frame: {
      type: Number,
      default: 0,
    },
    mipmaps: {
      type: Array as PropType<string[]>,
      default: undefined,
    },
    minPixelRatio: {
      type: Number,
      default: undefined,
    },
    maxPixelCount: {
      type: Number,
      default: undefined,
    },
    webGlContextAttributes: {
      type: Object as PropType<WebGLContextAttributes>,
      default: undefined,
    },
    width: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    height: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
  },
  setup(props, { attrs, expose }) {
    const elementRef = shallowRef<PaperShaderElement | null>(null);
    const shaderMountRef = shallowRef<ShaderMountVanilla | null>(null);
    const hasMounted = shallowRef(false);
    const initialContextAttributes = props.webGlContextAttributes;
    let initRequestId = 0;
    let uniformRequestId = 0;

    const initializeShader = async (): Promise<void> => {
      if (!hasMounted.value || elementRef.value === null) return;

      const requestId = ++initRequestId;
      const uniforms = await processUniforms(props.uniforms);

      if (requestId !== initRequestId || elementRef.value === null) {
        return;
      }

      shaderMountRef.value?.dispose();
      shaderMountRef.value = new ShaderMountVanilla(
        elementRef.value,
        props.fragmentShader,
        uniforms,
        initialContextAttributes,
        props.speed,
        props.frame,
        props.minPixelRatio,
        props.maxPixelCount,
        props.mipmaps ?? []
      );
    };

    const updateUniforms = async (): Promise<void> => {
      if (!hasMounted.value || shaderMountRef.value === null) return;

      const requestId = ++uniformRequestId;
      const uniforms = await processUniforms(props.uniforms);

      if (requestId !== uniformRequestId) {
        return;
      }

      shaderMountRef.value?.setUniforms(uniforms);
    };

    onMounted(() => {
      hasMounted.value = true;
      void initializeShader();
    });

    onBeforeUnmount(() => {
      hasMounted.value = false;
      initRequestId += 1;
      uniformRequestId += 1;
      shaderMountRef.value?.dispose();
      shaderMountRef.value = null;
    });

    watch(
      () => props.fragmentShader,
      () => {
        if (hasMounted.value) {
          void initializeShader();
        }
      }
    );

    watch(
      () => props.mipmaps,
      () => {
        if (hasMounted.value) {
          void initializeShader();
        }
      },
      { deep: true }
    );

    watch(
      () => props.uniforms,
      () => {
        if (hasMounted.value) {
          void updateUniforms();
        }
      },
      { deep: true }
    );

    watch(
      () => props.speed,
      (speed) => {
        shaderMountRef.value?.setSpeed(speed);
      }
    );

    watch(
      () => props.frame,
      (frame) => {
        shaderMountRef.value?.setFrame(frame);
      }
    );

    watch(
      () => props.maxPixelCount,
      (maxPixelCount) => {
        shaderMountRef.value?.setMaxPixelCount(maxPixelCount);
      }
    );

    watch(
      () => props.minPixelRatio,
      (minPixelRatio) => {
        shaderMountRef.value?.setMinPixelRatio(minPixelRatio);
      }
    );

    const mergedStyle = computed(() => {
      if (props.width === undefined && props.height === undefined) {
        return attrs.style;
      }

      return [
        {
          width: normalizeDimension(props.width),
          height: normalizeDimension(props.height),
        },
        attrs.style,
      ];
    });

    expose({
      el: elementRef,
      shaderMount: shaderMountRef,
    });

    return () =>
      h('div', {
        ...attrs,
        ref: elementRef,
        style: mergedStyle.value,
      });
  },
});
