import type { vec4 } from '../types.js'; 
import type { ShaderMotionParams } from '../shader-mount.js'; 
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js'; 
import { declarePI } from '../shader-utils.js'; 

export const spiralTunnelMeta = { 
  maxcolorCount: 4, 
} as const; 

/** 
 * A spiral tunnel of animated ribbons, with configurable FOV, 
 * ribbon count/width, spiral density, distortion, and HSV hue/saturation. 
 * 
 * Fragment shader uniforms: 
 * - u_time (float): Animation time
 * - uResolution (vec2): Canvas resolution in pixels 
 * - uFieldOfView (float): Camera FOV in degrees 
 * - uLuminosity (float): Controls bloom/stretch radius 
 * - uOpeningSize (float): Size of central opening 
 * - uRibbonCount (float): Number of ribbons 
 * - uRibbonWidth (float): Ribbon width in pattern space 
 * - uSpiralDensity (float): Spiral tightness / repeat density 
 * - uSpiralCount (float): Number of spiral arms 
 * - uLightIntensity (float): Overall light multiplier 
 * - uDistortion (float): Phase distortion of ribbons 
 * - ucolors (vec4[4]): Up to 4 line colors in RGBA 
 * - uHue (float): Hue shift in degrees 
 * - uSaturation (float): Saturation multiplier 
 */
/**
BSD 3-Clause License

Copyright (c) 2025, noegarsoux

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/**
MIT License

Copyright (c) 2025 Latent Cat

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
Copyright (c) 2026 by Sabo Sugi (https://codepen.io/sabosugi/pen/azpqWKE)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
/**
Paper Shaders
Copyright 2026 Paper

Powered by Paper Shaders:
https://shaders.paper.design
*/
/**
MIT License

Copyright (c) 2026 Maxim Bortnikov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
export const spiralTunnelFragmentShader: string = `#version 300 es 
precision highp float; 

uniform vec2 uResolution; 
uniform float u_time;
uniform float uFieldOfView; 
uniform float uLuminosity; 
uniform float uOpeningSize; 
uniform float uRibbonCount; 
uniform float uRibbonWidth; 
uniform float uSpiralDensity; 
uniform float uSpiralCount; 
uniform float uLightIntensity; 
uniform float uDistortion; 
uniform vec4 ucolors[${spiralTunnelMeta.maxcolorCount}]; 
uniform float uHue; 
uniform float uSaturation; 

in vec2 v_objectUV; 
out vec4 fragColor; 

${declarePI} 

vec3 rgb2hsv(vec3 c) { 
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0); 
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); 
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); 
  float d = q.x - min(q.w, q.y); 
  float e = 1.0e-10; 
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x); 
} 

vec3 hsv2rgb(vec3 c) { 
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); 
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); 
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); 
} 

void main() { 
  // Wrap time safely within a period of 100 * TWO_PI to maintain perfect highp floating point precision
  float maxPeriod = TWO_PI * 100.0; 
  float t = mod(u_time, maxPeriod); 

  float fovFactor = tan(radians(uFieldOfView * 0.5)); 
  vec2 uv = v_objectUV * fovFactor; 
  
  float r = length(uv); 
  
  // Animate the rotation cleanly using the wrapped time variable
  float angle = atan(uv.y, uv.x) - t * 0.05; 
  
  float openingMask = smoothstep(uOpeningSize * 0.002, uOpeningSize * 0.005, r); 
  if (openingMask <= 0.0) { 
    fragColor = vec4(0.0, 0.0, 0.0, 1.0); 
    return; 
  } 
  
  // Wrap the temporal factor of depth separately so it never compounds into massive values
  float timeDepthOffset = mod(t * 0.1, maxPeriod); 
  float depth = 1.0 / max(r, 0.001) + timeDepthOffset; 
  vec3 outColor = vec3(0.0); 
  float ribbons = uRibbonCount; 
  
  for (int i = 0; i < ${spiralTunnelMeta.maxcolorCount}; i++) { 
    if (float(i) >= uSpiralCount) break; 
    
    float offset = float(i) * (TWO_PI / max(uSpiralCount, 1.0)); 
    float stripPattern = sin(angle * ribbons + depth * uSpiralDensity + offset) * cos(depth * uDistortion + float(i)); 
    float edgeWidth = uRibbonWidth * 2.0; 
    vec3 segmentColor = ucolors[i].rgb * smoothstep(0.5 - edgeWidth, 0.5 + edgeWidth, stripPattern); 
    outColor += segmentColor; 
  } 
  
  float denom = r * (19.0 - uLuminosity) * 0.1; 
  denom = max(denom, 0.001); 
  outColor *= uLightIntensity * (1.0 / denom) * openingMask; 
  
  float brightness = dot(outColor, vec3(0.2126, 0.7152, 0.0722)); 
  if (brightness > 0.3) { 
    outColor += outColor * 0.345; 
  } 
  
  vec3 hsv = rgb2hsv(outColor); 
  hsv.x += uHue / 360.0; 
  hsv.y *= uSaturation; 
  outColor = hsv2rgb(hsv); 
  
  fragColor = vec4(outColor, 1.0); 
} 
`; 

export interface SpiralTunnelUniforms extends ShaderSizingUniforms { 
  uResolution: [number, number];  
  uFieldOfView: number; 
  uLuminosity: number; 
  uOpeningSize: number; 
  uRibbonCount: number; 
  uRibbonWidth: number; 
  uSpiralDensity: number; 
  uSpiralCount: number; 
  uLightIntensity: number; 
  uDistortion: number; 
  ucolors: vec4[]; 
  uHue: number; 
  uSaturation: number; 
} 

export interface SpiralTunnelParams extends ShaderSizingParams, ShaderMotionParams { 
  fieldOfView?: number; 
  luminosity?: number; 
  openingSize?: number; 
  ribbonCount?: number; 
  ribbonWidth?: number; 
  spiralDensity?: number; 
  spiralCount?: number; 
  lightIntensity?: number; 
  distortion?: number; 
  hue?: number; 
  saturation?: number; 
  color1?: string; 
  color2?: string; 
  color3?: string; 
  color4?: string; 
}