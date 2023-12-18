var canvas = document.getElementById('gl_Canvas');
var gl = canvas.getContext('webgl');  

var pointColor = '(0,0,0,0)' 
var controlPoints = [];
var controlPointsColor = '(0.3,0.5,0.2,1)';

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
    console.log(x,y)
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return [x,y]
}



function drawBezier4Points( p0, p1, p2, p3) {

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

function drawBezier3Points( p0, p1, p2) {

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

function drawSplineCurve(ps) {
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

// ------------------------------ main ---------------------------------
function main() {
  let canvasElem = document.querySelector("canvas");
  clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);  

  // display prompt for user to select task
  let task = parseInt(window.prompt("Please enter the task number: (1 or 2)"
                      + "\n" + "1. Bezier curves" 
                      + "\n" + "2. Spline curves"
                      + "\n" + "Reload to choose another task!"))
  
  switch (task) {
    case 1:   // draw bezier curves
      // enter number of control points
      var numControlPoints = parseInt(window.prompt("Please enter number of control points: (3 or 4)"));
      var [preX, preY] = []

      canvasElem.addEventListener("mousedown", function(e) {
        clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);    
        if(controlPoints.length < numControlPoints){
          var [curX,curY] = getMousePosition(canvasElem, e);
          controlPoints.push({x: curX,y: curY});
          console.log('cur: ', curX, curY);
        } 
        [preX,preY] = [curX,curY] ; 

        // enough required points
        if(numControlPoints == 3) {   
          // mark the control points
          for(let i = 0; i < controlPoints.length; i++){
            putPixel(controlPoints[i].x, controlPoints[i].y, controlPointsColor);
          }
          // draw bezier
          drawBezier3Points(controlPoints[0], controlPoints[1], controlPoints[2]);
          controlPoints =[]
        } 
        else if(numControlPoints == 4) {
          for(let i = 0; i < controlPoints.length; i++){
            putPixel(controlPoints[i].x,controlPoints[i].y,controlPointsColor);
          }
          // draw bezier
          drawBezier4Points(controlPoints[0], controlPoints[1], controlPoints[2], controlPoints[3]);
          controlPoints =[]
        }
      })
      break;

    default:    // draw spline curves
      // enter number of control points
      var numControlPoints = parseInt(window.prompt("Please enter number of control points: "));
      console.log(numControlPoints);

      // alert about property of this function
      window.alert("This function will run properly in case: " 
                    + "\n" + "- x increses uniformly" 
                    + "\n" + "OR" 
                    + "\n" + "- x decreses unifomrly")
      var [preX, preY] = []
      var count = 0;

      canvasElem.addEventListener("mousedown", function(e) {
        clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);  

        if(controlPoints.length < numControlPoints){
          var [curX,curY] = getMousePosition(canvasElem, e);
          controlPoints.push({x: curX,y: curY});
          console.log('cur: ', curX, curY);
          count++;
        } 
        [preX,preY] = [curX,curY] ;

        if(numControlPoints == controlPoints.length) {
          for(let i = 0; i < controlPoints.length; i++){
            putPixel(controlPoints[i].x, controlPoints[i].y, controlPointsColor);
          }

          var ps = preDrawSpline();
          drawSplineCurve(ps);
          controlPoints = [];
        }
      })
      break;
  }
};

main()