
var ModelViewer = function (opt) {
	this.opt = opt;

	var that = this;
	new M2(opt.file, function (model) { that.parse(model); });
};

ROTATE = 0;
TRANSLATE = [0, 0, -6];

ModelViewer.prototype = {
	drawScene: function () {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		perspective(45, 1.0, 0.1, 100.0);
		loadIdentity();
		mvTranslate(TRANSLATE);
		mvRotate(-90, [1, 0, 0]);
		mvRotate(45, [0, 0, 1]);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.glModel);
		gl.vertexAttribPointer(vertexPositionAttribute, this.glModel.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glColors);
		gl.vertexAttribPointer(vertexColorAttribute, this.glColors.itemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, this.glModel.numItems);
	},

	glStart: function () {
		var canvas = document.getElementById("glSurface");
		initGL(canvas);
		initShaders();
		this.createGLModel();

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		var that = this;
		setInterval(function () { that.drawScene(); }, 15);
	},

	createGLModel: function () {
		var vertices = [];
		var colors = [];
		for (var i = 0; i < this.model.vertices.length; ++i) {
			for (var j = 0; j < 3; ++j) {
				vertices[i * 3 + j] = this.model.vertices[i].position[j];
				colors[i * 3 + j] = Math.random();
			}
			colors[i * 3 + 3] = Math.random();
		}

		this.glModel = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glModel);
		gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(vertices), gl.STATIC_DRAW);
		this.glModel.itemSize = 3;
		this.glModel.numItems = this.model.vertices.length;

		this.glColors = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glColors);
		gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(colors), gl.STATIC_DRAW);
		this.glColors.itemSize = 4;
		this.glColors.numItems = this.model.vertices.length;
	},

	parse: function (data) {
		this.model = data;
		console.log(data);
		this.glStart();
	}
};

$(function () {
	var model = new ModelViewer({
		file: 'assets/scourgefemale.m2'
	});
});
