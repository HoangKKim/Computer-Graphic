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
  putPixel(x1,y1, '(1,0,0,1)');

  // m>1
  var p;
  if(dx>dy) {
    console.log('1');
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
    console.log('2')
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
  putPixel(x2,y2, '(1,0,0,1)')
}

// center = 100, r1 = 20, r2 = 40
// function drawStar(xCenter, yCenter, r1, r2) {
//     var x = 0;
//     var y = r2;

//     putPixel(x+xCenter,y+yCenter, pointColor);


// }

function drawStar(xCenter, yCenter, r1, r2) {
    let theta = 0;
    let alpha = (2 * Math.PI) / 10;

    // Tính toán tọa độ của các đỉnh
    let vertices = [];

    // putPixel
    for (let i = 0; i < 10; i++) {
        let x, y;
        if (i % 2 === 0) {
            x = xCenter + r1 * Math.cos(theta + i * alpha);
            y = yCenter + r1 * Math.sin(theta + i * alpha);
        } else {
            x = xCenter + r2 * Math.cos(theta + i * alpha);
            y = yCenter + r2 * Math.sin(theta + i * alpha);
        }
        putPixel(x,y, "(0,1,1,1)");
        vertices.push({x,y});
    }
    vertices.push(vertices[0]);
    return vertices;
}


function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return [x,y]
}

function main() {
    let canvasElem = document.querySelector("canvas");
    clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);

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
        drawCircle(preX, preY, curX, curY);
        count=0;
      }
      [preX, preY] = [curX, curY];
    })   
    // putPixel(200,200, '(1,0,0,1)')
    // var vertices = drawStar(200,200, 50, 100)
    // console.log(vertices);
    // // drawMidPoint(vertices)
    // console.log(vertices[0].x, vertices[0].y)
    // console.log(vertices[1].x, vertices[1].y)
    //     drawMidPoint(Math.round(vertices[0].x), Math.round(vertices[0].y), Math.round(vertices[1].x), Math.round(vertices[1].y));

    // for (let i=0; i<vertices.length-1; i++) {
    //     drawMidPoint(Math.round(vertices[i].x), Math.round(vertices[i].y), Math.round(vertices[i+1].x), Math.round(vertices[i+1].y));

    //     // drawMidPoint(vertices[i].x, vertices[i].y, vertices[i+1].x, vertices[i+1].y);
    // }

}

main()