/*  main.js
    This file contains the main WebGL functions of the application.
*/

import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders.js'
import { Line, Square, Polygon, Point } from './shapes.js'
import { resizeCanvasToDisplaySize, createProgramFromShader, hexToRGB, isInside, POINT_SIZE, POINT_COLOR, DEFAULT_COLOR, resizeSquare, isInsidePoint } from './utils.js'

let gl, positionBuffer
let positionAttributeLocation, resolutionUniformLocation, colorUniformLocation, offsetUniformLocation, scaleUniformLocation, pointUniformLocation, pointSizeUniformLocation
let xmlDocument, shapes, selectedShape, offset, zoomLevel, isMoving, lastX, lastY, isDrawing, currentShape, currentPoint, pointCount, statusElement, anchorX, anchorY
let polygonCurrentIndex, polygonCurrentPointIndex, isResizing

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
  currentPoint = new Point(0,0);
  isDrawing = "line";
  console.log("start draw line");

}

export function drawLine(canvas){
  canvas.addEventListener('click', (e) => {
  let realMouseX1;
  let realMouseY1;
  let realMouseX2;
  let realMouseY2;
    if (isDrawing == 'line') {
      console.log(e.which);
      if (e.which == 1) {
        var vector=[];
        isDrawing = false;
        realMouseX1 = (e.offsetX / zoomLevel) - offset[0];
        realMouseY1 = (e.offsetY / zoomLevel) - offset[1];
        console.log("draw point1");
        vector.push(realMouseX1);
        vector.push(realMouseY1);
        canvas.addEventListener('click', (e) => {
          if (e.which == 1) {
            realMouseX2 = (e.offsetX / zoomLevel) - offset[0];
            realMouseY2 = (e.offsetY / zoomLevel) - offset[1];
            console.log("draw point2");
            vector.push(realMouseX2);
            vector.push(realMouseY2);
            console.log(vector);
            shapes.push(new Line(vector[0],vector[1],vector[2],vector[3], DEFAULT_COLOR))
            render();
          }
        });
      }
    }
  });
  canvas.addEventListener('mousemove', (e) => {
    if (isDrawing == 'line') {
      let realMouseX = (e.offsetX / zoomLevel) - offset[0];
      let realMouseY = (e.offsetY / zoomLevel) - offset[1];
      currentPoint.x = realMouseX;
      currentPoint.y = realMouseY;
    }
  });
}

export function startAddSquare() {
  currentShape = new Square(0,0,0,DEFAULT_COLOR);
  pointCount = 2;
  isDrawing = 'square';
}

export function drawSquare(canvas){
  canvas.addEventListener('click', (e) =>{
    if(isDrawing === 'square'){
      if(e.which === 1){
        pointCount--;
        if(pointCount > 0){
          let realMouseX = (e.offsetX / zoomLevel) - offset[0];
          let realMouseY = (e.offsetY / zoomLevel) - offset[1];
          anchorX = realMouseX;
          anchorY = realMouseY;
          currentShape.x = anchorX;
          currentShape.y = anchorY;
        }
        else{
          shapes.push(currentShape);
          anchorX = null;
          anchorY = null;
          isDrawing = false;
        }
      }
    }
  });
  canvas.addEventListener('mousemove', (e) =>{
    if(isDrawing === 'square'){
      let realMouseX = (e.offsetX / zoomLevel) - offset[0];
      let realMouseY = (e.offsetY / zoomLevel) - offset[1];
      
      if(pointCount === 2){
        currentShape.x = realMouseX;
        currentShape.y = realMouseY;
        render();
      }
      else if(pointCount === 1){
        let newAtt = resizeSquare(currentShape, realMouseX, realMouseY, anchorX, anchorY);
        currentShape.x = newAtt[0];
        currentShape.y = newAtt[1];
        currentShape.size = newAtt[2];
        render();
      }
    }
  });
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

// function to add polygon resize support
export function resizePolygon(canvas) {
  polygonCurrentIndex = null;
  polygonCurrentPointIndex = null;
  canvas.addEventListener("mousedown", (e) => {
    if (!isDrawing) {
      for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].constructor.name != "Polygon") {
          continue;
        }
        polygonCurrentPointIndex = isInsidePoint(e.offsetX, e.offsetY, shapes[i], offset, zoomLevel);
        if (polygonCurrentPointIndex >= 0) {
          polygonCurrentIndex = i;
          isResizing = "polygon";
        }
      }
    }
  });
  canvas.addEventListener("mousemove", (e) => {
    if (isResizing == "polygon") {
      let realMouseX = (e.offsetX / zoomLevel) - offset[0];
      let realMouseY = (e.offsetY / zoomLevel) - offset[1];
      shapes[polygonCurrentIndex].points[polygonCurrentPointIndex].x = realMouseX;
      shapes[polygonCurrentIndex].points[polygonCurrentPointIndex].y = realMouseY;
      render()
    }
  });
  canvas.addEventListener("mouseup", (e) => {
    if (isResizing == "polygon") {
      isResizing = null;
    }
  });
}

export function clickShape(e){
  selectedShape = isInShapes(e);
  if(selectedShape){
    return [true, selectedShape.color];
  }
  return [false, DEFAULT_COLOR];
}

export function changeColor(color){
  selectedShape.color = color;
  render();
}

function isInShapes(e){
  for(let i = 0; i < shapes.length; i++){
    if (isInside(e.offsetX, e.offsetY, shapes[i], offset, zoomLevel)){
      return shapes[i];
    }
  }
  return null;
}