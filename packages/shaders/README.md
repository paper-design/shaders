# @paper-design/shaders

This is the vanilla JS of Paper Shaders. You can also find framework specific wrappers.

## Example usage:

```
import { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } from "@paper-design/shaders";

const myCanvas = document.createElement("canvas");
myCanvas.width = 300;
myCanvas.height = 300;
document.body.appendChild(myCanvas);

const shaderParams = {
  u_color1: getShaderColorFromString("#283BFC"),
  u_color2: getShaderColorFromString("#FF2828"),
  u_color3: getShaderColorFromString("#dddddd"),
  u_color4: getShaderColorFromString("#800080")
};

const meshGradient = new ShaderMount(
  myCanvas,
  meshGradientFragmentShader,
  shaderParams
);
```
