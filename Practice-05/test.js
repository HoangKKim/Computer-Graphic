var canvas = document.getElementById('gl_Canvas');
var gl = canvas.getContext('webgl');  
let canvasElem = document.querySelector("canvas");

var pointColor = '(0,0,0,1)' 
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

function drawObject(arrPoints) {
  for(let i=0; i<arrPoints.length; i++){
    putPixel(arrPoints[i][0], arrPoints[i][1], pointColor)
  }
}

function get4Pixel(x,y, xCenter, yCenter) {
  x+=xCenter;
  y+=yCenter;
  // putPixel( x, y, pointColor);
  // putPixel( x, yCenter*2-y, pointColor);
  // putPixel( xCenter*2-x, y, pointColor);
  // putPixel( xCenter*2-x, yCenter*2-y, pointColor);
  var tmpList = []
  tmpList.push([x,y])
  tmpList.push([x, yCenter*2-y])
  tmpList.push([xCenter*2-x, y])
  tmpList.push([xCenter*2-x, yCenter*2-y])

  return tmpList
}  

function get2Pixel(x,y, xCenter, yCenter) {
  x = x+xCenter;
  y = y+yCenter;
  var tmpList = []
  tmpList.push([x, y])
  tmpList.push([x, 2*yCenter - y]);
  return tmpList
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return [x,y]
}

function getCenterPoint(arrPoints) {
  let tmp = Math.round(arrPoints.length/2)
  let x = arrPoints[tmp][0]
  let y = arrPoints[tmp][1]
  return [x,y]
}                                                           

var objectPoints = []     // arr chứa các điểm của hình
var resObjectPoints = []    // arr chứa kết quả các điểm của hình sau biến đổi
var newXCenter, newYCenter    // tâm của các object

// line
function lineMidPoint(x1,y1, x2, y2) {
  var dx = x2-x1;
  var dy = y2-y1;
  var stepX = 1;
  var stepY = 1;
  console.log(x1, y1, x2, y2)
  var x= x1; 
  var y=y1;
  if(dx<0) {    // x2<x1
    dx = -dx;
    stepX = -1;
  } 
  if(dy < 0) {
    dy = -dy;
    stepY = -1;
  }

  // m>1
  var p;
  if(dx>dy) {
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
      // putPixel(x,y, pointColor);
      objectPoints.push([x,y])
    }
  } 
  // m<1
  else {    
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
      // putPixel(x,y, pointColor);
      objectPoints.push([x,y])
    }
  } 
  objectPoints.push([x,y])
}

var x1, x2, y1, y2        // điểm đầu và điểm cuối cho line
function drawLineEvent(e) {
  console.log('click: ', isClick)
  if(isClick == 0) {
    // lấy điểm đầu
    [x1, y1] = getMousePosition(canvas, e);
    putPixel(x1, y1, pointColor)
    objectPoints.push([x1, y1])

    isClick = 1;
  }
  else if (isClick == 1) {
    [x2, y2] = getMousePosition(canvas, e);
    
    // vẽ đoạn thẳng từ (x1, y1) đến (x2, y2)
    lineMidPoint(Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2));
    isClick = 2 ;
    
    // vẽ đoạn thẳng gốc
    drawObject(objectPoints)

    // tính toán giá trị center
    var tmp = getCenterPoint(objectPoints)
    newXCenter = tmp[0]
    newYCenter = tmp[1]
    canvas.addEventListener("keydown", myFunction);
  } 
  else {      // reset click
    window.alert('Canvas is reset!')

    canvas.removeEventListener("keydown", myFunction);
    Tx = 0;
    Ty = 0;
    Sx = 1;
    Sy = 1;
    theta = 0;
    objectPoints = []

    isClick = 0; 
    clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
  }
}

function drawLine() {
  isClick = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

  canvas.removeEventListener("keydown", myFunction);

  canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);
  
  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);
  
  canvas.addEventListener("click", drawLineEvent);
}

// Ellipse
function getRadiusE() {
  let longR = window.prompt("Please enter long radius");
  let shortR = window.prompt('Please enter short radius');
  console.log(longR, shortR);
  return [parseInt(longR), parseInt(shortR)];
}

function drawEllipseEvent(e)
{
  var A, B, xCenter, yCenter, tmp

  if(isClick == 0) {
      
    // lấy thông tin về tâm và bán kính
    [xCenter, yCenter] = getMousePosition(canvasElem,e);
    console.log(xCenter, yCenter)
    putPixel(xCenter, yCenter, pointColor)
    tmp = getRadiusE()
    A = tmp[0]
    B = tmp[1]
  
    var A2, B2, p, Const1, Const2, Delta1, Delta2, x, y, MaxX, MaxY;
      
    A2 = A*A;
    B2 = B*B;
      
    MaxX = Math.floor(A2/Math.sqrt(A2+B2));//44
    MaxY = Math.floor(B2/Math.sqrt(A2+B2)); // 178

    p = B2-A2*B+A2/4;
    Const1 = 2*B2;
    Const2 = 2*A2;

    x = 0;
    y = B;

    Delta1 = B2*(2*x+3);
    Delta2 = 2*A2*(1-y)+B2*(2*x+3);

    var tmpList = get4Pixel(x, y, xCenter, yCenter)
    tmpList.forEach(e => {objectPoints.push(e)})

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

      var tmpList = get4Pixel(x, y, xCenter, yCenter)
      tmpList.forEach(e => {objectPoints.push(e)})
    }

    p = A2-A*B2+B2/4;
    Const1 = 2*A2;
    Const2 = 2*B2;
    x = A;
    y = 0;
    Delta1 = A2*(2*y+3);
    Delta2 = 2*B2*(1-x)+A2*(2*y+3);

    var tmpList = get4Pixel(x, y, xCenter, yCenter)
    tmpList.forEach(e => {objectPoints.push(e)})

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
      
      var tmpList = get4Pixel(x, y, xCenter, yCenter)
      tmpList.forEach(e => {objectPoints.push(e)})
    }

    isClick = 1; 
     
    // biểu diễn hình gốc
    drawObject(objectPoints)

    canvas.addEventListener('keydown', myFunction)    

    newXCenter = xCenter
    newYCenter = yCenter
  } 
  else {
    window.alert('Canvas is reset!')
    canvas.removeEventListener("keydown", myFunction);
    Tx = 0;
    Ty = 0;
    Sx = 1;
    Sy = 1;
    theta = 0;
    objectPoints = []

    isClick = 0;
    clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
  }
}

function drawEllipse() {
  clicked = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

  // remove all event before
  canvas.removeEventListener("keydown", myFunction);
  canvas.removeEventListener("click", drawLineEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);
  
  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);
  
  canvas.addEventListener("click", drawEllipseEvent);
}

// parabola
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
    var tmpList = get2Pixel(x, y, xCenter, yCenter)
    tmpList.forEach(e => {objectPoints.push(e)})
    // get2Pixel(x,y, xCenter, yCenter)
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
    // get2Pixel(x,y, xCenter, yCenter)
    var tmpList = get2Pixel(x, y, xCenter, yCenter)
    tmpList.forEach(e => {objectPoints.push(e)})

    if(p>0) {
        p += const3;
    } else {
        p+= 2+ 2*y + const3;
        y++;  
    }
    x+=inc;
  }
}

var xCenterPara, yCenterPara
function drawParabolaEvent(e) {
  // window.alert('You are drawing parabola')
  if(isClick == 0) {
    [xCenterPara, yCenterPara] = getMousePosition(canvasElem,e);
    putPixel(xCenterPara, yCenterPara, pointColor)
    isClick = 1;  
  } 
  else if(isClick == 1) {
    var a = parseInt(window.prompt('Please enter coefficient of the quadratic term (a)'))
    doDrawParabola(xCenterPara, yCenterPara, a);
    
    // vẽ hình ảnh gốc
    drawObject(objectPoints)

    newXCenter = xCenterPara
    newYCenter = yCenterPara
    canvas.addEventListener('keydown', myFunction)

    isClick = 2;
  } 
  else {
    window.alert('Canvas is reset!')
    clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);  
    isClick = 0;

    canvas.removeEventListener('keydown', myFunction)

    Tx = 0;
    Ty = 0;
    Sx = 1;
    Sy = 1;
    theta = 0;
    objectPoints = []

  } 
}

function drawParabola() {
  clicked = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

  canvas.removeEventListener("keydown", myFunction);

  canvas.removeEventListener("click", drawLineEvent);
  canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);
  
  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);

  canvas.addEventListener("click", drawParabolaEvent);
}

function doDrawHyperbola(xCenter, yCenter, a, b) {
  var x=a; y=0;
  var a2 = a*a;
  var b2 = b*b;
  var p = (x+1/2)*(x+1/2)*b2 - a2 - a2*b2;
  while(y<=b2) {
    // put4Pixel( x, y, xCenter, yCenter);
    var tmpList = get4Pixel(x, y, xCenter, yCenter)
    tmpList.forEach(e => {objectPoints.push(e)})
    if(p<0) {
      p+= b2*(2*x+2) - a2*(y+3);
      x++;
    } else {
      p+= -a2*(2*y+3);
    }
    y++
  } 
}

var a, b, xCenterHyper, yCenterHyper
function drawHyperbolaEvent(e) {
  if (isClick == 0) {
      [xCenterHyper, yCenterHyper] = getMousePosition(canvasElem, e)
      putPixel(xCenterHyper, yCenterHyper, pointColor)
      isClick = 1;
  } 
  else if(isClick ==1) {
    var a = parseInt(window.prompt('Please enter major axis (a)'));
    var b = parseInt(window.prompt('Please enter minor axis (b)'));
    doDrawHyperbola(xCenterHyper, yCenterHyper, a, b)
    
    drawObject(objectPoints)

    canvas.addEventListener('keydown', myFunction)
    newXCenter = xCenterHyper
    newYCenter = yCenterHyper
    isClick = 2;
  } 
  else {
    window.alert('Canvas is reset!')
    canvas.removeEventListener('keydown', myFunction)
    clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
    isClick = 0;
    Tx = 0;
    Ty = 0;
    Sx = 1;
    Sy = 1;
    theta = 0;
    objectPoints = []
  }
}

function drawHyperbola() {
  clicked = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

  canvas.removeEventListener('keydown', myFunction)
  canvas.removeEventListener("click", drawLineEvent);
  canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);
  
  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);
  
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

  var x = p0.x;
  var y = p0.y;

  // plot the first point
  // putPixel(x,y, pointColor);
  objectPoints.push([x,y])

  // forward difference
  // x += Dx;
  // y += Dy;
  // putPixel(Math.round(x), Math.round(y), pointColor);
  objectPoints.push([Math.round(x), Math.round(y)]);
  

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
      // putPixel(Math.round(x), Math.round(y), pointColor);
      objectPoints.push([Math.round(x), Math.round(y)]);
      pre = [Math.round(x), Math.round(y)];
    }
  }  
  // plot the last control point
  // putPixel(p2.x, p2.y, pointColor);
  objectPoints.push([p2.x, p2.y]);

}

var x0, y0, x1, y1, x2, y2, x3, y3
function drawBezier3PointsEvent(e) {
  if(isClick ==0) {
      [x0, y0] = getMousePosition(canvasElem, e);
      putPixel(x0, y0, pointColor)
      isClick = 1;
  } 
  else if (isClick ==1) {
      [x1, y1] = getMousePosition(canvasElem, e);
      putPixel(x1, y1, pointColor)
      isClick = 2;
  } 
  else if( isClick == 2) {
      [x2, y2] = getMousePosition(canvasElem, e);
      putPixel(x2, y2, pointColor)
      doDrawBezier3Points({x: x0,y: y0}, {x: x1,y:  y1}, {x: x2,y:  y2})
      drawObject(objectPoints)
      var tmp = getCenterPoint(objectPoints)
      newXCenter = tmp[0]
      newYCenter = tmp[1]

      canvas.addEventListener('keydown', myFunction)
      isClick = 3;
  } 
  else {
    window.alert('Canvas is reset!')
    canvas.removeEventListener('keydown', myFunction)
    clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
    isClick = 0;
    Tx = 0;
    Ty = 0;
    Sx = 1;
    Sy = 1;
    theta = 0;
    objectPoints = []
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

  var x = p0.x;
  var y = p0.y;

  // plot first point
  // putPixel(x,y, pointColor);
  objectPoints.push([x,y])

  // forward difference
  x += Dx;
  y += Dy;
  Dx += Ddx;
  Dy += Ddy;
  objectPoints.push([Math.round(x), Math.round(y)]);
  
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
      objectPoints.push([Math.round(x), Math.round(y)]);
      pre = [Math.round(x), Math.round(y)];
    }
  }  
  // plot the last control point
  objectPoints.push([p3.x, p3.y])
}

function drawBezier4PointsEvent(e) {
  if(isClick ==0) {
      [x0, y0] = getMousePosition(canvasElem, e);
      putPixel(x0, y0, pointColor)
      isClick = 1;
  } 
  else if (isClick ==1) {
      [x1, y1] = getMousePosition(canvasElem, e);
      putPixel(x1, y1, pointColor)
      isClick = 2;
  } 
  else if( isClick ==2) {
      [x2, y2] = getMousePosition(canvasElem, e);
      putPixel(x2, y2, pointColor)
      isClick = 3;
  } 
  else if (isClick == 3) {
      [x3, y3] = getMousePosition(canvasElem, e);
      putPixel(x3, y3, pointColor)
      doDrawBezier4Points({x: x0,y: y0}, {x: x1,y:  y1}, {x: x2,y:  y2}, {x: x3, y: y3})
      drawObject(objectPoints)

      var tmp = getCenterPoint(objectPoints)
      newXCenter = tmp[0]
      newYCenter = tmp[1]

      canvas.addEventListener('keydown', myFunction)
      isClick = 4;
  }
  else {
    window.alert('Canvas is reset!')
    canvas.removeEventListener('keydown', myFunction)
    clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
    isClick = 0;
    Tx = 0;
    Ty = 0;
    Sx = 1;
    Sy = 1;
    theta = 0;
    objectPoints = []
  }
}

function drawBezier() {
  isClick = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
  var numControlPoints = window.prompt("Enter number control points (3 or 4)");
  
  canvas.removeEventListener('keydown', myFunction)
  canvas.removeEventListener("click", drawLineEvent);
  canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);
  
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

function preDrawSpline(controlPoints) {
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

function doDrawSplineCurve(ps) {
  for (let i = 0; i < ps.length; i++) {  
    var preX,preY ;    
    if(controlPoints[i].x <= controlPoints[i+1].x) {    // in case x increase uniformly
      for (let x = controlPoints[i].x; x <= controlPoints[i+1].x; x += 0.1) {
        var y = ps[i][0] * Math.pow(x, 3) + ps[i][1] * Math.pow(x, 2) + ps[i][2] * x + ps[i][3];

        // prevent from re-drawing existed points 
        if(preX == Math.round(x) && preY == Math.round(y)) {
          continue;
        } else {
          // putPixel(Math.round(x), Math.round(y), pointColor);
          objectPoints.push([Math.round(x), Math.round(y)])
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
          // putPixel([Math.round(x), Math.round(y)], pointColor);
          objectPoints.push([Math.round(x), Math.round(y)])

          preX = Math.round(x);
          preY = Math.round(y);
        }
      }
    }
  }	
}

var numControlPints
var controlPoints = []
// function drawSplineCurve_final(e) {
  
//   // var isDone = false
//   while(true) {
//     var [x, y] = getMousePosition(canvas, e);
//     controlPoints.push({x: x, y: y})
//     putPixel(x, y, pointColor);
//     numControlPints--;
//     if(numControlPints == 0) 
//       break
//   }
  
//   if (numControlPints == 0) {
//     // this.removeEventListener('click', arguments.callee, false);
    
//     var ps = preDrawSpline(controlPoints);
//     doDrawSplineCurve(ps);
//     drawObject(objectPoints)
//     console.log(objectPoints)
    
//     // controlPoints = []
//     // window.alert('Press OK to see the curve'
//     // + '\n' + 'After drawing, repress the button to draw a new curve')
//     var tmp = getCenterPoint(controlPoints)
//     newXCenter = tmp[0]
//     newYCenter = tmp[1]

//     canvas.addEventListener('keydown', myFunction)
//     // isDone = true;
//     numControlPints --;
//   }  
//   else if(numControlPints <0) {
//     canvas.removeEventListener('keydown', myFunction)
//     controlPoints = []
//     Tx = 0;
//     Ty = 0;
//     Sx = 1;
//     Sy = 1;
//     theta = 0;
//     objectPoints = [] 
//   }
// }

function drawSplineCurve() {
  window.alert('This function will execute properly in case x increase or decrease uniformly')
  isClick = 0;
  clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);
  
  canvas.removeEventListener("click", drawLineEvent);
  canvas.removeEventListener("click", drawEllipseEvent);
  canvas.removeEventListener("click", drawParabolaEvent);
  canvas.removeEventListener("click", drawHyperbolaEvent);
  
  canvas.removeEventListener("click", drawBezier3PointsEvent);
  canvas.removeEventListener("click", drawBezier4PointsEvent);

  numControlPints = window.prompt("Enter number of control points: ");

  // var numControlPints = window.prompt("Enter number of control points: ");
  
  canvas.addEventListener("click", function(e) {
      var [x, y] = getMousePosition(canvas, e);
      controlPoints.push({x: x, y: y})
      putPixel(x, y, pointColor);
      // ps.push({x: x, y: y})
      numControlPints--;
    
      if (numControlPints == 0) {
        this.addEventListener('keydown', myFunction)
        this.removeEventListener('click', arguments.callee, false);
        var ps = preDrawSpline(controlPoints);
        doDrawSplineCurve(ps);
        drawObject(objectPoints)
        controlPoints = []
        var tmp = getCenterPoint(objectPoints)
        newXCenter = tmp[0]
        newYCenter = tmp[1]
        window.alert('Press OK to see the curve'
                      + '\n' + 'After drawing, repress the button to draw a new curve')
      } 
  })
  Tx = 0;
  Ty = 0;
  Sx = 1;
  Sy = 1;
  theta = 0;
  objectPoints = [] 
}

// ---------------------------------------------------------------------------------------------------
var Tx, Ty, Sx, Sy, theta
Tx = 0;
Ty = 0;
theta = 0
Sx = 1;
Sy = 1;
function myFunction(e){
  var isPressed = true;
  switch (e.key) {
    case "ArrowRight":
      Tx++
      console.log('Tright ', Tx)
      break;
    case "ArrowLeft":
      Tx--
      console.log('Tleft ', Tx)
      break;
    case "ArrowUp":
      Ty--;
      console.log('Tup ', Ty)
      break;
    case "ArrowDown":
      Ty++
      console.log('Tdown ', Ty)
      break;
    case 'L':
    case 'l':
      theta --
      console.log('Rl ', theta)
      break
    case 'R':
    case 'r':
      theta ++
      console.log('Rr ', theta)
      break;
    case "+":
      Sx += 0.1
      Sy += 0.1
      console.log('S-up ', Sx, Sy)
      break;
    case "-":
      if(Sx >= 0.1 || Sy >= 0.1) {
        Sx -= 0.1
        Sy -= 0.1  
      } else {
        Sx = 0;
        Sy = 0
      }
      console.log('S-down ', Sx,Sy)
      break;
    default:
      isPressed = false;
      break;
  }
 
  // console.log('line: ', objectPoints) // bị lỗi sai ma trận
  console.log(isPressed)

  if(isPressed) {
    var transMatrix = translation(Tx,Ty)
    var rotateMatrix = rotate((theta*Math.PI)/180, newXCenter, newYCenter)
    var scaleMatrix = scale(Sx, Sy, newXCenter, newYCenter)
    resObjectPoints = transMatrix.transformPoints(objectPoints)
    resObjectPoints = rotateMatrix.transformPoints(resObjectPoints)
    resObjectPoints = scaleMatrix.transformPoints(resObjectPoints)
    
    drawObject(resObjectPoints)
    var tmp = getCenterPoint(resObjectPoints)
    newXCenter = tmp[0]
    newYCenter = tmp [1]
  }
}

class Matrix {

  // mặc định là 3x3
  constructor(row, col) {
    this.col = col
    this.row = row
    this.data = []
    for(let i=0; i<this.row; i++) {
      this.data[i] = []
      for(let j=0; j<this.col; j++){
        this.data[i][j] = 0
      }
    }
  }

  setData(data) {
    this.data = data
  }
    // truyyền vào 2 matrix
    multiply(matrixA, matrixB) {
      if(matrixA.col !== matrixB.row) {
        console.log(matrixA.col, matrixB.row)
        console.log('Error')
      }
  
      let result = new Matrix(matrixA.row, matrixB.col)
      for (let i = 0; i < result.row; i++) {
        for (let j = 0; j < result.col; j++) {
          let sum = 0;
          for (let k = 0; k < matrixA.col; k++) {
            sum += matrixA.data[i][k] * matrixB.data[k][j];
          }
          result.data[i][j] = sum;
        }
      }
      // trả về matrix
      return result.data
    }
  
    // [[1,2], [2,3], ..]
    transformPoints(listPoints)
    {
      let res = []
      for(let i=0; i<listPoints.length; i++) {
        let tmp = listPoints[i].slice()
        tmp.push(1)
        let tmpMatrix = new Matrix(1, 3)
        tmpMatrix.setData([tmp]) 
        let resPoints = this.multiply(tmpMatrix, this)
        res.push(resPoints[0].slice(0,2))
      }
      return res
    }
}


function translation(Tx, Ty) {
  var TranslateMatrix = new Matrix(3,3)
  data = [[1, 0, 0],
          [0, 1, 0],
          [Tx, Ty, 1]]
  TranslateMatrix.setData(data)
  return TranslateMatrix
}

function rotate(theta, xCenter, yCenter) {
  var rotateMatrix = new Matrix (3,3)
  data = [[Math.cos(theta), Math.sin(theta), 0],
          [-Math.sin(theta), Math.cos(theta), 0],
              //  [0, 0, 1]]
          [xCenter - xCenter * Math.cos(theta) + yCenter * Math.sin(theta),
           yCenter - xCenter * Math.sin(theta) - yCenter * Math.cos(theta), 1]]
  rotateMatrix.setData(data)
  return rotateMatrix
}

function scale(Sx, Sy, xCenter, yCenter) {
  var scaleMatrix = new Matrix(3,3)
  data = [[Sx, 0, 0],
          [0, Sy, 0],
          [xCenter - xCenter * Sx, yCenter - yCenter * Sy, 1]]
  scaleMatrix.setData(data)
  return scaleMatrix
}



function main() {
  window.alert('Click to canvas to reset after drawing each time')


}
main()
