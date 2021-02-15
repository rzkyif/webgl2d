/*  index.js
    This file is the entry point for all other code. Also handles user input.
*/

var canvas = document.getElementById('c');

var gl = canvas.getContext("webgl");
if (!gl) {
  alert('WebGL is not supported!');
  throw new Error("WebGL is not supported!");
}

import { initialize, loadXml, render } from "./js/main.js"

// initialize WebGL on canvas
initialize(gl);

// connect file selector to load and render
var fs = document.getElementById("f");
fs.addEventListener('change', (event) => {
  fs.files[0].text().then((text) => {
    loadXml(text);
    render();
  })
})
