var gl;
function initGL(canvas) {
try {
  gl = canvas.getContext("experimental-webgl");
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;
} catch(e) {
}
if (!gl) {
  alert("Could not initialise WebGL, sorry :-(");
}
}


function getShader(gl, id) {
var shaderScript = document.getElementById(id);
if (!shaderScript) {
  return null;
}

var str = "";
var k = shaderScript.firstChild;
while (k) {
  if (k.nodeType == 3) {
	str += k.textContent;
  }
  k = k.nextSibling;
}

var shader;
if (shaderScript.type == "x-shader/x-fragment") {
  shader = gl.createShader(gl.FRAGMENT_SHADER);
} else if (shaderScript.type == "x-shader/x-vertex") {
  shader = gl.createShader(gl.VERTEX_SHADER);
} else {
  return null;
}

gl.shaderSource(shader, str);
gl.compileShader(shader);

if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
  alert(gl.getShaderInfoLog(shader));
  return null;
}

return shader;
}


var shaderProgram;
function initShaders() {
var fragmentShader = getShader(gl, "shader-fs");
var vertexShader = getShader(gl, "shader-vs");

shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
  alert("Could not initialise shaders");
}

gl.useProgram(shaderProgram);

shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}


var mvMatrix;

function loadIdentity() {
mvMatrix = Matrix.I(4);
}


function multMatrix(m) {
mvMatrix = mvMatrix.x(m);
}


function mvTranslate(v) {
var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
multMatrix(m);
}

function mvRotate(ang, v) {
var arad = ang * Math.PI / 180.0;
var m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
multMatrix(m);
}

var pMatrix;
function perspective(fovy, aspect, znear, zfar) {
pMatrix = makePerspective(fovy, aspect, znear, zfar);
}


function setMatrixUniforms() {
gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));
}



function addTexture() {
  gl.enable(gl.TEXTURE_2D);
  cubeTexture = gl.createTexture();
  cubeImage = new Image();
  cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
  cubeImage.src = "cubetexture.png";
}

function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, image, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}