var canvas = document.getElementById('gl_Canvas');
var gl = canvas.getContext('webgl');  
let canvasElem = document.querySelector("canvas");

var pointColor = '(1,0,0,0)' 
var controlPointsColor = '(0.3,0.5,0.2,1)';
var isClick = 0;

// base code
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
  
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }
  
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
  
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }
  
function verticesToBuffer(vertices) {
      // Create an empty buffer object to store the vertex buffer
    var vertex_buffer = gl.createBuffer();
  
    //Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  
    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return vertex_buffer;
  }
  
function sendBufferToProgram(program, buffer) {
    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  
    // Get the attribute location
    var coord = gl.getAttribLocation(program, "coordinates");
  
    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
  
    // Enable the attribute
    gl.enableVertexAttribArray(coord);
  }
  
function clearGL(color, top, left, width, height) {
  // Clear the canvas
  gl.clearColor(...color);

  // Enable the depth test
  gl.enable(gl.DEPTH_TEST);

  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Set the view port
  gl.viewport(top, left, width, height);
}
  
// put pixel with coordinate x, y and the color, with color is a string as '(0,0,0,0)'
function putPixel( x, y, color) {
    var vertices = [
      (x-canvas.width/2)/(canvas.width/2), -(y-canvas.height/2)/(canvas.height/2),0
    ];
  
    var vertex_buffer = verticesToBuffer(vertices);
  
    var vertCode =
      'attribute vec3 coordinates;' +
  
      'void main(void) {' +
      ' gl_Position = vec4(coordinates, 1.0);' +
      'gl_PointSize = 8.0;' +
      '}';
  
    var fragCode =
      'void main(void) {' +
      ' gl_FragColor = vec4' + color + ';' +
      '}';
  
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertCode);
    // console.log(vertexShader)
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragCode);
    var program = createProgram(gl, vertexShader, fragmentShader);
  
    gl.useProgram(program);
    sendBufferToProgram(program, vertex_buffer);
  
    gl.drawArrays(gl.POINTS, 0, 1);
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return [x,y]
}

function lineMidPoint(x1,y1, x2, y2) {
    var dx = x2-x1;
    var dy = y2-y1;
    var stepX = 1;
    var stepY = 1;
    var x=x1; 
    var y=y1;
    if(dx<0) {    // x2<x1
      dx = -dx;
      stepX = -1;
    } 
    if(dy < 0) {
      dy = -dy;
      stepY = -1;
    }
    // putPixel(x1,y1, '(1,0,0,1)');

  // m>1
    var p;
    if(dx>dy) {
        // console.log('1');
        p = 2 * dy - dx;
        while(x != x2) {
            if(p >= 0) {
                x += stepX;
                y += stepY;
                p += 2 * dy - 2 * dx;
            } 
            else {
                x += stepX;
                p += 2*dy;
            }
            putPixel(x,y, pointColor);
        }
    } 
  // m<1
    else {    
    //   console.log('2')
      p = 2 * dx - dy;
      while(y != y2) {
          if(p >= 0) {
              y += stepY;
              x += stepX;
              p += 2 * dx - 2*dy;
          } 
          else {
              y += stepY;
              p += 2 * dx;
          }
          putPixel(x,y, pointColor);
      }
    } 
    // putPixel(x2,y2, '(1,0,0,1)')
}

function drawRectangle(xStart, yStart, xEnd, yEnd) {
  lineMidPoint(xStart, yStart, xEnd, yStart)
  lineMidPoint(xEnd, yStart, xEnd, yEnd)
  lineMidPoint(xEnd, yEnd, xStart, yEnd)
  lineMidPoint(xStart, yEnd, xStart, yStart)
  console.log('Draw rec')
}    

function fillRectangle(xMin, yMin, xMax, yMax) {
  if(xMin && yMin && xMax && yMax) {
      var y = yMin
      while(y != yMax) {
          lineMidPoint(xMin, y, xMax, y)
          y++;
          console.log(y)
      }
      console.log('fill')
  } else console.log('Nope')
  
}

// prac 2
// -------------------------- draw ellipse ----------------------------------------
// A, B: long-short radius
function put4Pixel(x,y, xCenter, yCenter) {
    x+=xCenter;
    y+=yCenter;
    putPixel( x, y, pointColor);
    putPixel( x, yCenter*2-y, pointColor);
    putPixel( xCenter*2-x, y, pointColor);
    putPixel( xCenter*2-x, yCenter*2-y, pointColor);
}  

function put2Pixel(x,y, xCenter, yCenter) {
    x = x+xCenter;
    y = y+yCenter;
    putPixel( x, y, pointColor);
    putPixel( x, 2*yCenter -y, pointColor);
}

function buildEquations(xs, ys) {
  const Npoints = xs.length;
  const Npolys = Npoints - 1;
  const Ncoeffs = 4 * Npolys;

  let A = [];
  for (let i = 0; i < Ncoeffs; i++) {
      A.push(Array(Ncoeffs).fill(0));
  }

  let b = Array(Ncoeffs).fill(0);

  let nrow = 0;
  for (let i = 0; i < Npolys; i++, nrow += 2) {
      A[nrow][4 * i] = xs[i] ** 3;
      A[nrow][4 * i + 1] = xs[i] ** 2;
      A[nrow][4 * i + 2] = xs[i];
      A[nrow][4 * i + 3] = 1;
      b[nrow] = ys[i];

      A[nrow + 1][4 * i] = xs[i + 1] ** 3;
      A[nrow + 1][4 * i + 1] = xs[i + 1] ** 2;
      A[nrow + 1][4 * i + 2] = xs[i + 1];
      A[nrow + 1][4 * i + 3] = 1;
      b[nrow + 1] = ys[i + 1];
  }

  for (let i = 0; i < Npolys - 1; i++, nrow++) {
      A[nrow][4 * i] = 3 * xs[i + 1] ** 2;
      A[nrow][4 * i + 1] = 2 * xs[i + 1];
      A[nrow][4 * i + 2] = 1;
      A[nrow][4 * (i + 1)] = -3 * xs[i + 1] ** 2;
      A[nrow][4 * (i + 1) + 1] = -2 * xs[i + 1];
      A[nrow][4 * (i + 1) + 2] = -1;
  }

  for (let i = 0; i < Npolys - 1; i++, nrow++) {
      A[nrow][4 * i] = 6 * xs[i + 1];
      A[nrow][4 * i + 1] = 2;
      A[nrow][4 * (i + 1)] = -6 * xs[i + 1];
      A[nrow][4 * (i + 1) + 1] = -2;
  }

  A[nrow][0] = 6 * xs[0];
  A[nrow][1] = 2;
  A[nrow + 1][4 * (Npolys - 1)] = 6 * xs[Npolys];
  A[nrow + 1][4 * (Npolys - 1) + 1] = 2;

  return [A, b];
}

function preDrawSpline() {
var xs = [];
var ys = [];

// get xs, ys from control points
for(let i=0; i<controlPoints.length; i++) {
  xs.push(controlPoints[i].x);
  ys.push(controlPoints[i].y);    
}

// find a,b,c,d of equations
var [matA, b] = buildEquations(xs, ys);
var inverseMatA = math.inv(matA);
var matCoef = math.multiply(inverseMatA, b);

var index =0
var ps = [];
ps.push([]);
// divide a,b,c,d of each equation into each []
for (let i=0; i<matCoef.length; i++){
  if(i%4==0 && i!=0) {
    ps.push([])
    index++;
  }
  ps[index].push(matCoef[i]);
}
return ps;
}


function drawLineEvent(e) {
  var x1, x2, y1, y2
  console.log('click: ', isClick)
  if(isClick == 0) {
    // clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
    [x1, y1] = getMousePosition(canvas, e);
    putPixel(x1, y2, pointColor)
    console.log('cur: ', x1, y1);
    isClick = 1;
  }
  else if (isClick == 1) {

      [x1, y1] = getMousePosition(canvas, e);
      lineMidPoint(x1, y1, x2, y2);
      isClick = 2 ;
  } 
  else {      // reset click
    isClick = 0; 
    clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
  }
  // }
}

function drawLine() {
  isClick = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

  canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);
  
  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);
  
  canvas.removeEventListener("mousedown", mousedownEvent);
  canvas.removeEventListener("mousemove", mousemoveEvent);
  canvas.removeEventListener("mouseup", mouseupEvent);
  
  canvas.addEventListener("click", drawLineEvent);

}

function getRadiusE() {
  let longR = window.prompt("Please enter long radius");
  let shortR = window.prompt('Please enter short radius');
  console.log(longR, shortR);
  return [parseInt(longR), parseInt(shortR)];
}

function drawEllipseEvent(e)
{
  // window.alert('You are drawing ellipse')
  var A, B, xCenter, yCenter

  if(isClick == 0) {
      [xCenter, yCenter] = getMousePosition(canvasElem,e);
      console.log('center: ', xCenter, yCenter);
      // clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);
      [A,B]=getRadiusE();
  
      var A2, B2, p, Const1, Const2, Delta1, Delta2, x, y, MaxX, MaxY;
      
      A2 = A*A;
      B2 = B*B;
      
      MaxX = Math.floor(A2/Math.sqrt(A2+B2));//44
      MaxY = Math.floor(B2/Math.sqrt(A2+B2)); // 178
      // (0, B) -> (MaxX, MaxY)
      p = B2-A2*B+A2/4;
      Const1 = 2*B2;
      Const2 = 2*A2;

      x = 0;
      y = B;
      Delta1 = B2*(2*x+3);
      // Delta1 = B2*3 since x=0
      Delta2 = 2*A2*(1-y)+B2*(2*x+3);
      // Delta2 = 2*A2*(1-B)+Delta1 since x=0, y=B
      put4Pixel(x,y, xCenter, yCenter);
      while (x<MaxX)
      {
          if (p>=0)
          {
              p += Delta2;
              Delta2 += Const2;
              y--;
          }
          else
          p += Delta1;
          Delta2+=Const1;
          Delta1+=Const1;
          x++;

          put4Pixel(x,y, xCenter, yCenter);
      }

      // (A, 0) -> (MaxX, MaxY)
      p = A2-A*B2+B2/4;
      Const1 = 2*A2;
      Const2 = 2*B2;
      x = A;
      y = 0;
      Delta1 = A2*(2*y+3);
      // Delta1 = A2*3 since y=0
      Delta2 = 2*B2*(1-x)+A2*(2*y+3);
      // Delta2 = 2*B2*(1-A)+A2*3 since x=A, y=0
      put4Pixel(x,y, xCenter, yCenter);
      while (y<MaxY)
      {
          if (p>=0)
          {
              p +=Delta2;
              Delta2+=Const2;
              x--;
          }
          else
              p+=Delta1;

          Delta2+=Const1;
          Delta1+=Const1;
          y++;
          put4Pixel(x,y, xCenter, yCenter);
      }
      isClick = 1; 
      console.log(isClick)
  } 
  else {
      isClick = 0;
      clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
  }
}

function drawEllipse() {
  clicked = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

  // remove all event before
  canvas.removeEventListener("click", drawLineEvent);
  //canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);
  
  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);
  
  canvas.removeEventListener("mousedown", mousedownEvent);
  canvas.removeEventListener("mousemove", mousemoveEvent);
  canvas.removeEventListener("mouseup", mouseupEvent);
  
  canvas.addEventListener("click", drawEllipseEvent);
}

function doDrawParabola(xCenter, yCenter, a) {
  var y = 0;
  var x = 0;
  var inc = -1;
  if(a>0) {
  inc = 1;
  } else a=-a;

  var const1 = 2*y+3;
  var const2 = 2*y+3-4*a;
  var p = 1-2*a;

  while(y<= a) {
  put2Pixel(x,y, xCenter, yCenter)
  if(p<0) {
      p+= const1;
  } else {
      p+= const2;
      x+=inc;
  }
  y++;    
  }

  p = 1/4-4*a;
  var const3 = -4*a;
  for(let i=0; i<100; i++) {
  put2Pixel(x,y, xCenter, yCenter)
  if(p>0) {
      p += const3;
  } else {
      p+= 2+ 2*y + const3;
      y++;  
  }
  x+=inc;
  }
}

function drawParabolaEvent(e) {
  // window.alert('You are drawing parabola')

  var xCenter, yCenter

  if(isClick == 0) {
      [xCenter, yCenter] = getMousePosition(canvasElem,e);
      putPixel(xCenter, yCenter, pointColor)
      isClick = 1;
  } 
  else if(isClick == 1) {
      var a = parseInt(window.prompt('Please enter coefficient of the quadratic term (a)'))
      doDrawParabola(xCenter, yCenter, a);
      isClick =2;
  } 
  else {
      clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);  
      isClick = 0;
  } 
}

function drawParabola() {
  clicked = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

  canvas.removeEventListener("click", drawLineEvent);
  canvas.removeEventListener("click", drawEllipseEvent);
  //canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);
  
  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);
  
  canvas.removeEventListener("mousedown", mousedownEvent);
  canvas.removeEventListener("mousemove", mousemoveEvent);
  canvas.removeEventListener("mouseup", mouseupEvent);
  
  canvas.addEventListener("click", drawParabolaEvent);
}

function doDrawHyperbola(xCenter, yCenter, a, b) {
  var x=a; y=0;
  var a2 = a*a;
  var b2 = b*b;
  var p = (x+1/2)*(x+1/2)*b2 - a2 - a2*b2;
  while(y<=b2) {
    put4Pixel( x, y, xCenter, yCenter);
    if(p<0) {
      p+= b2*(2*x+2) - a2*(y+3);
      x++;
    } else {
      p+= -a2*(2*y+3);
    }
    y++
  } 
}

function drawHyperbolaEvent(e) {
  var a, b, xCenter, yCenter
  if (isClick == 0) {
      [xCenter, yCenter] = getMousePosition(canvasElem, e)
      putPixel(xCenter, yCenter)
      isClick = 1;
  } 
  else if(isClick ==1) {
      var a = parseInt(window.prompt('Please enter major axis (a)'));
      var b = parseInt(window.prompt('Please enter minor axis (b)'));
      doDrawHyperbola(xCenter, yCenter, a, b)
      isClick = 2;
  } 
  else {
      clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
      isClick = 0;
  }
}

function drawHyperbola() {
  clicked = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

  canvas.removeEventListener("click", drawLineEvent);
  canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  //canvas.removeEventListener("click", drawHyperbolaEvent);
  
  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);
  
  canvas.removeEventListener("mousedown", mousedownEvent);
  canvas.removeEventListener("mousemove", mousemoveEvent);
  canvas.removeEventListener("mouseup", mouseupEvent);
  
  canvas.addEventListener("click", drawHyperbolaEvent);

}

function doDrawBezier3Points( p0, p1, p2) {

  // calc initial value
  var A0x = p0.x - 2 * p1.x + p2.x;
  var A1x = -2 * (p0.x - p1.x);
    
  var A0y = p0.y - 2 * p1.y + p2.y;
  var A1y = -2 * (p0.y - p1.y);
  
  var Mx = 3*Math.abs(A0x) + Math.abs(A1x);
  var My = 3*Math.abs(A0y) + Math.abs(A1y);

  var Dt = Math.pow(Math.max(Mx, My), -1);
  
  var Dx = A0x * Math.pow(Dt, 2) + A1x * Dt;
  var Ddx = 2 * A0x * Math.pow(Dt, 2);
  
  var Dy = A0y * Math.pow(Dt, 2) + A1y * Dt;
  var Ddy = 2 * A0y * Math.pow(Dt, 2);

  console.log("D: ",Dx, Ddx, Dy, Ddy);

  // calc step
  var steps = Math.round(1/Dt);
  console.log(steps)

  var x = p0.x;
  var y = p0.y;

  // plot the first point
  putPixel(x,y, pointColor);

  // forward difference
  // x += Dx;
  // y += Dy;
  putPixel(Math.round(x), Math.round(y), pointColor);
  
  var pre = [Math.round(x), Math.round(y)]
  for(let i=2; i<=steps; i++) {
    x += Dx;
    y += Dy;
    
    Dx += Ddx;

    Dy += Ddy;

    // prevent from re-drawing existed points 
    if(pre[0] == Math.round(x) && pre[1] ==  Math.round(y)) {
      continue;
    } else {
      putPixel(Math.round(x), Math.round(y), pointColor);
      pre = [Math.round(x), Math.round(y)];
    }
  }  
  // plot the last control point
  putPixel(p2.x, p2.y, pointColor);
}

function drawBezier3PointsEvent(e) {
  var x0, y0, x1, y1, x2, y2
  if(isClick ==0) {
      [x0, y0] = getMousePosition(canvasElem, e);
      isClick = 1;
  } 
  else if (isClick ==1) {
      [x1, y1] = getMousePosition(canvasElem, e);
      isClick = 2;
  } 
  else if( isClick ==2) {
      [x2, y2] = getMousePosition(canvasElem, e);
      isClick = 3;
  } 
  else {
      clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
      isClick = 0;
  }
}

function doDrawBezier4Points( p0, p1, p2, p3) {

  // calc initial value
  var A0x = - (p0.x - 3*p1.x + 3*p2.x - p3.x);
  var A1x = 3 * (p0.x - 2*p1.x + p2.x);
  var A2x = -3 * p0.x + 3 * p1.x;
    
  var A0y = - (p0.y - 3*p1.y + 3*p2.y - p3.y);
  var A1y = 3 * (p0.y - 2*p1.y + p2.y);
  var A2y = -3 * p0.y + 3 * p1.y;
  
  var Mx = 7*Math.abs(A0x) + 3*Math.abs(A1x) + Math.abs(A2x);
  var My = 7*Math.abs(A0y) + 3*Math.abs(A1y) + Math.abs(A2y);

  var Dt = Math.pow(Math.max(Mx, My), -1);
  
  var Dx = A0x * Math.pow(Dt, 3) + A1x * Math.pow(Dt, 2) + A2x * Dt;
  var Ddx = 6 * A0x * Math.pow(Dt, 3) + 2 *A1x * Math.pow(Dt,2);
  var Dddx = 6 * A0x * Math.pow(Dt, 3);
  
  var Dy = A0y * Math.pow(Dt, 3) + A1y * Math.pow(Dt, 2) + A2y * Dt;
  var Ddy = 6 * A0y * Math.pow(Dt, 3) + 2 *A1y * Math.pow(Dt,2);
  var Dddy = 6 * A0y * Math.pow(Dt, 3);

  // calc step
  var steps = Math.round(1/Dt);
  console.log(steps)

  var x = p0.x;
  var y = p0.y;

  // plot first point
  putPixel(x,y, pointColor);

  // forward difference
  x += Dx;
  y += Dy;
  Dx += Ddx;
  Dy += Ddy;
  putPixel(Math.round(x), Math.round(y), pointColor);
  
  var pre = [Math.round(x), Math.round(y)]
  for(let i=2; i<=steps; i++) {
    x += Dx;
    y += Dy;
    
    Dx += Ddx;
    Ddx += Dddx;

    Dy += Ddy;
    Ddy += Dddy;

    // prevent from re-drawing existed points 
    if(pre[0] == Math.round(x) && pre[1] ==  Math.round(y)) {
      continue;
    } else {
      putPixel(Math.round(x), Math.round(y), pointColor);
      pre = [Math.round(x), Math.round(y)];
    }
  }  
  // plot the last control point
  putPixel(p3.x, p3.y, controlPointsColor);
}

function drawBezier4PointsEvent(e) {
  var x0, y0, x1, y1, x2, y2, x3, y3
  if(isClick ==0) {
      [x0, y0] = getMousePosition(canvasElem, e);
      isClick = 1;
  } 
  else if (isClick ==1) {
      [x1, y1] = getMousePosition(canvasElem, e);
      isClick = 2;
  } 
  else if( isClick ==2) {
      [x2, y2] = getMousePosition(canvasElem, e);
      isClick = 3;
  } 
  else if (isClick == 3) {
      [x3, y3] = getMousePosition(canvasElem, e);
      isClick = 4;
  }
  else {
      clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
      isClick = 0;
  }
}

function drawBezier() {
  isClick = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
  var numControlPoints = window.prompt("Enter number control points (3 or 4)");
  
  canvas.removeEventListener("click", drawLineEvent);
  canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);

  canvas.removeEventListener("mousedown", mousedownEvent);
  canvas.removeEventListener("mousemove", mousemoveEvent);
  canvas.removeEventListener("mouseup", mouseupEvent);
  
    if (numControlPoints == 3) {
      //vẽ bezier 3 điểm (bậc 2)
      canvas.removeEventListener("click", drawBezier4PointsEvent);
      canvas.addEventListener("click", drawBezier3PointsEvent);
  }
  else {
      //vẽ bezier 4 điểm (bậc 3)
      canvas.removeEventListener("click", drawBezier3PointsEvent);
    
      canvas.addEventListener("click", drawBezier4PointsEvent);
  }
}

function doDrawSplineCurve(ps) {
  for (let i = 0; i < ps.length; i++) 
{  
  var preX,preY ;
  if(controlPoints[i].x <= controlPoints[i+1].x) {    // in case x increase uniformly
    for (let x = controlPoints[i].x; x <= controlPoints[i+1].x; x += 0.1) 
    {
      var y = ps[i][0] * Math.pow(x, 3) + ps[i][1] * Math.pow(x, 2) + ps[i][2] * x + ps[i][3];
      
      // prevent from re-drawing existed points 
      if(preX == Math.round(x) && preY == Math.round(y)) {
        continue;
      } else {
        putPixel(Math.round(x), Math.round(y), pointColor);
        preX = Math.round(x);
        preY = Math.round(y);
      }
    }
  } 
  else {  //in case x decrease uniformly
    for (let x = controlPoints[i].x; x >= controlPoints[i+1].x; x -= 0.1) 
    {
      var y = ps[i][0] * Math.pow(x, 3) + ps[i][1] * Math.pow(x, 2) + ps[i][2] * x + ps[i][3];
      
      // prevent from re-drawing existed points 
      if(preX == Math.round(x) && preY == Math.round(y)) {
        continue;
      } else {
        putPixel(Math.round(x), Math.round(y), pointColor);
        preX = Math.round(x);
        preY = Math.round(y);
      }
    }
  }
}	
}

function drawSplineCurve() {
  clicked = 0;
  clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
  
  canvas.removeEventListener("click", drawLineEvent);
  canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);
  
  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);
  
  canvas.removeEventListener("mousedown", mousedownEvent);
  canvas.removeEventListener("mousemove", mousemoveEvent);
  canvas.removeEventListener("mouseup", mouseupEvent);
  
  var numControlPints = window.prompt("Enter number of control points (>= 2)");
  
  while (numControlPints < 2) {
       var numControlPints = window.prompt("Please enter number of control points (>= 2)");
  }
  
  // var xS = [];
  // var yS = [];
  // var ps = []  

  canvas.addEventListener("click", function(e) {
      var [x, y] = getMousePosition(canvas, e);
      putpixel(x, y, colorBlack);
      // ps.push({x: x, y: y})
      numControlPints--;
    
      if (numControlPints == 0) {
      this.removeEventListener('click', arguments.callee, false);
      var ps = preDrawSpline();
      drawSplineCurve(ps);
    }
  })
}

var xStart, yStart, xEnd, yEnd;
var isDragging = false;
function mousedownEvent(e) {
  [xStart, yStart] = getMousePosition(canvasElem, e)
  isDragging = true;
  console.log('start: ', xStart, yStart)
}

function mousedownEvent(e) {
  [xStart, yStart] = getMousePosition(canvasElem, e)
  isDragging = true;
  console.log('start: ', xStart, yStart)
}

function mousemoveEvent(e) {
  if(isDragging == true) {
      [xEnd, yEnd] = getMousePosition(canvasElem, e)
      drawRectangle(Math.round(xStart), Math.round(yStart), Math.round(xEnd), Math.round(yEnd))
      console.log('move')
  } 
}

function mouseupEvent(e) {
  isDragging = false;
  xMax = Math.round(Math.max(xStart, xEnd))
  yMax = Math.round(Math.max(yStart, yEnd))
  xMin = Math.round(Math.min(xStart, xEnd))
  yMin = Math.round(Math.min(yStart, yEnd))
  // console.log(xStart, yStart, xEnd, yEnd)
  console.log('stop: ', xMin, yMin, xMax, yMax)
  if(xMin && yMin && xMax && yMax) {
      clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);  
      fillRectangle(Math.round(xMin), Math.round(yMin), Math.round(xMax), Math.round(yMax))    
  }
}

function cropRectangle() {
  isClick = 0;   
  canvas.removeEventListener("click", drawLineEvent);
  canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);

  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);
  
  canvas.addEventListener("mousedown", mousedownEvent);
  canvas.addEventListener("mousemove", mousemoveEvent);
  canvas.addEventListener("mouseup", mouseupEvent);

}


// function main() {
//     clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);  

    
// };
  
// main()