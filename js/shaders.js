/*  shaders.js
    This file only stores the GLSL shaders for WebGL.
*/

export let VERTEX_SHADER = `
attribute vec2 a_position;
uniform vec2 u_resolution;

void main() {
  vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`

export let FRAGMENT_SHADER = `
precision mediump float;
uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
`