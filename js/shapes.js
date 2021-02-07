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