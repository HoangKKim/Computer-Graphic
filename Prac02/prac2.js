var canvas = document.getElementById('gl_Canvas');
var gl = canvas.getContext('webgl');  
var pointColor = '(0,0,0,0)' 

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

// draw line 
function drawMidPoint(x1, y1, x2, y2) {
  // this function works with condition is: x1<x2
  if(x1>x2) {
    [x1,x2] = [x2,x1];
    [y1,y2] = [y2,y1];
  }

  var Dx = x2 -x1;
  var Dy = y2 - y1;
  
  var const1 = 2*Dy;
  var const2 = 2*(Dy - Dx);
  var const3 = 2*Dx;
  var const4 = 2*(Dx-Dy)
  var const5 = 2*-Dy;
  var const6 = 2*(-Dy-Dx);
  var x= x1;
  var y=y1;
  putPixel(x,y,pointColor);
  
  // check the slope m
  var m = Dy/Dx;
  // 0 <= m <= 1
  if(0 <= m && m <= 1){   // case 1
    let p = 2*Dy - Dx;
    for(let i=x1; i<x2; i++) {
      if(p<0) {
        p += const1;
      } else {
        p +=const2;
        y++;
      }
      x++;
      putPixel(x,y,pointColor)
    }
  } else if (m>1) {   //  case2
    let p = 2*Dx - Dy
    for(let i=y1; i<y2; i++){
      if(p<0){
        p += const3;
      } else {
        p += const4;
        x++;
      }
      y++;
      putPixel( x, y, pointColor);
    }
  } else if(-1<= m && m<=0 ) {    // case3
    let p = 2*Dy + Dx;
    for(let i=x1; i<x2; i++) {
      if(p<0) {
        p += const5;
      } else {
        p+= const6;
        y--;
      }
      x++;
      putPixel( x, y, pointColor);
    }    
  } else {    // case4
    var const7 = 2*-Dx;
    var const8 = 2*(-Dx-Dy);
    p = 2*Dx + Dy;
    for (i = y1; i > y2; i--) {
      if (p < 0) {
        p -= const7;
      }
      else {
        p -= const8;
        x++;
      }
      y--;
      putPixel(x,y, pointColor)
    }
  }
}


function put4Pixel(x,y, xCenter, yCenter) {
  x+=xCenter;
  y+=yCenter;
  putPixel( x, y, pointColor);
  putPixel( x, yCenter*2-y, pointColor);
  putPixel( xCenter*2-x, y, pointColor);
  putPixel( xCenter*2-x, yCenter*2-y, pointColor);
}

// draw ellipse
// A, B: long-short radius
function drawEllipse(A, B, xCenter, yCenter)
{
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
}

function put2Pixel(x,y, xCenter, yCenter) {
  x = x+xCenter;
  y = y+yCenter;
  putPixel( x, y, pointColor);
  // putPixel( x, 2*yCenter -y, pointColor);
  putPixel(2*xCenter - x, y, pointColor )
}

// draw parabola
function drawParabola(xCenter, yCenter, a) {
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

// function drawXParabol(xCenter, yCenter, a) {
//   var y = 0;
//   var x = 0;

//   var const1 = 2*x+3;
//   var const2 = 2*x+3-4*a;
//   var p = 1-2*a;
//   // putPixel(gl, x+xCenter, y+yCenter, color);
//   while(x<= a) {
//     put2Pixel(x,y, xCenter, yCenter)
//     if(p<0) {
//       p+= const1;
//     } else {
//       p+= const2;
//       y++;
//     }
//     x++;
//   }

//   p = 1/4-4*a;
//   var const3 = -4*a;
//   // putPixel(gl, x+xCenter, y+yCenter, color);
//   for(let i=0; i<100; i++) {
//     put2Pixel(x,y, xCenter, yCenter)
//     if(p>0) {
//       p += const3;
//     } else {
//       p+= 2+ 2*x + const3;
//       x++;
//     }
//     y++;
//     // putPixel(gl, x+xCenter, y+yCenter, color);
//   }
// }

function drawHyperbola(xCenter, yCenter, a, b) {
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


function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return [x,y]
}

function enterInput(choose) {
  switch (choose) {
    case 1:
      let longR = window.prompt("Please enter long radius");
      let shortR = window.prompt('Please enter short radius');
      console.log(longR, shortR);
      return [parseInt(longR), parseInt(shortR)];
    case 2:
      var a = window.prompt('Please enter coefficient of the quadratic term (a)');
      console.log(a);
      return parseInt(a);  
    default:
      var a = window.prompt('Please enter major axis (a)');
      let b = window.prompt('Please enter minor axis (b)');
      return [parseInt(a),parseInt(b)];
  }
}

function main() {
  let canvasElem = document.querySelector("canvas");
  clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);


  let task = parseInt(window.prompt("Please enter the task number: (1, 2, 3, or 4)"
                      + "\n" + "1.Line" 
                      + "\n" + "2.Ellipse"
                      + "\n" + "3.Parabola"
                      + "\n" + "4.Hyperbola"));

  console.log(task)
  switch (task) {
    case 1:
      var count=0;
      var [preX, preY] = []
      canvasElem.addEventListener("mousedown", function(e)
      {
        var [curX, curY] = getMousePosition(canvasElem,e);
        console.log('cur: ', curX, curY);
        count++;
        if(count==2) {
          console.log('1: ', preX, preY);
          console.log('2: ', curX, curY);
          clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);
          drawMidPoint(preX, preY, curX, curY);
          count=0;
        }
        [preX, preY] = [curX, curY];
      })    
      break;

    case 2: 
      canvasElem.addEventListener("mousedown", function(e)
      {
        var [xCenter, yCenter] = getMousePosition(canvasElem,e);
        console.log('center: ', xCenter, yCenter);
        clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);
        var [longR,shortR]=enterInput(1);
        drawEllipse(longR, shortR, xCenter, yCenter);
      })    
      break;
    
    case 3: 
      canvasElem.addEventListener("mousedown", function(e)
      {
        var [xCenter, yCenter] = getMousePosition(canvasElem,e);
        console.log('center: ', xCenter, yCenter);
        clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);
        var a = enterInput(2);
        drawParabola(xCenter, yCenter, a);
      })  
      break;
    default:
      console.log('rec: ',task);
      canvasElem.addEventListener("mousedown", function(e)
      {
        var [xCenter, yCenter] = getMousePosition(canvasElem,e);
        console.log('center: ', xCenter, yCenter);
        clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);
        var [a,b] = enterInput(3);
        console.log('a,b: ',a,b)
        drawHyperbola(xCenter, yCenter, a, b);
      })
      break;
  }
};

main()