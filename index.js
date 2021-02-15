/*  index.js
    This file is the entry point for all other code. Also handles user input.
*/

var canvas = document.getElementById('c');

var gl = canvas.getContext("webgl");
if (!gl) {
  alert('WebGL is not supported!');
  throw new Error("WebGL is not supported!");
}

import { initialize, loadXml, render, saveXml, addMovement, addZoom, addLine, addSquare, addPolygon } from "./js/main.js"

// initialize WebGL on canvas
initialize(gl);

// connect file selector to load and render
var fs = document.getElementById("f");
fs.addEventListener('change', (event) => {
  fs.files[0].text().then((text) => {
    console.log(text);
    loadXml(text);
    render();
  })
})

// connect save link to save funciton
var save = document.getElementById('s');
save.addEventListener('click', (e) =>{
  // e.preventDefault();
  saveXml();
})

// connect add shape buttons
var addl = document.getElementById('add-line');
addl.addEventListener('click', (e) => {addLine()});
var adds = document.getElementById('add-square');
adds.addEventListener('click', (e) => {addSquare()});
var addp = document.getElementById('add-polygon');
var pc = document.getElementById("polygon-points");
addp.addEventListener('click', (e) => {addPolygon(pc.value)});

// fix polygon number click and input
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