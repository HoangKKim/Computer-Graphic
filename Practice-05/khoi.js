//get mouse pos
function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return [x, y];
  }
  
  //===============================================
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
    
    //attach vertex shader
    gl.attachShader(program, vertexShader);
    
    //attach fragment shader
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
  
  function colorsToBuffer(colors) {
    // Create an empty buffer object and store color data
    var color_buffer = gl.createBuffer();
    
    //Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return color_buffer;
  }
  
  function sendVertexBufferToProgram(program, VertexBuffer) {
    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
  
    // Get the attribute location
    var coord = gl.getAttribLocation(program, "coordinates");
  
    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
  
    // Enable the attribute
    gl.enableVertexAttribArray(coord);
  }
  
  function sendColorBufferToProgram(program, ColorBuffer) {
    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    
    // get the attribute location
    var color = gl.getAttribLocation(program, "color");
    
    // point attribute to the volor buffer object
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0) ;
    
    // enable the color attribute
    gl.enableVertexAttribArray(color);
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
  
  var vertCode =
      'attribute vec3 coordinates;' +
      //'attribute vec3 color;' +
      //'varying vec3 vColor;' +
  
      'void main(void) {' +
      'gl_Position = vec4(coordinates, 1.0);' +
      'gl_PointSize = 2.0;' +
      //'vColor = color;' +
      '}';
  
  var fragCode =
      //'precision mediump float;'+
      //'varying vec3 vColor;' +
      
      'void main(void) {' +
      'gl_FragColor = vec4(1, 1, 0, 0.5);' +//1,1,1,0
      '}';
  
  function putpixel(x, y, colors) {
    /*======= Defining and storing the geometry ======*/
    x = (x - canvas.width / 2) / (canvas.width / 2)
    y = -(y - canvas.height / 2) / (canvas.height / 2)
    //normalized x, y
    var vertices = [
      x, y, 0
      //0.5, 0.5, 0
    ];
    
      //create empty buffer object and store {} data
    var vertex_buffer = verticesToBuffer(vertices);
    //var color_buffer = colorsToBuffer(colors);
    
    //vert code, frag code
  /*   var vertCode =
      'attribute vec3 coordinates;' +
      'attribute vec3 color;' +
      'varying vec3 vColor;' +
    
      'void main(void) {' +
      'gl_Position = vec4(coordinates, 1.0);' +
      'gl_PointSize = 2.0;' +
      'vColor = color;' +
      '}';
    
      var fragCode =
      'precision mediump float;'+
      'varying vec3 vColor;' +
      
      'void main(void) {' +
      'gl_FragColor = vec4(vColor, 0.5);' +//1,1,1,0
      '}'; */
  
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertCode);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragCode);
    var program = createProgram(gl, vertexShader, fragmentShader);
  
    gl.useProgram(program);
    sendVertexBufferToProgram(program, vertex_buffer);
    //sendColorBufferToProgram(program, color_buffer);
  
    // use this to put pixel
    gl.drawArrays(gl.POINTS, 0, 1);
  }
  
  //==============
  const canvas = document.getElementById("gl_Canvas");
  var gl = canvas.getContext("webgl");
  
  var colorBlack = [0, 0, 0];
  var colorYellow = [1, 1, 0];
  var colorWhite = [1, 1, 1];
  
  //khởi tạo biến toàn cục lưu lại tất cả các pixel đã put
  var myarr = []
  
  if (!gl) {
    console.log("Warning");
  }
  
  //Keydown-week5
  var centerX_matrix = 0;
  var centerY_matrix = 0;
  var alphaR = 5; // quay 5 độ mỗi lần quay
  var alphaT = 1; // dịch 1 pixel
  function keydownFunction(e) {
      //console.log(e.key);
      //dành cho rotate
      if (e.key === 'l') {
        //rotate left 1 angle
      var rotationAroundPointMatrix = Matrix.rotationAroundPoint(alphaR*Math.PI/180, centerX_matrix, centerY_matrix);
      myarr = Matrix.transformPoints(rotationAroundPointMatrix, myarr);
    }
    if (e.key === 'r') {
        //rotate right 1 angle
      var rotationAroundPointMatrix = Matrix.rotationAroundPoint(-alphaR*Math.PI/180, centerX_matrix, centerY_matrix);
      myarr = Matrix.transformPoints(rotationAroundPointMatrix, myarr);
    }
  
    var tx = 0;
    var ty = 0;
    var alphaSx = 1; //mặc định scaleX
    var alphaSy = 1; //mặc định scaleY
    
      switch (event.keyCode) {
        //dành cho translate
      case 37:
        //alert('Left key'); tx - 1
              tx = -1;
        ty = 0;
        break;
      case 38:
        //alert('Up key'); ty + 1
        ty = 1;
        tx = 0;
        break;
      case 39:
        //alert('Right key'); tx + 1
        tx = 1;
        ty = 0;
        break;
      case 40:
        //alert('Down key'); ty - 1
        ty = -1;
        tx = 0;
        break;
        
      //dành cho scale
      case 107: //plus
      case 187:
              alphaSx = 1.1;
        alphaSy = 1.1;
        
        break;
      case 111: //minus
      case 189:
              alphaSx = 0.9;
        alphaSy = 0.9;
  
        break;
      default:
          break;
    }
    var translateMatrix = Matrix.translation(tx*alphaT, ty*alphaT);
    myarr = Matrix.transformPoints(translateMatrix, myarr);
    
    var scalingMatrix = Matrix.scalingKeepPoint(alphaSx, alphaSy, centerX_matrix, centerY_matrix);
    myarr = Matrix.transformPoints(scalingMatrix, myarr);
    
    putPixelFromArray(myarr);
  }
  
  //Line
  var clicked = 0;
  var x1, y1, x2, y2;
  function LineMidPoint(x1, y1, x2, y2, color) {
      //swap if x1 > x2 
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
    }
    
       Dx = x2 - x1;
    Dy = y2 - y1;
      Const11 = 2 * Dy;
    Const12 = 2 * (Dy - Dx);
    
    Const21 = 2 * Dx;
    Const22 = 2 * (Dx - Dy);
    
    Const31 = 2 * -Dy;
    Const32 = 2 * (-Dy - Dx);
    
    Const41 = 2 * -Dx;
    Const42 = 2 * (-Dx - Dy);
    
    x = x1;
    y = y1;
    let m = Dy / Dx;
      
    if (0 <= m && m <= 1) //case 1
    {
      p = 2 * Dy - Dx;
      putpixel(x, y, color);
      myarr.push([x, y]);
      for (i = x1; i < x2; i++) {
        if (p < 0)
          p += Const11;
        else {
          p += Const12;
          y++;
        }
        x++;
        putpixel(x, y, color);
        myarr.push([x, y]);
      }
    } 
    
    else if (m > 1) //case 2 
    {
      p = 2 * Dx - Dy;
      putpixel(x, y, color);
      myarr.push([x, y]);
      for (i = y1; i < y2; i++) {
        if (p < 0)
          p += Const21;
        else {
          p += Const22;
          x++;
        }
        y++;
        putpixel(x, y, color);
        myarr.push([x, y]);
      }
    } 
    
    else if (-1 <= m && m <= 0) //case 3
    {
      p = 2 * Dy + Dx;
      putpixel(x, y, color);
      myarr.push([x, y]);
      for (i = x1; i < x2; i++) {
        if (p < 0)
          p += Const31;
        else {
          p += Const32;
          y--;
        }
        x++;
        putpixel(x, y, color);
        myarr.push([x, y]);
      }
    }
    
    else if (m < -1) //case 4
     {
       p = 2 * Dx + Dy;
       putpixel(x, y, color);
       myarr.push([x, y]);
       for (i = y1; i > y2; i--) {
         if (p < 0)
           p -= Const41;
         else {
           p -= Const42;
           x++;
         }
         y--;
         putpixel(x, y, color);
         myarr.push([x, y]);
       }
     }
  }
  function drawLineEvent(e) {
      if (clicked == 0) 
      {
          //get first point
        myarr = [];
        [x1, y1] = getMousePosition(canvas, e);
        putpixel(x1, y1, colorWhite);
        clicked = 1;
      } else if (clicked == 1) {
          //get 2nd point and then draw
        [x2, y2] = getMousePosition(canvas, e);
        LineMidPoint(x1, y1, x2, y2, colorWhite);
        
        //get middlePoint and assign to global variable center x, center y
        middlePoint = myarr[Math.round((myarr.length - 1) / 2)];
        [centerX_matrix, centerY_matrix] = middlePoint;
        
        canvas.addEventListener("keydown", keydownFunction);
        
        clicked = 2;
      }
      else {
          //reset clicked and then clear
        canvas.removeEventListener("keydown", keydownFunction);

        clicked = 0;
        clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
      }
  }
  function drawLine() {
      canvas.removeEventListener("keydown", keydownFunction);
      [centerX_matrix, centerY_matrix] = [0, 0];
      myarr = [];
      clicked = 0;
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
    
      //canvas.removeEventListener("click", drawLineEvent);
    canvas.removeEventListener("click", drawEllipseEvent);
    canvas.removeEventListener("click", drawParabolaEvent);
    canvas.removeEventListener("click", drawHyperbolaEvent);
    
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
    
    canvas.addEventListener("click", drawLineEvent);
  }
  
  //Ellipse
  var centerX_Ellipse, centerY_Ellipse;
  function get2ParasForEllipse() {
    var A = window.prompt("Enter the first radius");
    var B = window.prompt("Enter the second radius");
    
    //parseInt -> Int
    return [parseInt(A), parseInt(B)];
  }
  function Put4PixelEllipse(x, y, A, B) {
    putpixel(x, y, colorBlack); //top left
    putpixel(x, B * 2 - y, colorBlack); //bottom left
    putpixel(A * 2 - x, y, colorBlack); //top right
    putpixel(A * 2 - x, B * 2 - y, colorBlack); //top bottom
    myarr.push([x, y]);
    myarr.push([x, B * 2 - y]);
    myarr.push([A * 2 - x, y]);
    myarr.push([A * 2 - x, B * 2 - y]);
  }
  function drawEllipseEvent(e) {
      if (clicked == 0) 
    {
        myarr = [];
      [centerX, centerY] = getMousePosition(canvas, e);
      var [A, B] = get2ParasForEllipse();
      var A2, B2, p, Const1, Const2, Delta1, Delta2, x, y, MaxX, MaxY;
      A2 = A * A;
      B2 = B * B;
      MaxX = Math.floor(A2 / Math.sqrt(A2 + B2));
      MaxY = Math.floor(B2 / Math.sqrt(A2 + B2));
      // (0, B) -> (MaxX, MaxY)
      p = B2 - A2 * B + A2 / 4;
      Const1 = 2 * B2;
      Const2 = 2 * A2;
  
      x = 0;
      y = B;
      Delta1 = B2 * (2 * x + 3);
      // Delta1 = B2*3 since x=0
      Delta2 = 2 * A2 * (1 - y) + B2 * (2 * x + 3);
      // Delta2 = 2*A2*(1-B)+Delta1 since x=0, y=B
  
      Put4PixelEllipse(x + centerX, y + centerY, centerX, centerY);
      while (x < MaxX) {
        if (p >= 0) {
          p += Delta2;
          Delta2 += Const2;
          y--;
        } else
          p += Delta1;
        Delta2 += Const1;
        Delta1 += Const1;
        x++;
  
        Put4PixelEllipse(x + centerX, y + centerY, centerX, centerY);
      }
      // (A, 0) -> (MaxX, MaxY)
      p = A2 - A * B2 + B2 / 4;
      Const1 = 2 * A2;
      Const2 = 2 * B2;
      x = A;
      y = 0;
      Delta1 = A2 * (2 * y + 3);
      // Delta1 = A2*3 since y=0
      Delta2 = 2 * B2 * (1 - x) + A2 * (2 * y + 3);
      // Delta2 = 2*B2*(1-A)+A2*3 since x=A, y=0
  
      Put4PixelEllipse(x + centerX, y + centerY, centerX, centerY);
      while (y < MaxY) 
      {
        if (p >= 0) {
          p += Delta2;
          Delta2 += Const2;
          x--;
        } else
          p += Delta1;
  
        Delta2 += Const1;
        Delta1 += Const1;
        y++;
        Put4PixelEllipse(x + centerX, y + centerY, centerX, centerY);
      }
      centerX_matrix = centerX;
      centerY_matrix = centerY;
      canvas.addEventListener("keydown", keydownFunction);
      
      clicked = 1;
    }
      else {
      //reset clicked and then clear
      canvas.removeEventListener("keydown", keydownFunction);
      
      clicked = 0;
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
    }
  }
  function DrawEllipse() {
      canvas.removeEventListener("keydown", keydownFunction);
      [centerX_matrix, centerY_matrix] = [0, 0];
      myarr = [];
      clicked = 0;
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
  
    var centerX, centerY;
      canvas.removeEventListener("click", drawLineEvent);
    //canvas.removeEventListener("click", drawEllipseEvent);
    canvas.removeEventListener("click", drawParabolaEvent);
    canvas.removeEventListener("click", drawHyperbolaEvent);
    
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
    
    canvas.addEventListener("click", drawEllipseEvent);
  }
  
  //Parabol
  function Put2PixelPa(x1, y1, x, y) {
      putpixel(x1 + x, y1 + y, colorBlack);
    putpixel(x1 + x, y1 - y, colorBlack);
    myarr.push([x1 + x, y1 + y]);
    myarr.push([x1 + x, y1 - y]);
  }
  function ParabolaMidPoint(x1, y1, a) {
      var p = 1 - 2*a;
    var x = 0, y = 0;
    
    while (y <= 2*a) {
        Put2PixelPa(x1, y1, x, y);
      if (p < 0) 
      {
          p += 3 + 2*y;
      }
      else 
      {
          p += 3 + 2*y - 2*a;
        x++;
      }
      y++;
    }
    
    p = 1/4 - 2*a;
    while (x <= 2*a) {
        Put2PixelPa(x1, y1, x, y);
      if (p > 0)
      {
          p += -4*a;
      }
      else 
      {
          p += 2 + 2*y -4*a;
        y++;
      }
      x++;
    }
  }
  function drawParabolaEvent(e) {
    //console.log(clicked);
    if (clicked == 0) {
        myarr = [];
      [x1, y1] = getMousePosition(canvas, e);
      putpixel(x1, y1, colorBlack);
      clicked = 1;
    }
    else if (clicked == 1) {
      var maxX = window.prompt("Enter the range for X (be small or you have to wait...)");
      ParabolaMidPoint(x1, y1, maxX);
      
      [centerX_matrix, centerY_matrix] = [x1, y1];
      canvas.addEventListener("keydown", keydownFunction);
      
      clicked = 2;
    }
    else 
    {
        canvas.removeEventListener("keydown", keydownFunction);
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
      clicked = 0;
    }
  }
  function DrawParabola() {
      canvas.removeEventListener("keydown", keydownFunction);
      [centerX_matrix, centerY_matrix] = [0, 0];
      myarr = [];
      clicked = 0;
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
    
      canvas.removeEventListener("click", drawLineEvent);
    canvas.removeEventListener("click", drawEllipseEvent);
    //canvas.removeEventListener("click", drawParabolaEvent);
    canvas.removeEventListener("click", drawHyperbolaEvent);
    
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
    
    canvas.addEventListener("click", drawParabolaEvent);
  }
  
  //Hyperbol
  var a, b, c, d, x1, y1;
  var maj_axis, min_axis;
  function Put2PixelHy(x, y, x1, y1) {
    putpixel(x1 + x, y1 + y, colorBlack);
    putpixel(x1 + x, y1 - y, colorBlack);
    putpixel(x1 - x, y1 - y, colorBlack);
    putpixel(x1 - x, y1 + y, colorBlack);
    myarr.push([x1 + x, y1 + y]);
    myarr.push([x1 + x, y1 - y]);
    myarr.push([x1 - x, y1 - y]);
    myarr.push([x1 - x, y1 + y]);
  }
  function HyperbolaBresenham(x1, y1, a, b) {
    var x, y;
    x = a;
    y = 0;
    
    //d = 2a^2 - 2ab^2 - b^2
    var d = 2*a*a - 2*a*b*b - b*b;
    
    //y <= x*b^2/a^2
    while(y <= b*b*x/(a*a))
    {
      Put2PixelHy(x, y, x1, y1);
      if(d <= 0)
      {
        d += 2*a*a*(2*y + 3);
      }
      else
      {
        d += 2*a*a*(2*y+3) - 4*b*b*(x + 1) ;
        x++;
      }
      y++;
    }
    
    var init = 100;
    while(init--)
    {
      Put2PixelHy(x, y, x1, y1);
      if(d <= 0)
      {
        d += 2*b*b*(3 + 2*x);
      }
      else
      {
        d += 2*b*b*(3 + 2*x) - 4*a*a*(y + 1);
        y++;
      }
      x++;
    }
  }
  //Show lines
  /* function showPixel(x1, y1, a, b, c, d) {
    putpixel(x1, y1, colorBlack);
    putpixel(a, b, colorBlack);
    putpixel(c, d, colorBlack);
    LineMidPoint(x1, y1, a, b, colorYellow);
    LineMidPoint(x1, y1, c, d, colorYellow);
  } */
  function drawHyperbolaEvent(e) {
    //console.log(clicked);
    if (clicked == 0) 
    {
        myarr = [];
      [x1, y1] = getMousePosition(canvas, e);
      putpixel(x1, y1, colorBlack);
      
      clicked = 1;
    }
    else if (clicked == 1) 
    {
         [a, b] = getMousePosition(canvas, e);
      putpixel(a, b, colorBlack);
  
      maj_axis = Math.sqrt(Math.pow((a - x1), 2) + Math.pow((b - y1), 2));
      
      clicked = 2;
    }
    else if (clicked == 2) {
        [c, d] = getMousePosition(canvas, e);
      
      //showPixel(x1, y1, a, b, c, d)
      
      min_axis=Math.sqrt(Math.pow((c - x1), 2)+Math.pow((d - y1), 2));
      if (maj_axis < min_axis) 
      {
          var tmp = maj_axis;
        maj_axis = min_axis;
        min_axis = tmp;
      }
      
      if (maj_axis == min_axis) 
      {
          //can't be
      }
      
      else
      {
        HyperbolaBresenham(x1, y1, maj_axis, min_axis);
        
        [centerX_matrix, centerY_matrix] = [x1, y1];
        canvas.addEventListener("keydown", keydownFunction);
      }
      
      //console.log(maj_axis, min_axis);
    
        clicked = 3;
    }
    
    else 
    {
        canvas.removeEventListener("keydown", keydownFunction);
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
      clicked = 0;
    }	
  }
  function DrawHyperbola() {
      canvas.removeEventListener("keydown", keydownFunction);
      [centerX_matrix, centerY_matrix] = [0, 0];
      myarr = [];
      clicked = 0;
    clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
  
      canvas.removeEventListener("click", drawLineEvent);
    canvas.removeEventListener("click", drawEllipseEvent);
    canvas.removeEventListener("click", drawParabolaEvent);
    //canvas.removeEventListener("click", drawHyperbolaEvent);
    
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
    
    canvas.addEventListener("click", drawHyperbolaEvent) 
  }
  
  //Bezier
  var x0, x1, x2, x3;
  var y0, y1, y2, y3;
  //thuật toán bezier bậc 2
  function Bezier3controlpts_Alg(x0, y0, x1, y1, x2, y2) {
  /* 	// Plot các control points
        putpixel(x0, y0, colorYellow);
        putpixel(x1, y1, colorYellow);
        putpixel(x2, y2, colorYellow); */
    
    //Tính các giá trị ban đầu
    var A0x = x0 - 2*x1 + x2;
    var A1x = 2*(x1 - x0)
    var Mx = 3*Math.abs(A0x) + Math.abs(A1x);
    
    var A0y = y0 - 2*y1 + y2;
    var A1y = 2*(y1 - y0);
    var My = 3*Math.abs(A0y) + Math.abs(A1y);
    
    //Tính dt
    var dt = 1/Math.max(Mx, My);
    //console.log(dt)
    
    //Các giá trị sai phân tiến
    var dx = A0x*Math.pow(dt, 2) + A1x*dt;
    var ddx = 2*A0x*Math.pow(dt, 2);
    
    var dy = A0y*Math.pow(dt, 2) + A1y*dt;
    var ddy = 2*A0y*Math.pow(dt, 2);
    
    //Tính số bước
    var step = Math.round(1/dt);
    //console.log(step)
    
      //Plot 2 điểm đầu tiên
    var x, y;
    x = x0; y = y0;
    putpixel(x, y, colorBlack);
    myarr.push([x, y]);
    
    x += dx; y += dy;
    putpixel(x, y, colorBlack);
    myarr.push([x, y]);
  
    //Loop
    for (var i = 2; i <= step; i++) {
      x += dx; y += dy;
      dx += ddx; dy += ddy;
      tocheck = [Math.round(x), Math.round(y)];
          const find = JSON.stringify(myarr).includes(JSON.stringify(tocheck));
      if (find) {
          //pass
        //console.log("item is in");
      }
      else {
          //add
        putpixel(Math.round(x), Math.round(y), colorBlack);
          myarr.push([Math.round(x), Math.round(y)]);
      }
    }
    
    //Plot điểm control cuối
    putpixel(x2, y2, colorBlack);
    myarr.push([x2, y2]);
  }
  //hỗ trợ lấy điểm bậc 2 - 3 điểm
  function drawBezierEvent_3(e) {
    //console.log(clicked);
    if (clicked == 0) 
    {
        myarr = [];
      //1st point
      [x0, y0] = getMousePosition(canvas, e);
      putpixel(x0, y0, colorWhite);
    
      clicked = 1;
    }
    else if (clicked == 1) 
    {
      //2nd point
      [x1, y1] = getMousePosition(canvas, e);
      putpixel(x1, y1, colorWhite);
      
      clicked = 2;
    }
    else if (clicked == 2) 
    {    
        //3rd point
      [x2, y2] = getMousePosition(canvas, e);
  
          //code goes here
      Bezier3controlpts_Alg(x0, y0, x1, y1, x2, y2);
      
      middlePoint = myarr[Math.round((myarr.length - 1) / 2)];
      [centerX_matrix, centerY_matrix] = middlePoint;
      canvas.addEventListener("keydown", keydownFunction);
      
        clicked = 3;
    }
    
    else
    {
      canvas.removeEventListener("keydown", keydownFunction);
        clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
      clicked = 0;
    }
  }
  //Thuật toán bezier bậc 3
  function Bezier4controlpts_Alg(x0, y0, x1, y1, x2, y2, x3, y3) {
  /* 	// Plot các control points
        putpixel(x0, y0, colorYellow);
        putpixel(x1, y1, colorYellow);
        putpixel(x2, y2, colorYellow);
        putpixel(x3, y3, colorYellow); */
  
      //Tính các giá trị ban đầu
    var A0x = -(x0 - 3*x1 + 3*x2 - x3);
    var A1x = 3*(x0 - 2*x1 + x2);
    var A2x = -3*x0 +3*x1;
       var Mx = 7*Math.abs(A0x) + 3*Math.abs(A1x) + Math.abs(A2x);
    
    var A0y = -(y0 - 3*y1 + 3*y2 - y3);
    var A1y = 3*(y0 - 2*y1 + y2);
    var A2y = -3*y0 + 3*y1;
       var My = 7*Math.abs(A0y) + 3*Math.abs(A1y) + Math.abs(A2y);
    
    //Tính dt
    var dt = 1/Math.max(Mx, My);
    //console.log('dt', dt);
    
       //Các giá trị sai phân tiến
    var dx = A0x*Math.pow(dt, 3) + A1x*Math.pow(dt, 2) + A2x * dt;
    var ddx = 6*A0x*Math.pow(dt, 3) + 2*A1x*Math.pow(dt, 2);
    var dddx = 6*A0x*Math.pow(dt, 3);
    
    var dy = A0y*Math.pow(dt, 3) + A1y*Math.pow(dt, 2) + A2y * dt;
    var ddy = 6*A0y*Math.pow(dt, 3) + 2*A1y*Math.pow(dt, 2);
    var dddy = 6*A0y*Math.pow(dt, 3);
    
    //Tính bước
    var step = Math.round(1/dt);
    //console.log('step', step);
    
    //Plot các điểm đầu tiên
    var x, y;
    x = x0; y = y0;
    putpixel(x, y, colorBlack);
    myarr.push([x, y]);
    
    x += dx; y += dy;
    dx += ddx; dy += ddy;
    
    //console.log(dx, dy, ddx, ddy, dddx, dddy);
    
    putpixel(x, y, colorBlack);
    myarr.push([x, y]);
    
    //Bắt đầu loop
    for (var i = 2; i <= step; i++) {
      x += dx; y += dy;
      dx += ddx; dy += ddy;
      ddx += dddx; ddy += dddy;
      //https://stackoverflow.com/questions/61167382/best-way-to-check-if-some-coordinate-is-contained-in-an-array-javascript
      tocheck = [Math.round(x), Math.round(y)];
          const find = JSON.stringify(myarr).includes(JSON.stringify(tocheck));
      if (find) {
          //pass
        //console.log("item is in");
      }
      else {
          //add
        putpixel(Math.round(x), Math.round(y), colorBlack);
          myarr.push([Math.round(x), Math.round(y)]);
      }
    }
    
    //Plot điểm control cuối
    putpixel(x3, y3, colorBlack);
    myarr.push([x3, y3]);
  }
  // hỗ trợ lấy điểm bậc 3 - 4 điểm
  function drawBezierEvent_4(e) {
    //console.log(clicked);
    if (clicked == 0) 
    {
      //1st point
      myarr = [];
      [x0, y0] = getMousePosition(canvas, e);
      putpixel(x0, y0, colorWhite);
      
      clicked = 1;
    }
    else if (clicked == 1) 
    {
      //2nd point
      [x1, y1] = getMousePosition(canvas, e);
      putpixel(x1, y1, colorWhite);
      
      clicked = 2;
    }
    else if (clicked == 2) 
    {    
        //3rd point
      [x2, y2] = getMousePosition(canvas, e);
        putpixel(x2, y2, colorWhite);
          
        clicked = 3;
    }
    
    else if (clicked == 3)
    {
          //4th point
      [x3, y3] = getMousePosition(canvas, e);
      
          //code goes here
      Bezier4controlpts_Alg(x0, y0, x1, y1, x2, y2, x3, y3);
      
      middlePoint = myarr[Math.round((myarr.length - 1) / 2)];
      [centerX_matrix, centerY_matrix] = middlePoint;
      canvas.addEventListener("keydown", keydownFunction);
      
          clicked = 4;
    }
    else
    {
        canvas.removeEventListener("keydown", keydownFunction);
        clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
      clicked = 0;
    }
  }
  function drawBezier() {
    canvas.removeEventListener("keydown", keydownFunction);
      [centerX_matrix, centerY_matrix] = [0, 0];
      myarr = [];
    clicked = 0;
    clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
    var n_control_points = window.prompt("Enter number control points (3 or 4)");
    
    while (n_control_points != 3 && n_control_points != 4) {
        n_control_points = window.prompt("Please enter number control points (must be 3 or 4)");
    }
    canvas.removeEventListener("click", drawLineEvent);
    canvas.removeEventListener("click", drawEllipseEvent);
    canvas.removeEventListener("click", drawParabolaEvent);
    canvas.removeEventListener("click", drawHyperbolaEvent);
    
      if (n_control_points == 3) {
        //vẽ bezier 3 điểm (bậc 2)
      canvas.removeEventListener("click", drawBezierEvent_4);
      
        canvas.addEventListener("click", drawBezierEvent_3);
    }
    else {
        //vẽ bezier 4 điểm (bậc 3)
      canvas.removeEventListener("click", drawBezierEvent_3);
      
        canvas.addEventListener("click", drawBezierEvent_4);
    }
  }
  
  //Spline
  //psuedo code building coef of spline
  // xs: mảng tọa độ chứa xhttps://jsfiddle.net/9jxt2d46/28/#
  // yx:                  y
  function buildSplineEquations(xs, ys) {
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
  //Lấy ma trận hệ số để tìm ra p0, p1...
  function drawSplineProcess(matCoef, xS) {
      //Khởi tạo mảng ps 2 chiều để lấy ra a, b, c, d mỗi 4 phần tử
    var index = 0
    var ps = [];
    ps.push([]);
    for (let i = 0; i < matCoef.length; i++)
    {
      if(i%4 == 0 && i != 0) 
      {
        ps.push([])
        index++;
      }
      ps[index].push(matCoef[i]);
    }
  
      //bắt đầu vẽ
    for (let i = 0; i < ps.length; i++) 
    {
        //Pj có thể hiểu là y
      var Pj;
      var deltaX = 0.2
          
      //chỉ hoạt động khi mảng xS tăng dần vì nó đi qua tất cả các điểm trong xS (và cả yS)
      //Không đảm bảo tính liên tục trong lân cận 8
      for (let xHold = xS[i]; xHold <= xS[i+1]; xHold += deltaX) 
      {
        //a b c d
        Pj = ps[i][0]*Math.pow(xHold, 3) + ps[i][1]*Math.pow(xHold, 2) +
          ps[i][2]*xHold + ps[i][3];
        //console.log(Pj);
        
        tocheck = [Math.round(xHold), Math.round(Pj)];
        const find = JSON.stringify(myarr).includes(JSON.stringify(tocheck));
        if (find) {
          //pass
          //console.log("item is in");
        }
        else {
          //adding
          putpixel(Math.round(xHold), Math.round(Pj), colorBlack);
          myarr.push([Math.round(xHold), Math.round(Pj)]);
        }
      }
    }
  }
  function drawSpline() {
      [centerX_matrix, centerY_matrix] = [0, 0];
      myarr = [];
    clicked = 0;
    clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
    
    canvas.removeEventListener("click", drawLineEvent);
    canvas.removeEventListener("click", drawEllipseEvent);
    canvas.removeEventListener("click", drawParabolaEvent);
    canvas.removeEventListener("click", drawHyperbolaEvent);
    
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
    
    var n_control_points = window.prompt("Enter number of control points (>= 2)");
    
    while (n_control_points < 2) {
         var n_control_points = window.prompt("Please enter number of control points (>= 2)");
    }
    
    var xS = [];
    var yS = [];
      
    canvas.addEventListener("click", function(e) {
          var [x, y] = getMousePosition(canvas, e);
      
      if (xS.length == 0 || x > xS[xS.length - 1]) {
          xS.push(x);
        yS.push(y);
        putpixel(x, y, colorBlack);
        
        n_control_points--;
      }
      else {
          window.alert("only accept larger X");
        [x, y] = getMousePosition(canvas, e);
      }
      
      if (n_control_points == 0) {
          //reset myarr
        myarr = [];
        this.removeEventListener('click', arguments.callee, false);
        //console.log("hi, it's ended")
        //console.log(xS, yS);
        
        //gọi hàm
        var [matA, b] = buildSplineEquations(xS, yS);
        
        var inv_MatA = math.inv(matA);
            //ma trận hệ số x = a^-1 * b
                var matCoef = math.multiply(inv_MatA, b);
    
            //pix = aix^3 + bix^2 + cix + d
            //a0 b0 c0 d0 a1 b1 c1 d1 ...
            //console.log(matCoef);
        
        //bắt đầu vẽ
              drawSplineProcess(matCoef, xS);
        //đã vẽ xong
        
           middlePoint = myarr[Math.round((myarr.length - 1) / 2)];
        [centerX_matrix, centerY_matrix] = middlePoint;
        
        canvas.addEventListener("keydown", keydownFunction);
      }
    });
  }
  
  //Tuần 5
  //put pixel from array of points
  function putPixelFromArray(arr) {
      for (var pixel of arr) {
        if (typeof pixel[1] == undefined) continue;
      else
            putpixel(Math.round(pixel[0]), Math.round(pixel[1]));
    }
  }
  class Matrix {
    constructor(rows, cols, data = null) {
      this.rows = rows;
      this.cols = cols;
      this.data = data || this.generateZeros(rows, cols);
    }
  
    generateZeros(rows, cols) {
      const zeros = [];
      for (let i = 0; i < rows; i++) {
        zeros.push(new Array(cols).fill(0));
      }
      return zeros;
    }
    
    //multiply 2 matrixes
    static multiply(matrixA, matrixB) {
      if (matrixA.cols !== matrixB.rows) {
        throw new Error('Number of columns in the first matrix must be equal to the number of rows in the second matrix for multiplication.');
      }
  
      const result = new Matrix(matrixA.rows, matrixB.cols);
  
      for (let i = 0; i < matrixA.rows; i++) {
        for (let j = 0; j < matrixB.cols; j++) {
          let sum = 0;
          for (let k = 0; k < matrixA.cols; k++) 
          {
            sum += matrixA.data[i][k] * matrixB.data[k][j];
          }
          result.data[i][j] = sum;
        }
      }
  
      return result;
    }
  
      //print
    printMatrix() {
      //console.table(this.data);
      console.log(this.data);
    }
    
    static translation(tx, ty) {
      return new Matrix(3, 3, [
        [1, 0, tx],
        [0, 1, ty],
        [0, 0, 1],
      ]);
    }
  
    static rotation(angleInRadians) {
      const cos = Math.cos(angleInRadians);
      const sin = Math.sin(angleInRadians);
      return new Matrix(3, 3, [
        [cos, -sin, 0],
        [sin, cos, 0],
        [0, 0, 1],
      ]);
    }
  
      static rotationAroundPoint(angleInRadians, centerX = 0, centerY = 0) {
      const translationToOrigin = Matrix.translation(-centerX, -centerY);
      const rotationMatrix = Matrix.rotation(angleInRadians);
      const translationBack = Matrix.translation(centerX, centerY);
  
          //áp dụng affine nhiều lần
      return translationBack.affineTransformation(rotationMatrix.affineTransformation(translationToOrigin));
    }
  
    static scaling(sx, sy) {
      return new Matrix(3, 3, [
        [sx, 0, 0],
        [0, sy, 0],
        [0, 0, 1],
      ]);
    }
    
    static scalingKeepPoint(scaleX = 1, scaleY = 1, centerX = 0, centerY = 0) {
      const translationToOrigin = Matrix.translation(-centerX, -centerY);
      const scalingMatrix = Matrix.scaling(scaleX, scaleY);
      const translationBack = Matrix.translation(centerX, centerY);
  
      return translationBack.affineTransformation(scalingMatrix.affineTransformation(translationToOrigin));
    }
    
    // Apply an affine transformation to an array of points
    static transformPoints(matrix, points) {
      if (matrix.rows != matrix.cols || matrix.rows < 2) {
        throw new Error('Affine transformation matrix must be a square matrix of size at least 2x2.');
      }
  
      const result = [];
      for (const point of points) {
        if (point.length != 2) {
          throw new Error('Each point must be a 2D vector.');
        }
  
        const transformedPoint = matrix.affineTransformation(Matrix.fromArray([...point, 1])).toArray().slice(0, 2);
        //console.log("point", point);
        //console.log("transPoints", transformedPoint);
        result.push(transformedPoint);
      }
  
      return result;
    }
    
    // Apply an affine transformation to the current matrix
    affineTransformation(transformationMatrix) {
        //console.log(transformationMatrix);
      if (transformationMatrix.rows !== this.cols) {
          //console.log(transformationMatrix.rows, this.cols)
        throw new Error('The number of columns in the transformation matrix must be equal to the number of rows in the original matrix.');
      }
  
      const result = new Matrix(this.rows, transformationMatrix.cols);
  
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < transformationMatrix.cols; j++) {
          let sum = 0;
          for (let k = 0; k < this.cols; k++) {
            sum += this.data[i][k] * transformationMatrix.data[k][j];
          }
          result.data[i][j] = sum;
        }
      }
  
      return result;
    }
    
    transpose1x3() {
        //console.log("inp", this);
      const result = new Matrix(this.cols, this.rows, [[this.data[0]], [this.data[1]], [this.data[2]]]);
          
      //console.log("final", result)
      return result;
    }
    
    // Convert a 2D array to a Matrix instance
    static fromArray(arr) {
        arr = [arr]
      const rows = arr.length;
      const cols = arr[0].length;
      const data = arr.flat();
  
      return new Matrix(rows, cols, data).transpose1x3();
    }
  
    // Convert the matrix to a 2D array
    toArray() {
      const result = [];
      for (let i = 0; i < this.rows; i++) {
        result.push(this.data.slice(i * this.cols, (i + 1) * this.cols));
      }
      return result.flat().flat();
    }
  }