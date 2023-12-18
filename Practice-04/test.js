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
  
  function putpixel(x, y, rgba) {
    /*======= Defining and storing the geometry ======*/
    x = (x - canvas.width / 2) / (canvas.width / 2)
    y = -(y - canvas.height / 2) / (canvas.height / 2)
    //normalized x, y
    var vertices = [
      x, y, 0
      //0.5, 0.5, 0
    ];
    
    var colors = rgba;
  
      //create empty buffer object and store {} data
    var vertex_buffer = verticesToBuffer(vertices);
    var color_buffer = colorsToBuffer(colors);
  
    var vertCode =
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
      '}';
  
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertCode);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragCode);
    var program = createProgram(gl, vertexShader, fragmentShader);
  
    gl.useProgram(program);
    sendVertexBufferToProgram(program, vertex_buffer);
    sendColorBufferToProgram(program, color_buffer);
  
    // use this to put pixel
    gl.drawArrays(gl.POINTS, 0, 1);
  }
  
  //============================================
  const canvas = document.getElementById("gl_Canvas");
  var gl = canvas.getContext("webgl");
  
  var colorBlack = [0, 0, 0];
  var colorYellow = [1, 1, 0];
  var colorWhite = [1, 1, 1];
  
  if (!gl) {
    console.log("Warning");
  }
  //Tuần 2
  function get2ParasForEllipse() 
  {
    var A = window.prompt("Enter the first radius");
    var B = window.prompt("Enter the second radius");
    
    //parseInt -> Int
    return [parseInt(A), parseInt(B)];
  }
  
  function LineMidPoint(x1, y1, x2, y2, rgba) {
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
      putpixel(x, y, rgba);
      for (i = x1; i < x2; i++) {
        if (p < 0)
          p += Const11;
        else {
          p += Const12;
          y++;
        }
        x++;
        putpixel(x, y, rgba);
      }
    } 
    
    else if (m > 1) //case 2 
    {
      p = 2 * Dx - Dy;
      putpixel(x, y);
      for (i = y1; i < y2; i++) {
        if (p < 0)
          p += Const21;
        else {
          p += Const22;
          x++;
        }
        y++;
        putpixel(x, y, rgba);
      }
    } 
    
    else if (-1 <= m && m <= 0) //case 3
    {
      p = 2 * Dy + Dx;
      putpixel(x, y, rgba);
      for (i = x1; i < x2; i++) {
        if (p < 0)
          p += Const31;
        else {
          p += Const32;
          y--;
        }
        x++;
        putpixel(x, y, rgba);
      }
    }
    
    else if (m < -1) //case 4
     {
       p = 2 * Dx + Dy;
       putpixel(x, y, rgba);
       for (i = y1; i > y2; i--) {
         if (p < 0)
           p -= Const41;
         else {
           p -= Const42;
           x++;
         }
         y--;
         putpixel(x, y, rgba);
       }
     }
  }
  
  var clicked = 0;
  var x1, y1, x2, y2;
  function drawLineEvent(e) {
      if (clicked == 0) 
      {
          //get first point
        [x1, y1] = getMousePosition(canvas, e);
        putpixel(x1, y1, colorBlack);
        clicked = 1;
      } else if (clicked == 1) {
          //get 2nd point and then draw
        [x2, y2] = getMousePosition(canvas, e);
        LineMidPoint(x1, y1, x2, y2, colorBlack);
        clicked = 2;
      }
      else {
          //reset clicked and then clear
          clicked = 0;
        clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
      }
  }
  
  function drawLine() {
      clicked = 0;
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
    
      //canvas.removeEventListener("click", drawLineEvent);
    canvas.removeEventListener("click", drawEllipseEvent);
    canvas.removeEventListener("click", drawParabolaEvent);
    canvas.removeEventListener("click", drawHyperbolaEvent);
    
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
    
    canvas.removeEventListener("mousedown", mouseDownRec);
    canvas.removeEventListener("mousemove", mouseMoveRec);
    canvas.removeEventListener("mouseup", mouseUpRec);
    
    canvas.addEventListener("click", drawLineEvent);
  }
  
  function Put4Pixel(x, y, A, B) {
    putpixel(x, y, colorBlack); //top left
    putpixel(x, B * 2 - y, colorBlack); //bottom left
    putpixel(A * 2 - x, y, colorBlack); //top right
    putpixel(A * 2 - x, B * 2 - y, colorBlack); //top bottom
  }
  
  var centerX, centerY;
  function drawEllipseEvent(e) {
      if (clicked == 0) 
    {
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
  
      Put4Pixel(x + centerX, y + centerY, centerX, centerY);
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
  
        Put4Pixel(x + centerX, y + centerY, centerX, centerY);
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
  
      Put4Pixel(x + centerX, y + centerY, centerX, centerY);
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
        Put4Pixel(x + centerX, y + centerY, centerX, centerY);
      }
      clicked = 1;
    }
      else {
      //reset clicked and then clear
      clicked = 0;
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
    }
  }
  
  function DrawEllipse() {
      clicked = 0;
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
  
    var centerX, centerY;
      canvas.removeEventListener("click", drawLineEvent);
    //canvas.removeEventListener("click", drawEllipseEvent);
    canvas.removeEventListener("click", drawParabolaEvent);
    canvas.removeEventListener("click", drawHyperbolaEvent);
    
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
    
    canvas.removeEventListener("mousedown", mouseDownRec);
    canvas.removeEventListener("mousemove", mouseMoveRec);
    canvas.removeEventListener("mouseup", mouseUpRec);
    
    canvas.addEventListener("click", drawEllipseEvent);
  }
  
  //helper function for parabolamidpoint
  function Put2PixelPa(x1, y1, x, y) {
      putpixel(x1 + x, y1 + y, colorBlack);
    putpixel(x1 + x, y1 - y, colorBlack);
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
  
  function drawParabolaEvent(e)
  {
    //console.log(clicked);
    if (clicked == 0) {
      [x1, y1] = getMousePosition(canvas, e);
      putpixel(x1, y1, colorBlack);
      clicked = 1;
    }
    else if (clicked == 1) {
      var maxX = window.prompt("Enter the range for X (be small or you have to wait...)");
      ParabolaMidPoint(x1, y1, maxX);
      clicked = 2;
    }
    else 
    {
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
      clicked = 0;
    }
  }
  
  function DrawParabola() {
      clicked = 0;
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
    
      canvas.removeEventListener("click", drawLineEvent);
    canvas.removeEventListener("click", drawEllipseEvent);
    //canvas.removeEventListener("click", drawParabolaEvent);
    canvas.removeEventListener("click", drawHyperbolaEvent);
    
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
    
    canvas.removeEventListener("mousedown", mouseDownRec);
    canvas.removeEventListener("mousemove", mouseMoveRec);
    canvas.removeEventListener("mouseup", mouseUpRec);
    
    canvas.addEventListener("click", drawParabolaEvent);
  }
  
  function Put2PixelHy(x, y, x1, y1) {
    putpixel(x1 + x, y1 + y, colorBlack);
    putpixel(x1 + x, y1 - y, colorBlack);
    putpixel(x1 - x, y1 - y, colorBlack);
    putpixel(x1 - x, y1 + y, colorBlack);
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
  
  //Show pixel hyperbol
  function showPixel(x1, y1, a, b, c, d) {
      putpixel(x1, y1, colorBlack);
    putpixel(a, b, colorBlack);
    putpixel(c, d, colorBlack);
    LineMidPoint(x1, y1, a, b, colorYellow);
    LineMidPoint(x1, y1, c, d, colorYellow);
  }
  
  //Hyperbol
  var a, b, c, d, x1, y1;
  var maj_axis, min_axis;
  function drawHyperbolaEvent(e) {
    //console.log(clicked);
    if (clicked == 0) 
    {
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
      
      showPixel(x1, y1, a, b, c, d)
      
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
      }
      
      console.log(maj_axis, min_axis);
    
        clicked = 3;
    }
    
    else 
    {
      clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
      clicked = 0;
    }	
  }
  
  function DrawHyperbola() {
      clicked = 0;
    clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
  
      canvas.removeEventListener("click", drawLineEvent);
    canvas.removeEventListener("click", drawEllipseEvent);
    canvas.removeEventListener("click", drawParabolaEvent);
    //canvas.removeEventListener("click", drawHyperbolaEvent);
    
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
    
    canvas.removeEventListener("mousedown", mouseDownRec);
    canvas.removeEventListener("mousemove", mouseMoveRec);
    canvas.removeEventListener("mouseup", mouseUpRec);
    
    canvas.addEventListener("click", drawHyperbolaEvent);
  }
  
  //Tuần 3
  var clicked = 0;
  var x0, x1, x2, x3;
  var y0, y1, y2, y3;
  
  //thuật toán bezier bậc 2 sử dụng phương pháp của bậc 3 để suy ra.
  function Bezier3controlpts_Alg(x0, y0, x1, y1, x2, y2) {
      // Plot các control points
    putpixel(x0, y0, colorYellow);
    putpixel(x1, y1, colorYellow);
    putpixel(x2, y2, colorYellow);
    
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
    
    x += dx; y += dy;//
    putpixel(x, y, colorBlack);//
    //console.log(dx, dy, ddx, ddy);
    
    //Loop
    for (var i = 2; i <= step; i++) {
      x += dx; y += dy;
      dx += ddx; dy += ddy;
      putpixel(Math.round(x), Math.round(y), colorBlack);
    }
    
    //Plot điểm control cuối
    putpixel(x2, y2, colorBlack);
  }
  
  //hỗ trợ lấy điểm
  function drawBezierEvent_3(e) {
    //console.log(clicked);
    if (clicked == 0) 
    {
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
      
        clicked = 3;
    }
    
    else
    {
        clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
      clicked = 0;
    }
  }
  
  //Thuật toán bezier bậc 3 buổi lý thuyết ngày 6 tháng 11, 2023
  function Bezier4controlpts_Alg(x0, y0, x1, y1, x2, y2, x3, y3) {
      // Plot các control points
    putpixel(x0, y0, colorYellow);
    putpixel(x1, y1, colorYellow);
    putpixel(x2, y2, colorYellow);
    putpixel(x3, y3, colorYellow);
  
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
    console.log('dt', dt);
    
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
    
    x += dx; y += dy;
    dx += ddx; dy += ddy;
    
    //console.log(dx, dy, ddx, ddy, dddx, dddy);
    
    putpixel(x, y, colorBlack);
    
    //Bắt đầu loop
    for (var i = 2; i <= step; i++) {
      x += dx; y += dy;
      dx += ddx; dy += ddy;
      ddx += dddx; ddy += dddy;
      putpixel(Math.round(x), Math.round(y), colorBlack);
    }
    
    //Plot điểm control cuối
    putpixel(x3, y3, colorBlack);
  }
  
  // hỗ trợ lấy điểm
  function drawBezierEvent_4(e) {
    //console.log(clicked);
    if (clicked == 0) 
    {
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
        putpixel(x2, y2, colorWhite);
          
        clicked = 3;
    }
    
    else if (clicked == 3)
    {
          //4th point
      [x3, y3] = getMousePosition(canvas, e);
      
          //code goes here
      Bezier4controlpts_Alg(x0, y0, x1, y1, x2, y2, x3, y3);
      
          clicked = 4;
    }
    else
    {
        clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
      clicked = 0;
    }
  }
  
  //
  function drawBezier() {
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
    
    canvas.removeEventListener("mousedown", mouseDownRec);
    canvas.removeEventListener("mousemove", mouseMoveRec);
    canvas.removeEventListener("mouseup", mouseUpRec);
    
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
  ///////
  
  //psuedo code building coef of spline
  // xs: mảng tọa độ chứa x
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
        putpixel(Math.round(xHold), Math.round(Pj), colorBlack);
      }
    }
  }
  
  function drawSpline() {
    clicked = 0;
    clearGL([0, 0.4, 0, 1], 0, 0, canvas.width, canvas.height);
    
    canvas.removeEventListener("click", drawLineEvent);
    canvas.removeEventListener("click", drawEllipseEvent);
    canvas.removeEventListener("click", drawParabolaEvent);
    canvas.removeEventListener("click", drawHyperbolaEvent);
    
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
    
    canvas.removeEventListener("mousedown", mouseDownRec);
    canvas.removeEventListener("mousemove", mouseMoveRec);
    canvas.removeEventListener("mouseup", mouseUpRec);
    
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
        
              drawSplineProcess(matCoef, xS);   
      }
    });
  }
  
  //Tuần 4
  //Vì hàm get context chỉ được dùng khởi tạo 1 lần ngay đầu và nếu gọi lần thứ 2 sẽ trả về cái đầu tiên
  //https://www.html5canvastutorials.com/tutorials/html5-canvas-element/
  //Và nếu muốn giữ được object draw với webgl thì phải dùng đến get context preserveDrawingBuffer: true
  //https://webgl2fundamentals.org/webgl/lessons/webgl-tips.html - preventing the canvas being cleared
  //=> Không thể vẽ xong và crop - sẽ bị mất
  var x0, y0, x1, y1, xmove, ymove;
  var started = false
  function mouseDownRec(e) {
      console.log("Down");
    started = true;
      [x0, y0] = getMousePosition(canvas, e);
  }
  
  function mouseMoveRec(e) {
      if (!started) {
        return false;
    }
    [xmove, ymove] = getMousePosition(canvas, e);
    
    drawRectangle(x0, y0, xmove, ymove);
  }
  
  function mouseUpRec(e) {
      console.log("Up");
    started = false;
      [x1, y1] = getMousePosition(canvas, e);
    fillRectangle(x0, y0, x1, y1);
  }
  
  var xA, yA, xB, yB, xC, yC, xD, yD;
  function drawRectangle(x1, y1, x2, y2) {
    [xA, yA] = [x1, y1];
    [xB, yB] = [x1, y2];
    [xC, yC] = [x2, y2];
    [xD, yD] = [x2, y1];
      LineMidPoint(xA, yA, xB, yB, colorWhite);
    LineMidPoint(xB, yB, xC, yC, colorWhite);
    LineMidPoint(xC, yC, xD, yD, colorWhite);
    LineMidPoint(xA, yA, xD, yD, colorWhite);
  }
  
  function fillRectangle(x1, y1, x2, y2) {
  /* 	for (let i = Math.min(x1, x2); i < Math.max(x1, x2); i++) {
          for (let j = Math.min(y1, y2); j < Math.max(y1, y2); j++) {
            putpixel(i, j, colorWhite);
          }
        } */
    
    for (let j = Math.min(y1, y2); j < Math.max(y1, y2); j++) {
      LineMidPoint(x1, j, x2, j, colorWhite);
    }
  }
  
  function cropRectangle() {
      //No clear
    clicked = 0;
    
      canvas.removeEventListener("click", drawLineEvent);
    canvas.removeEventListener("click", drawEllipseEvent);
    canvas.removeEventListener("click", drawParabolaEvent);
    canvas.removeEventListener("click", drawHyperbolaEvent);
  
    canvas.removeEventListener("click", drawBezierEvent_3);
    canvas.removeEventListener("click", drawBezierEvent_4);
      
    canvas.addEventListener("mousedown", mouseDownRec);
    canvas.addEventListener("mousemove", mouseMoveRec);
    canvas.addEventListener("mouseup", mouseUpRec);
  }