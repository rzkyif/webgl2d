/*  main.js
    This file contains the main WebGL functions of the application.
*/

import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders.js'
import { Line, Square, Polygon } from './shapes.js'
import { resizeCanvasToDisplaySize, createProgramFromShader, hexToRGB } from './utils.js'

let positionAttributeLocation, resolutionUniformLocation, colorUniformLocation, positionBuffer, gl, xmlDocument, shapes

// function for initializing WebGL
export function initialize(gl_) {
  gl = gl_

  // insert initial empty data
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // load shaders
  var program = createProgramFromShader(gl, VERTEX_SHADER, FRAGMENT_SHADER);
  gl.useProgram(program);

  // find and prepare attribute and uniform
  positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
  resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  colorUniformLocation = gl.getUniformLocation(program, "u_color");
}

// function to load data from XML string
export function loadXml(xmlText) {
  xmlDocument = (new DOMParser()).parseFromString(xmlText, "text/xml");
  shapes = []
  console.log("Loading from XML...");

  let xmlLines = xmlDocument.getElementsByTagName("line");
  for (let i = 0; i < xmlLines.length; i++) {
    shapes.push(Line.fromXML(xmlLines[i]));
  }

  let xmlSquares = xmlDocument.getElementsByTagName("square");
  for (let i = 0; i < xmlSquares.length; i++) {
    shapes.push(Square.fromXML(xmlSquares[i]));
  }

  let xmlPolygons = xmlDocument.getElementsByTagName("polygon");
  for (let i = 0; i < xmlPolygons.length; i++) {
    shapes.push(Polygon.fromXML(xmlPolygons[i]));
  }
}

export function getShapes(){
  return shapes;
}

// function to render shapes loaded by the loadXml function
export function render() {
  // prepare canvas 
  resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // draw each shapes
  for (let i = 0; i < shapes.length; i++) {
    let data = shapes[i].toVectors();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    let rgb = hexToRGB(shapes[i].color);
    gl.uniform4f(colorUniformLocation, rgb[0], rgb[1], rgb[2], 1);
    gl.drawArrays(shapes[i].drawMode, 0, shapes[i].drawCount);
    console.log("Drew one " + shapes[i].constructor.name + "!")
  }
}