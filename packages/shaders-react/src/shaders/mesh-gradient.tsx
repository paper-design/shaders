import { useMemo } from "react";
import { ShaderMount, type ShaderMountProps } from "../shader-mount";
import {
  getShaderColorFromString,
  meshGradientFragmentShader,
  type MeshGradientUniforms,
} from "@paper-design/shaders";

type MeshGradientProps = Omit<ShaderMountProps, "fragmentShader"> & {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  speed?: number;
};

export const MeshGradient = (props: MeshGradientProps): JSX.Element => {
  const uniforms: MeshGradientUniforms = useMemo(() => {
    return {
      u_color1: props.color1
        ? getShaderColorFromString(props.color1) ?? [0.957, 0.804, 0.623]
        : [0.957, 0.804, 0.623],
      u_color2: props.color2
        ? getShaderColorFromString(props.color2) ?? [0.192, 0.384, 0.933]
        : [0.192, 0.384, 0.933],
      u_color3: props.color3
        ? getShaderColorFromString(props.color3) ?? [0.91, 0.51, 0.8]
        : [0.91, 0.51, 0.8],
      u_color4: props.color4
        ? getShaderColorFromString(props.color4) ?? [0.35, 0.71, 0.953]
        : [0.35, 0.71, 0.953],
      u_speed: props.speed ?? 0.1,
    };
  }, [props.color1, props.color2, props.color3, props.color4, props.speed]);

  return (
    <ShaderMount
      {...props}
      fragmentShader={meshGradientFragmentShader}
      uniforms={uniforms}
    />
  );
};
