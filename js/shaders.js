/*  shaders.js
    This file only stores the GLSL shaders for WebGL.
*/

export let VERTEX_SHADER = `
attribute vec2 a_position;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_scale;
uniform float u_point_size;

void main() {
  vec2 clipSpace = ((((a_position + u_offset) * u_scale) / u_resolution) * 2.0) - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  gl_PointSize = u_point_size;
}
`

export let FRAGMENT_SHADER = `
precision mediump float;
uniform vec4 u_color;
uniform bool u_point;

void main() {
  if (u_point) {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
  }
  gl_FragColor = u_color;
}
`