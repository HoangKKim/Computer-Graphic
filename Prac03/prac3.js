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

var recPointArr = [];
var startEndPoint = [];
var fourPoints = [];
var cPoints = [];
var controlPoints = [{x: 100, y: 100}, {x:150, y:50}, {x:250, y:150}, {x:300, y:100}]

function drawBezier( p0, p1, p2, p3) {
    var A3x = 3 * (p1.x - p0.x);
    var A2x = 3 * (p2.x - p1.x) - A3x;
    var A0x = p3.x - p0.x -A3x - A2x;
    console.log(p0, p1, p2, p3)
    var A3y = 3 * (p1.y - p0.y);
    var A2y = 3 * (p2.y - p1.y) - A3y;
    var A0y = p3.y - p0.y -A3y - A2y;

    for(let i=0; i<1 ; i += .02) {
        var x = (A0x * Math.pow(i, 3)) + (A2x * Math.pow(i, 2)) + (A3x * i) + p0.x;
        var y = (A0y * Math.pow(i, 3)) + (A2y * Math.pow(i, 2)) + (A3y * i) + p0.y;
        // console.log(x,y);
        if ( x < Math.min(controlPoints[0].x, controlPoints[1].x, controlPoints[2].x, controlPoints[3].x) 
	        || x > Math.max(controlPoints[0].x, controlPoints[1].x, controlPoints[2].x, controlPoints[3].x) 
	        || y < Math.min(controlPoints[0].y, controlPoints[1].y, controlPoints[2].y, controlPoints[3].y) 
	        || y > Math.max(controlPoints[0].y, controlPoints[1].y, controlPoints[2].y, controlPoints[3].y)) {
            continue;
        } else {
            // console.log(x,y)
            cPoints.push({x,y});
            putPixel(x,y,pointColor);
            // cPoints.push(y);
        }
    }
    // return cPoints;
}


function main() {
  let canvasElem = document.querySelector("canvas");
  clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);  
  
  
  for(let i=0; i<controlPoints.length; i++){
    putPixel(controlPoints[i].x, controlPoints[i].y, '(1,0,0,1)');
  }  
  drawBezier(controlPoints[0], controlPoints[1], controlPoints[2], controlPoints[3]);
  console.log(cPoints);


//   let task = parseInt(window.prompt("Please enter the task number: (1, 2, 3, or 4)"
//                       + "\n" + "1.Line" 
//                       + "\n" + "2.Ellipse"
//                       + "\n" + "3.Parabola"
//                       + "\n" + "4.Hyperbola"));

//   console.log(task)
//   switch (task) {
//     case 1:
//       var count=0;
//       var [preX, preY] = []
//       canvasElem.addEventListener("mousedown", function(e)
//       {
//         var [curX, curY] = getMousePosition(canvasElem,e);
//         console.log('cur: ', curX, curY);
//         count++;
//         if(count==2) {
//           console.log('1: ', preX, preY);
//           console.log('2: ', curX, curY);
//           clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);
//           drawMidPoint(preX, preY, curX, curY);
//           count=0;
//         }
//         [preX, preY] = [curX, curY];
//       })    
//       break;

//     case 2: 
//       canvasElem.addEventListener("mousedown", function(e)
//       {
//         var [xCenter, yCenter] = getMousePosition(canvasElem,e);
//         console.log('center: ', xCenter, yCenter);
//         clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);
//         var [longR,shortR]=enterInput(1);
//         drawEllipse(longR, shortR, xCenter, yCenter);
//       })    
//       break;
    
//     case 3: 
//       canvasElem.addEventListener("mousedown", function(e)
//       {
//         var [xCenter, yCenter] = getMousePosition(canvasElem,e);
//         console.log('center: ', xCenter, yCenter);
//         clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);
//         var a = enterInput(2);
//         drawParabola(xCenter, yCenter, a);
//       })  
//       break;
//     default:
//       console.log('rec: ',task);
//       canvasElem.addEventListener("mousedown", function(e)
//       {
//         var [xCenter, yCenter] = getMousePosition(canvasElem,e);
//         console.log('center: ', xCenter, yCenter);
//         clearGL([0,0,0,1], 0, 0, canvas.width, canvas.height);
//         var [a,b] = enterInput(3);
//         console.log('a,b: ',a,b)
//         drawHyperbola(xCenter, yCenter, a, b);
//       })
//       break;
//   }
};

main()