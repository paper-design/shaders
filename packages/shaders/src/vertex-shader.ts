/** Vertex shader for the shader mount (WGSL) — appended after the fragment shader into one module */
// language=WGSL
export const vertexShaderSource = `
fn vs_getBoxSize(boxRatio: f32, givenBoxSize: vec2f) -> vec3f {
  var box = vec2f(0.0);
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  let noFitBoxWidth = box.x;
  if (u.u_fit == 1.0) {
    box.x = boxRatio * min(u.u_resolution.x / boxRatio, u.u_resolution.y);
  } else if (u.u_fit == 2.0) {
    box.x = boxRatio * max(u.u_resolution.x / boxRatio, u.u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3f(box, noFitBoxWidth);
}

@vertex fn vs_main(@location(0) a_position: vec2f) -> VertexOutput {
  var output: VertexOutput;
  output.position = vec4f(a_position, 0.0, 1.0);

  let uv = a_position * 0.5;
  let boxOrigin = vec2f(0.5 - u.u_originX, u.u_originY - 0.5);
  var givenBoxSize = vec2f(u.u_worldWidth, u.u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2f(1.0)) * u.u_pixelRatio;
  let r = u.u_rotation * 3.14159265358979323846 / 180.0;
  let graphicRotation = mat2x2f(cos(r), sin(r), -sin(r), cos(r));
  let graphicOffset = vec2f(-u.u_offsetX, u.u_offsetY);

  // Object UV
  let fixedRatio: f32 = 1.0;
  let fixedRatioBoxGivenSize = vec2f(
    select(givenBoxSize.x, u.u_resolution.x, u.u_worldWidth == 0.0),
    select(givenBoxSize.y, u.u_resolution.y, u.u_worldHeight == 0.0)
  );

  output.v_objectBoxSize = vs_getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  let objectWorldScale = u.u_resolution.xy / output.v_objectBoxSize;

  var objectUV = uv;
  objectUV *= objectWorldScale;
  objectUV += boxOrigin * (objectWorldScale - vec2f(1.0));
  objectUV += graphicOffset;
  objectUV /= u.u_scale;
  objectUV = graphicRotation * objectUV;
  output.v_objectUV = objectUV;

  // Responsive UV
  let responsiveBoxGivenSize = vec2f(
    select(givenBoxSize.x, u.u_resolution.x, u.u_worldWidth == 0.0),
    select(givenBoxSize.y, u.u_resolution.y, u.u_worldHeight == 0.0)
  );
  output.v_responsiveBoxGivenSize = responsiveBoxGivenSize;
  let responsiveRatio = responsiveBoxGivenSize.x / responsiveBoxGivenSize.y;
  let responsiveBoxSize = vs_getBoxSize(responsiveRatio, responsiveBoxGivenSize).xy;
  let responsiveBoxScale = u.u_resolution.xy / responsiveBoxSize;

  var responsiveUV = uv;
  responsiveUV *= responsiveBoxScale;
  responsiveUV += boxOrigin * (responsiveBoxScale - vec2f(1.0));
  responsiveUV += graphicOffset;
  responsiveUV /= u.u_scale;
  responsiveUV.x *= responsiveRatio;
  responsiveUV = graphicRotation * responsiveUV;
  responsiveUV.x /= responsiveRatio;
  output.v_responsiveUV = responsiveUV;

  // Pattern UV
  let patternBoxGivenSize = vec2f(
    select(givenBoxSize.x, u.u_resolution.x, u.u_worldWidth == 0.0),
    select(givenBoxSize.y, u.u_resolution.y, u.u_worldHeight == 0.0)
  );
  let patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  let boxSizeData = vs_getBoxSize(patternBoxRatio, patternBoxGivenSize);
  output.v_patternBoxSize = boxSizeData.xy;
  let patternBoxNoFitBoxWidth = boxSizeData.z;
  let patternBoxScale = u.u_resolution.xy / output.v_patternBoxSize;

  var patternUV = uv;
  patternUV += graphicOffset / patternBoxScale;
  patternUV += boxOrigin;
  patternUV -= boxOrigin / patternBoxScale;
  patternUV *= u.u_resolution.xy;
  patternUV /= u.u_pixelRatio;
  if (u.u_fit > 0.0) {
    patternUV *= (patternBoxNoFitBoxWidth / output.v_patternBoxSize.x);
  }
  patternUV /= u.u_scale;
  patternUV = graphicRotation * patternUV;
  patternUV += boxOrigin / patternBoxScale;
  patternUV -= boxOrigin;
  patternUV *= 0.01;
  output.v_patternUV = patternUV;

  // Image UV
  var imageBoxSize: vec2f;
  if (u.u_fit == 1.0) {
    imageBoxSize.x = min(u.u_resolution.x / u.u_imageAspectRatio, u.u_resolution.y) * u.u_imageAspectRatio;
  } else if (u.u_fit == 2.0) {
    imageBoxSize.x = max(u.u_resolution.x / u.u_imageAspectRatio, u.u_resolution.y) * u.u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u.u_imageAspectRatio * u.u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u.u_imageAspectRatio;
  let imageBoxScale = u.u_resolution.xy / imageBoxSize;

  var imageUV = uv;
  imageUV *= imageBoxScale;
  imageUV += boxOrigin * (imageBoxScale - vec2f(1.0));
  imageUV += graphicOffset;
  imageUV /= u.u_scale;
  imageUV.x *= u.u_imageAspectRatio;
  imageUV = graphicRotation * imageUV;
  imageUV.x /= u.u_imageAspectRatio;

  imageUV += vec2f(0.5);
  imageUV.y = 1.0 - imageUV.y;
  output.v_imageUV = imageUV;

  return output;
}
`;
