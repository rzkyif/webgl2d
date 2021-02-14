/*  main.js
    This file contains the main WebGL functions of the application.
*/

import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders.js'
import { Line, Square, Polygon } from './shapes.js'
import { resizeCanvasToDisplaySize, createProgramFromShader, hexToRGB, isInside, POINT_SIZE, POINT_COLOR } from './utils.js'

let gl, positionBuffer
let positionAttributeLocation, resolutionUniformLocation, colorUniformLocation, offsetUniformLocation, scaleUniformLocation, pointUniformLocation, pointSizeUniformLocation
let xmlDocument, shapes, offset, zoomLevel, isMoving, lastX, lastY

// function for initializing WebGL
export function initialize(gl_) {
  gl = gl_;

  // set default zoom and offset
  offset = [0.0, 0.0];
  zoomLevel = 1.0;

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
  offsetUniformLocation = gl.getUniformLocation(program, "u_offset");
  scaleUniformLocation = gl.getUniformLocation(program, "u_scale");
  pointUniformLocation = gl.getUniformLocation(program, "u_point");
  pointSizeUniformLocation = gl.getUniformLocation(program, "u_point_size");
}

// function to render shapes loaded by the loadXml function
export function render() {
  // prepare canvas 
  resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(offsetUniformLocation, offset[0], offset[1]);
  gl.uniform1f(scaleUniformLocation, zoomLevel);
  gl.uniform1f(pointSizeUniformLocation, POINT_SIZE);
  let point_color = hexToRGB(POINT_COLOR);

  // draw each shapes
  for (let i = 0; i < shapes.length; i++) {
    let data = shapes[i].toVectors();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    // draw shape
    let rgb = hexToRGB(shapes[i].color);
    gl.uniform4f(colorUniformLocation, rgb[0], rgb[1], rgb[2], 1);
    gl.uniform1f(pointUniformLocation, 0);
    gl.drawArrays(shapes[i].drawMode, 0, shapes[i].drawCount);
    // draw corner points
    gl.uniform4f(colorUniformLocation, point_color[0], point_color[1], point_color[2], 1);
    gl.uniform1f(pointUniformLocation, 1);
    gl.drawArrays(gl.POINTS, 0, shapes[i].drawCount);
  }
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

// function to save to XML file
export function saveXml(){
  var doc = document.implementation.createDocument('','', null);
  if(!shapes){
    shapes = [];
  }
  console.log("Saving to XML...");
  var shapesDocument = doc.createElement('shapes');

  for(let i = 0; i < shapes.length; i++){
    shapesDocument.appendChild(shapes[i].toXML());
  }
  doc.appendChild(shapesDocument);

  var data = new Blob([(new XMLSerializer()).serializeToString(doc)], {type: 'text/xml'});
  var url = URL.createObjectURL(data);

  document.getElementById('save').href = url;
}

// function to add zoom support
export function addZoom(canvasElement) {
  canvasElement.addEventListener("wheel", (e) => {
    let shift = e.deltaY * -0.001;
    let oldZoomLevel = zoomLevel;
    zoomLevel += shift;
    offset[0] += (e.offsetX - (e.offsetX / oldZoomLevel * zoomLevel)) / zoomLevel;
    offset[1] += (e.offsetY - (e.offsetY / oldZoomLevel * zoomLevel)) / zoomLevel;
    render();
  });
}

// function to add movement support
export function addMovement(canvasElement) {
  lastX = null;
  lastY = null;
  canvasElement.addEventListener("mousedown", (e) => {
    for (let i = 0; i < shapes.length; i++) {
      if (isInside(e.offsetX, e.offsetY, shapes[i], offset, zoomLevel)) {
        return;
      }
    }
    isMoving = true;
  });
  canvasElement.addEventListener("mousemove", (e) => {
    if (isMoving) {
      if (lastX === null) {
        lastX = e.offsetX;
        lastY = e.offsetY;
      } else {
        offset = [offset[0] + (e.offsetX - lastX) / zoomLevel, offset[1] + (e.offsetY - lastY) / zoomLevel];
        lastX = e.offsetX;
        lastY = e.offsetY;
        render();
      }
    }
  });
  canvasElement.addEventListener("mouseup", (e) => {
    isMoving = false;
    lastX = null;
    lastY = null;
  });
}