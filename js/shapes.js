/*  shapes.js
    This file defines the classes for interpreting between XML and Javascript.
*/

let DEFAULT_COLOR = "#000000";

// class to represent lines
export class Line {
  constructor(ax, ay, bx, by, color=null) {
    this.drawMode = WebGLRenderingContext.LINES;
    this.drawCount = 2;

    this.ax = ax;
    this.ay = ay;
    this.bx = bx;
    this.by = by;
    this.color = DEFAULT_COLOR;
    if (color !== null) {
      this.color = color;
    }
  }

  toVectors() {
    return [this.ax, this.ay, this.bx, this.by];
  }

  toXML(){
    var xmlDoc = document.createElement("line");
    xmlDoc.setAttribute('ax', this.ax.toString());
    xmlDoc.setAttribute('ay', this.ay.toString());
    xmlDoc.setAttribute('bx', this.bx.toString());
    xmlDoc.setAttribute('by', this.by.toString());
    xmlDoc.setAttribute('color', this.color);

    return xmlDoc;
  }

  static fromXML(xmlObject) {
    let ax = parseFloat(xmlObject.getAttribute("ax"));
    let ay = parseFloat(xmlObject.getAttribute("ay"));
    let bx = parseFloat(xmlObject.getAttribute("bx"));
    let by = parseFloat(xmlObject.getAttribute("by"));
    let color = xmlObject.getAttribute("color");
    return new Line(ax, ay, bx, by, color);
  }
}

// class to represent squares
export class Square {
  constructor(x, y, size, color=null) {
    this.drawMode = WebGLRenderingContext.TRIANGLE_STRIP;
    this.drawCount = 4;

    this.x = x;
    this.y = y;
    this.size = size;
    this.color = DEFAULT_COLOR;
    if (color !== null) {
      this.color = color;
    }
  }

  toVectors() {
    let sx = this.x + this.size;
    let sy = this.y + this.size;
    return [
      this.x, this.y, 
      sx, this.y,
      this.x, sy,
      sx, sy
    ];
  }

  toXML(){
    var xmlDoc = document.createElement('square');
    xmlDoc.setAttribute('x', this.x.toString());
    xmlDoc.setAttribute('y', this.y.toString());
    xmlDoc.setAttribute('size', this.size.toString());
    xmlDoc.setAttribute('color', this.color);

    return xmlDoc;
  }

  static fromXML(xmlObject) {
    let x = parseFloat(xmlObject.getAttribute("x"));
    let y = parseFloat(xmlObject.getAttribute("y"));
    let size = parseFloat(xmlObject.getAttribute("size"));
    let color = xmlObject.getAttribute("color");
    return new Square(x, y, size, color);
  }
}

// class to represent points
export class Point {
  constructor(x, y, color=null) {
    this.drawMode = WebGLRenderingContext.POINTS;
    this.drawCount = 1;

    this.x = x;
    this.y = y;
    this.color = DEFAULT_COLOR;
    if (color !== null) {
      this.color = color;
    }
  }

  toVectors() {
    return [
      this.x, this.y, 
    ];
  }

  toXML(){
    var xmlDoc = document.createElement('point');
    xmlDoc.setAttribute('x', this.x.toString());
    xmlDoc.setAttribute('y', this.y.toString());
    xmlDoc.setAttribute('color', this.color);

    return xmlDoc;
  }

  static fromXML(xmlObject) {
    let x = parseFloat(xmlObject.getAttribute("x"));
    let y = parseFloat(xmlObject.getAttribute("y"));
    let color = xmlObject.getAttribute("color");
    return new Point(x, y, color);
  }
}

// class to represent polygons
export class Polygon {
  constructor(points=[], color=null) {
    this.drawMode = WebGLRenderingContext.TRIANGLE_FAN;

    this.points = points;
    this.color = DEFAULT_COLOR;
    if (color !== null) {
      this.color = color;
    }
  }

  get drawCount() {
    return this.points.length;
  }

  toVectors() {
    let vectors = []
    for (let i = 0; i < this.points.length; i++) {
      let vector = this.points[i].toVectors();
      vectors.push(vector[0]);
      vectors.push(vector[1]);
    }
    return vectors;
  }

  toXML(){
    var xmlDoc = document.createElement('polygon');
    xmlDoc.setAttribute('color', this.color);
    for (let i = 0; i < this.points.length; i++){
      xmlDoc.appendChild(this.points[i].toXML());
    }

    return xmlDoc;
  }

  static fromXML(xmlObject) {
    let polygon = new Polygon([], xmlObject.getAttribute("color"));
    let xmlPoints = xmlObject.childNodes;
    for (let i = 0; i < xmlPoints.length; i++) {
      if (xmlPoints[i].nodeType !== Node.TEXT_NODE) {
        polygon.points.push(Point.fromXML(xmlPoints[i]));
      }
    }
    return polygon;
  }
}