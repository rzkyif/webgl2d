/*  utils.js
    This file contains code that are used in other parts of the application.
*/

// function to compile shader
export function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
 
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

// function to make a program with shaders
export function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

// function to make a program with shader source
export function createProgramFromShader(gl, vertexShaderSource, fragmentShaderSource) {
  return createProgram(gl, createShader(gl, gl.VERTEX_SHADER, vertexShaderSource), createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
}

// function to resize canvas
export function resizeCanvasToDisplaySize(canvas) {
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight;
  if (needResize) {
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
  return needResize;
}

// function to transform hex to rgb
export function hexToRGB(hex){
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    let c = hex.substring(1).split('');
    if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return [(c>>16)&255, (c>>8)&255, c&255];
  }
  throw new Error('Invalid hex code!');
}