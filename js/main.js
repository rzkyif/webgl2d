/*  main.js
    This file contains the main WebGL functions of the application.
*/

import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders.js'
import { Line, Square, Polygon, Point } from './shapes.js'
import { resizeCanvasToDisplaySize, createProgramFromShader, hexToRGB, isInside, POINT_SIZE, POINT_COLOR, DEFAULT_COLOR } from './utils.js'

let gl, positionBuffer
let positionAttributeLocation, resolutionUniformLocation, colorUniformLocation, offsetUniformLocation, scaleUniformLocation, pointUniformLocation, pointSizeUniformLocation
let xmlDocument, shapes, selectedShape, offset, zoomLevel, isMoving, lastX, lastY, isDrawing, currentShape, currentPoint, pointCount, statusElement

// function for initializing WebGL
export function initialize(gl_) {
  gl = gl_;

  // set default zoom and offset
  offset = [20.0, 20.0];
  zoomLevel = 1.0;

  // insert initial empty data
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  shapes = [];

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

  // draw current shape
  if (currentShape) {
    let data = currentShape.toVectors();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    // draw shape
    let rgb = hexToRGB(currentShape.color);
    gl.uniform4f(colorUniformLocation, rgb[0], rgb[1], rgb[2], 1);
    gl.uniform1f(pointUniformLocation, 0);
    gl.drawArrays(currentShape.drawMode, 0, currentShape.drawCount);
    // draw corner points
    gl.uniform4f(colorUniformLocation, point_color[0], point_color[1], point_color[2], 1);
    gl.uniform1f(pointUniformLocation, 1);
    gl.drawArrays(gl.POINTS, 0, currentShape.drawCount);
  }

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

// function to refresh offset and zoom to status element
export function refreshStatus() {
  statusElement.innerHTML = Math.round(offset[0]) + ', ' + Math.round(offset[1]) + ' | ' + Math.round(zoomLevel*100) + '%';
}

// function to reset offset and zoom
export function resetOffsetAndZoom() {
  offset = [20.0, 20.0];
  zoomLevel = 1.0;
}

// function to load data from XML string
export function loadXml(xmlText) {
  xmlDocument = (new DOMParser()).parseFromString(xmlText, "text/xml");
  shapes = []
  console.log("Loading from XML...");
  resetOffsetAndZoom();
  refreshStatus();

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

  document.getElementById('s').href = url;
}

// function to add zoom support
export function addZoom(canvas) {
  canvas.addEventListener("wheel", (e) => {
    let shift = e.deltaY * -0.001;
    if (zoomLevel + shift >= 0.5 && zoomLevel + shift <= 2.1) {
      let oldZoomLevel = zoomLevel;
      zoomLevel += shift;
      offset[0] += (e.offsetX - (e.offsetX / oldZoomLevel * zoomLevel)) / zoomLevel;
      offset[1] += (e.offsetY - (e.offsetY / oldZoomLevel * zoomLevel)) / zoomLevel;
      render();
      refreshStatus();
    }
  });
}

// function to add movement support
export function addMovement(canvas) {
  lastX = null;
  lastY = null;
  canvas.addEventListener("mousedown", (e) => {
    for (let i = 0; i < shapes.length; i++) {
      if (isInside(e.offsetX, e.offsetY, shapes[i], offset, zoomLevel)) {
        return;
      }
    }
    isMoving = true;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (isMoving) {
      if (lastX === null) {
        lastX = e.offsetX;
        lastY = e.offsetY;
      } else {
        offset = [offset[0] + (e.offsetX - lastX) / zoomLevel, offset[1] + (e.offsetY - lastY) / zoomLevel];
        lastX = e.offsetX;
        lastY = e.offsetY;
        render();
        refreshStatus();
      }
    }
  });
  canvas.addEventListener("mouseup", (e) => {
    isMoving = false;
    lastX = null;
    lastY = null;
  });
}

// add status update functionality on status element
export function addStatusUpdate(status) {
  statusElement = status;
}

// functions to start adding shapes
export function startAddLine() {

}
export function startAddSquare() {
  
}
export function startAddPolygon(point) {
  currentPoint = new Point(0, 0);
  currentShape = new Polygon([currentPoint], DEFAULT_COLOR);
  pointCount = point;
  isDrawing = "polygon";
}

// function to add polygon drawing support
export function drawPolygon(canvas) {
  canvas.addEventListener('click', (e) => {
    if (isDrawing == 'polygon') {
      console.log(e.which);
      if (e.which == 1) {
        pointCount--;
        if (pointCount > 0) {
          let realMouseX = (e.offsetX / zoomLevel) - offset[0];
          let realMouseY = (e.offsetY / zoomLevel) - offset[1];
          currentPoint = new Point(realMouseX, realMouseY);
          currentShape.points.push(currentPoint);
        } else {
          shapes.push(currentShape);
          currentShape = null;
          currentPoint = null;
          isDrawing = false;
        }
      }
    }
  });
  canvas.addEventListener('mousemove', (e) => {
    if (isDrawing == 'polygon') {
      let realMouseX = (e.offsetX / zoomLevel) - offset[0];
      let realMouseY = (e.offsetY / zoomLevel) - offset[1];
      currentPoint.x = realMouseX;
      currentPoint.y = realMouseY;
      render();
    }
  });
}

export function clickShape(e){
  let realMouseX = (e.offsetX / zoomLevel) - offset[0];
  let realMouseY = (e.offsetY / zoomLevel) - offset[1];
  selectedShape = isInShapes(realMouseX, realMouseY);
  console.log(selectedShape)
  if(selectedShape){
    return true
  }
  return false
}

export function changeColor(color){
  selectedShape.color = color;
  render();
}

function isInShapes(x, y){
  for(let i = 0; i < shapes.length; i++){
    if(shapes[i] instanceof Line){
      // let m = (shapes[i].ay - shapes[i].by)/(shapes[i].ax - shapes[i].bx);
      // let n = (y - shapes[i].by)/(x - shapes[i].bx);
      // console.log(m);
      // console.log(n);
      // if(m === n ){
      //   return shapes[i];
      // }
      let a = Math.pow( Math.pow(shapes[i].ax - x,2) + Math.pow(shapes[i].ay - y,2),0.5);
      let b = Math.pow( Math.pow(shapes[i].bx - x,2) + Math.pow(shapes[i].by - y,2),0.5);
      let c = Math.pow( Math.pow(shapes[i].ax - shapes[i].bx,2) + Math.pow(shapes[i].ay - shapes[i].by,2),0.5);

      let distance;

      if(Math.pow(b,2) > Math.pow(a,2) + Math.pow(c,2)){
        distance = a;
      }
      else if(Math.pow(a,2) > Math.pow(b,2) + Math.pow(c,2)){
        distance = b;
      }
      else{
        let s = (a+b+c)/2;
        distance = (2/c) * Math.pow(s*(s-a)*(s-b)*(s-c) ,0.5);
      }
      console.log(distance);
      if(distance < 5){
        return shapes[i];
      }
    }
    else if(shapes[i] instanceof Square){
      if ((x >= shapes[i].x) && (y >= shapes[i].y) && (x <= (shapes[i].x + shapes[i].size)) && (y <= (shapes[i].y + shapes[i].size))){
        return shapes[i];
      }
    }
    else if(shapes[i] instanceof Polygon){
      return null;
    }
  }
  return null;
}