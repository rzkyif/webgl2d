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

console.log("in\n");
window.onload = function () {
  console.log("onload\n");
  window.ondrag = function (e) {
    var evt = window.event || e;
    var point = [evt.clientX, evt.clientY];
    console.log("ondrag\n");
    shapes.forEach(element => {
      if (element instanceof Line) {
        if (element.isInRangeA(point)) {
          element.setA(point[0],point[1]);
        } else if (element.isInRangeB(point)) {
          element.setB(point[0],point[1]);
        }
      } else if (element instanceof Polygon) {
        element.getPoints().forEach(polygon_point => {
          if (element.isInRange(polygon_point)){
            element.changePolygonPoint(element.getPoints().indexOf(polygon_point),point);
          }
        })
      }
    });
    render();
  }
}
