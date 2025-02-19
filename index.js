/*  index.js
    This file is the entry point for all other code. Also handles user input.
*/

var canvas = document.getElementById('c');

var gl = canvas.getContext("webgl");
if (!gl) {
  alert('WebGL is not supported!');
  throw new Error("WebGL is not supported!");
}

import { initialize, loadXml, render, saveXml, addMovement, addZoom, addStatusUpdate, startAddLine, drawLine, startAddSquare, startAddPolygon, drawPolygon, resetOffsetAndZoom, refreshStatus, clickShape, changeColor, drawSquare, resizePolygon, sizingSquare, resizeLine } from "./js/main.js"

// initialize WebGL on canvas
initialize(gl);

// get help pad
var helpPad = document.getElementById('help-pad');

// connect file selector to load and render
var fs = document.getElementById("f");
fs.addEventListener('click', (e) => {
  helpPad.classList.add('hidden');
})
fs.addEventListener('change', (event) => {
  fs.files[0].text().then((text) => {
    loadXml(text);
    render();
  })
})

// connect save link to save funciton
var save = document.getElementById('s');
save.addEventListener('click', (e) =>{
  // e.preventDefault();
  helpPad.classList.add('hidden');
  saveXml();
})

// connect add shape buttons
var addl = document.getElementById('add-line');
addl.addEventListener('click', (e) => {
  helpPad.classList.add('hidden');
  startAddLine();
});
var adds = document.getElementById('add-square');
adds.addEventListener('click', (e) => {
  helpPad.classList.add('hidden');
  startAddSquare()
});
var addp = document.getElementById('add-polygon');
var pc = document.getElementById("polygon-points");
addp.addEventListener('click', (e) => {
  helpPad.classList.add('hidden');
  startAddPolygon(pc.value)
});

// fix polygon point count click and input
pc.onclick = (e) => {e.stopPropagation};
pc.onchange = (e) => {
  if (e.target.value < 3) {
    e.target.value = 3;
  } else if (e.target.value > 10) {
    e.target.value = 10;
  }
}

// add zoom and movement support
addZoom(canvas);
addMovement(canvas);
var status = document.getElementById('status');
addStatusUpdate(status);
status.addEventListener('click', (e) => {
  resetOffsetAndZoom();
  refreshStatus();
  render();
});


// add line drawing support
drawLine(canvas);
resizeLine(canvas);

// add line drawing support
drawSquare(canvas);
//add resize square support
sizingSquare(canvas);

// add polygon drawing and resizing support
drawPolygon(canvas);
resizePolygon(canvas);

// add help menu toggling
var helpButton = document.getElementById('help');
helpButton.addEventListener('click', (e) => {
  helpPad.classList.toggle('hidden');
});
var closeButton = document.getElementById('close');
closeButton.addEventListener('click', (e) => {
  helpPad.classList.add('hidden');
});
var colorInput = document.getElementById('color')
canvas.addEventListener('click', (e) => {
  helpPad.classList.add('hidden');
  let status = clickShape(e);
  if(status[0]){
    colorInput.removeAttribute('disabled');
  }
  else{
    colorInput.setAttribute('disabled', 'true');
  }
  colorInput.value=status[1];
});

colorInput.addEventListener('input', (e) =>{
  changeColor(e.target.value);
});