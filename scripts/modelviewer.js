
var ModelViewer = function (opt) {
	this.opt = opt;

	var that = this;
	new M2(opt.file, function (model) { that.parse(model); });
};

ROTATE = [0, 0, 0];
TRANSLATE = [-1.5, 0.0, -7.0];

$(function () {
	var i = 0;
	$('#translate input').each(function () {
		var that = this;
		(function (i) {
			var span = $('span', $(that).parent());
			$(that).change(function () {
				TRANSLATE[i] = $(that).val();
				span.html((+$(that).val()).toFixed(4));
			}).change();
		})(i++);
	});

	i = 0;
	$('#rotate input').each(function () {
		var that = this;
		(function (i) {
			var span = $('span', $(that).parent());
			$(that).change(function () {
				ROTATE[i] = $(that).val();
				span.html((+$(that).val()).toFixed(4));
			}).change();
		})(i++);
	});
});

stop = false;

ModelViewer.prototype = {
	drawScene: function () {
		if (stop) { return; }

		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
		loadIdentity();

		multMatrix(makeLookAt(
			TRANSLATE[0], TRANSLATE[1], TRANSLATE[2],
			ROTATE[0], ROTATE[1], ROTATE[2],
			0, 0, 1));

		// Vertex
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glModel);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.glModel.itemSize, gl.FLOAT, false, 0, 0);

		// Texture Coords
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glTextureCoords);
		gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.glTextureCoords.itemSize, gl.FLOAT, false, 0, 0);

		// Texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(shaderProgram.samplerUniform, 0);

		// Vertex Index
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glVertexIndexBuffer);

		// Draw
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES, this.glVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

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
		/* Vertex */
		var vertices = [];
		for (var i = 0; i < this.model.vertices.length; ++i) {
			for (var j = 0; j < 3; ++j) {
				vertices[i * 3 + j] = this.model.vertices[i].position[j];
			}
		}

		this.glModel = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glModel);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.glModel.itemSize = 3;
		this.glModel.numItems = this.model.vertices.length;

		/* Vertex Index */
		var indices = this.model.views[0].triangles;
		this.glVertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glVertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		this.glVertexIndexBuffer.itemSize = 1;
		this.glVertexIndexBuffer.numItems = indices.length;

		/* Texture Coords */
		var coords = [];
		for (var i = 0; i < this.model.vertices.length; ++i) {
			for (var j = 0; j < 2; ++j) {
				coords[i * 2 + j] = this.model.vertices[i].textureCoords[j];
			}
		}

		this.glTextureCoords = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glTextureCoords);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
		this.glTextureCoords.itemSize = 2;
		this.glTextureCoords.numItems = this.model.vertices.length;

		/* Textures */
		this.createTexture('assets/Item/Objectcomponents/weapon/axe_1h_blacksmithing_d_01.png');
//		this.createTexture('assets/Creature/Arthaslichking/ARTHASLICHKING_V2_01.png');
	},

	createTexture: function (path) {
		var that = this;

		this.texture = gl.createTexture();
		this.texture.image = new Image();
		this.texture.image.onload = function () {
			that.handleLoadedTexture(that.texture);
		}
		this.texture.image.src = path;
	},

	handleLoadedTexture: function (texture) {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
	},

	parse: function (data) {
		this.model = data;
		if (typeof console !== 'undefined') {
			console.log('Parsed Model', data);
			$('textarea')
				.html(JSON.stringify(data, null, 2));
		}
		this.glStart();
	}
};

$(function () {
	model = new ModelViewer({
//		file: 'assets/Character/Scourge/female/scourgefemale.m2'
//		file: 'assets/Item/Objectcomponents/weapon/axe_1h_axe_a_01.m2'
		file: 'assets/Item/Objectcomponents/weapon/axe_1h_blacksmithing_d_01.m2'
//		file: 'assets/Creature/Arthaslichking/arthaslichking_unarmed.m2'
	});
});