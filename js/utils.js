/*  utils.js
    This file contains code that are used in other parts of the application.
*/

export const POINT_SIZE = 10;
export const POINT_COLOR = "#FFFFFF";
export const DEFAULT_COLOR = "#555555";

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
    return [((c>>16)&255)/255, ((c>>8)&255)/255, (c&255)/255];
  }
  throw new Error('Invalid hex code!');
}

// function to check if coordinate is in a shape
export function isInside(x_, y_, shape, offset, zoomLevel) {
  if (isInsidePoint(x_, y_, shape, offset, zoomLevel)) {
    return true;
  }
  let x = (x_ / zoomLevel) - offset[0];
  let y = (y_ / zoomLevel) - offset[1];
  if (shape.constructor.name == "Square") {
    return (x >= shape.x && x <= shape.x + shape.size) && (y >= shape.y && y <= shape.y + shape.size);
  } else if (shape.constructor.name == "Polygon") {
    let initial = true;
    let sign = null;
    for (let i = 0; i < shape.points.length; i++) {
      let p1 = shape.points[i];
      let p2 = (i == shape.points.length - 1) ? shape.points[0] : shape.points[i+1];
      let cSign = Math.sign((y - p1.y) * (p2.x - p1.x) - (x - p1.x) * (p2.y - p1.y))
      if (initial) {
        sign = cSign;
        initial = false;
      } else {
        if (sign != cSign) {
          return false;
        }
      }
      if (cSign == 0) {
        return true;
      }
    }
    return true;
  } else if(shape.constructor.name == "Line"){
    let a = Math.pow( Math.pow(shape.ax - x,2) + Math.pow(shape.ay - y,2),0.5);
    let b = Math.pow( Math.pow(shape.bx - x,2) + Math.pow(shape.by - y,2),0.5);
    let c = Math.pow( Math.pow(shape.ax - shape.bx,2) + Math.pow(shape.ay - shape.by,2),0.5);

    let dist;

    if(Math.pow(b,2) > Math.pow(a,2) + Math.pow(c,2)){
      dist = a;
    }
    else if(Math.pow(a,2) > Math.pow(b,2) + Math.pow(c,2)){
      dist = b;
    }
    else{
      let s = (a+b+c)/2;
      dist = (2/c) * Math.pow(s*(s-a)*(s-b)*(s-c) ,0.5);
    }
    console.log(dist);
    if(dist < POINT_SIZE/2){
      return true;
    }
  }
  return false;
}

// function returning true if a shape's point is selected
export function isInsidePoint(x_, y_, shape, offset, zoomLevel) {
  let x = (x_ / zoomLevel) - offset[0];
  let y = (y_ / zoomLevel) - offset[1];
  if (shape.constructor.name == "Square") {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (distance(x, y, shape.x+shape.size*i, shape.y+shape.size*j) <= POINT_SIZE/2) {
          return true;
        }
      }
    }
    return false;
  } else if (shape.constructor.name == "Polygon") {
    for (let i = 0; i < shape.points.length; i++) {
      if (distance(x, y, shape.points[i].x, shape.points[i].y) <= POINT_SIZE/2) {
        return true;
      }
    }
    return false;
  } else if (shape.constructor.name == "Line") {
    if (distance(x, y, shape.ax, shape.ay) <= POINT_SIZE/2) {
      return true;
    } else if (distance(x, y, shape.bx, shape.by) <= POINT_SIZE/2) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// function returning the distance between two points
export function distance(ax, ay, bx, by) {
  return Math.hypot(bx-ax, by-ay);
}