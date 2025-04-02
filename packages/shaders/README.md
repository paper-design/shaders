# @paper-design/shaders

This is the vanilla JS of Paper Shaders. You can also find framework specific wrappers.

## Example usage:

```
import { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } from "@paper-design/shaders";

const myDiv = document.createElement('div');
document.body.appendChild(myCanvas);
myDiv.style.width = '600px';
myDiv.style.height = '400px';

const shaderParams = {
  u_color1: getShaderColorFromString("#283BFC"),
  u_color2: getShaderColorFromString("#FF2828"),
  u_color3: getShaderColorFromString("#dddddd"),
  u_color4: getShaderColorFromString("#800080")
};

const speed = 0.25;
const meshGradient = new ShaderMount(myDiv, meshGradientFragmentShader, shaderParams, undefined, speed);
```
