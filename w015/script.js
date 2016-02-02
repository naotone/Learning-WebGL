onload = function(){
  var c = document.getElementById('canvas');
  c.width = 500;
  c.height = 500;

  var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var v_shader = create_shader('vs');
  var f_shader = create_shader('fs');

  // Create program object and generate link for it
  var prg = create_program(v_shader, f_shader);

  // Get attributeLocation
  var attLocation = new Array(2)
  attLocation[0] = gl.getAttribLocation(prg, 'position');
  attLocation[1] = gl.getAttribLocation(prg, 'color');

  // Number of attribute elements
  var attStride = new Array(2);
  attStride[0] = 3;
  attStride[1] = 4;

  var vertex_position = [
       0.0, 1.0, 0.0,
       1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0
  ];

  var vertex_color = [
       1.0, 0.0, 0.0, 1.0,
       0.0, 1.0, 0.0, 1.0,
       0.0, 0.0, 1.0, 1.0
  ];

  var position_vbo = create_vbo(vertex_position);
  var color_vbo = create_vbo(vertex_color);

  gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo);
  gl.enableVertexAttribArray(attLocation[0]);
  gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo);
  gl.enableVertexAttribArray(attLocation[1])
  gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, false, 0, 0);

  // minMatrix.js
  var m = new matIV();
  // init
  var mMatrix = m.identity(m.create());
  var vMatrix = m.identity(m.create());
  var pMatrix = m.identity(m.create());
  var mvpMatrix = m.identity(m.create());

  // Transform view matrices
  m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
  //Transform projection matrices
  m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);

  //Coordinate transformation matrix
  m.multiply(pMatrix, vMatrix, mvpMatrix);
  m.multiply(mvpMatrix, mMatrix, mvpMatrix);

  var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

  gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Re-drawing context
  gl.flush();

  ///Shader//////////////////////////////////////////////////////////////
  function create_shader(id){
    var shader;
    var scriptElement = document.getElementById(id);

    if(!scriptElement){return;}

    switch(scriptElement.type){
      case 'x-shader/x-vertex':
        shader = gl.createShader(gl.VERTEX_SHADER);
        break;
      case 'x-shader/x-fragment':
        shader = gl.createShader(gl.FRAGMENT_SHADER);
        break;
      default:
        return;
    }

    gl.shaderSource(shader, scriptElement.text);
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
      return shader;
    }else{
      console.log(gl.getShaderInfoLog(shader));
    }
  }

  function create_program(vs, fs){
    var program = gl.createProgram();

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    gl.linkProgram(program);

    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
      gl.useProgram(program);
      return program;
    }else{
      console.log(gl.getProgramInfoLog(program));
    }
  }

  function create_vbo(data){
    var vbo = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vbo;
  }

};
