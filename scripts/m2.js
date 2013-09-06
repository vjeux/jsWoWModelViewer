var M2 = function (filename, callback, description_entry) {
	this.filename = filename;
	this.callback = callback;
	this.description_entry = description_entry || 'm2';
	this.load(filename, callback);
	this.requestCount = 0;
}

M2.prototype = {
	typeSet: {
		'jBinary.littleEndian': true,
		'jBinary.all': 'm2',

		/* Common definitions */

		float2: ['array', 'float32', 2],
		float3: ['array', 'float32', 3],
		float4: ['array', 'float32', 4],

		nofs: {
			count: 'uint32',
			offset: 'uint32'
		},

		struct: jBinary.Template({
			baseType: 'nofs',
			params: ['innerType'],
			read: function () {
				var nofs = this.baseRead(),
					type =
						this.innerType === 'char'
						? ['string0', nofs.count]
						: ['array', this.innerType, nofs.count];
				
				return this.binary.read(type, nofs.offset);
			}
		}),

		/* .skin File */

		skin: {
			skinID: 'uint32',
			indices: ['struct', 'uint16'],
			triangles: ['struct', 'uint16'],
			properties: ['struct', 'boneIndices'],
			submeshes: ['struct', 'submesh'],
			textureUnits: ['struct', 'textureUnit'],
			bones: 'uint32'
		},

		boneIndices: ['array', 'uint8', 4],

		submesh: {
			meshID: 'uint32',
			vertices: 'startn',
			triangles: 'startn',
			bones: 'startn',
			unk: 'uint16',
			rootBone: 'uint16',
			boundingBox: ['array', 'float3', 2],
			radius: 'float'
		},

		startn: {
			start: 'uint16',
			n: 'uint16'
		},

		textureUnit: {
			flags: 'uint16',
			shading: 'uint16',
			submeshIndex: 'uint16',
			submeshIndex2: 'uint16',
			colorIndex: 'int16',
			renderFlags: 'uint16',
			texUnitNumber: 'uint16',
			mode: 'uint16',
			texture: 'uint16',
			texUnitNumber2: 'uint16',
			transparency: 'uint16',
			textureAnim: 'uint16'
		},

		/* M2 File */

		m2: {
			tag: ['string', 4],
			version: 'uint32',
			name: ['struct', 'char'],
			globalModelFlag: 'uint32',

			globalSequences: ['struct', 'uint16'],
			animations: ['struct', 'animation'],
			animationLookup: ['struct', 'uint16'],
			bones: ['struct', 'bone'],
			keyBoneLookup: ['struct', 'uint16'],
			vertices: ['struct', 'vertex'],
			views: 'views',
			colors: ['struct', 'color'],
			textures: ['struct', 'texture'],
			transparencyLookup: ['struct', 'uint16'],
			uvAnimation: ['struct', 'uvAnimation'],
			texReplace: ['struct', 'int16'],
			renderFlags: ['struct', 'renderFlag'],
			boneLookup: ['struct', 'uint16'],
			texLookup: ['struct', 'uint16'],
			texUnits: ['struct', 'int16'],
			transLookup: ['struct', 'uint16'],
			uvAnimLookup: ['struct', 'uint16'],
			vertexBox: ['array', 'float3', 2],
			vertexRadius: 'float',
			boundingBox: ['array', 'float3', 2],
			boundingRadius: 'float',
			boundingTriangles: ['struct', 'boundingTriangle'],
			boundingVertices: ['struct', 'boundingVertex'],
			boundingNormals: ['struct', 'boundingNormal'],
			attachments: ['struct', 'attachment'],
			attachLookup: ['struct', 'uint16'],
			events: ['struct', 'event'],
			lights: ['struct', 'light'],
			cameras: ['struct', 'camera'],
			cameraLookup: ['struct', 'uint16'],
			ribbonEmitters: ['struct', 'ribbonEmitter'],
			particleEmitters: ['struct', 'particleEmitter']
		},

		views: jBinary.Type({
			read: function () {
				var m2 = this.binary.getContext(1);
				var num = this.binary.read('uint32');
				var views = [];
				num = 1; // fix
				for (var i = 0; i < num; ++i) {
					m2.pushRequest();
					(function (i, filename) {
						new M2(filename,
							function (skin) {
								views[i] = skin;
								m2.popRequest();
							},
							'skin'
						);
					})(i, m2.filename.replace(/\.m2$/, '0' + i + '.skin'));
				}
				return views;
			}
		}),

		animation: {
			animationID: 'uint16',
			subAnimationID: 'uint16',
			length: 'uint32',
			movingSpeed: 'float',
			flags: 'uint32',
			probability: 'int16',
			unk1: 'uint16',
			unk2: 'uint32',
			unk3: 'uint32',
			playbackSpeed: 'uint32',
			minimumExtent: 'float3',
			maximumExtent: 'float3',
			boundRadius: 'float',
			nextAnimation: 'int16',
			index: 'uint16'
		},

		animationBlock: {
			interpolationType: 'uint16',
			globalSequenceID: 'int16',
			timestamps: 'nofs',
			keyFrame: 'nofs'
		},

		fakeAnimationBlock: {
			timestamps: 'nofs',
			keyFrame: 'nofs'
		},

		bone: {
			keyBoneID: 'int32',
			flags: 'uint32',
			parentBone: 'int16',
			unk: ['array', 'uint16', 3],
			translation: 'animationBlock',
			rotation: 'animationBlock',
			scaling: 'animationBlock',
			pivot: 'float3'
		},

		vertex: {
			position: 'float3',
			boneWeight: ['array', 'uint8', 4],
			boneIndices: ['array', 'uint8', 4],
			normal: 'float3',
			textureCoords: 'float2',
			unk: 'float2'
		},

		color: {
			color: 'animationBlock',
			alpha: 'animationBlock'
		},

		texture: {
			type: 'uint32',
			flags: 'uint32',
			filename: ['struct', 'char']
		},

		uvAnimation: {
			translation: 'animationBlock',
			rotation: 'animationBlock',
			scaling: 'animationBlock'
		},

		renderFlag: {
			flags: 'uint16',
			blendingMode: 'uint16'
		},

		ribbonEmitter: {
			unk1: 'uint32',
			boneID: 'uint32',
			position: 'float3',
			textures: 'nofs',
			blendRef: 'nofs',
			color: 'animationBlock',
			opacity: 'animationBlock',
			above: 'animationBlock',
			below: 'animationBlock',
			resolution: 'float',
			length: 'float',
			emissionAngle: 'float',
			renderFlags: 'uint32',
			unk2: 'animationBlock',
			unk3: 'animationBlock',
			unk4: 'uint32'
		},

		boundingTriangle: ['array', 'uint16', 3],
		boundingNormal: 'float3',
		boundingVertex: 'float3',

		attachment: {
			attachmentID: 'uint32',
			boneID: 'uint32',
			position: 'float3',
			data: 'animationBlock'
		},

		event: {
			name: ['string', 4],
			data: 'uint32',
			boneID: 'uint32',
			position: 'float3',
			interpolationType: 'uint16',
			globalSequence: 'uint16',
			timestamp: 'nofs'
		},

		light: {
			type: 'uint16',
			boneID: 'int16',
			position: 'float3',
			ambiantColor: 'animationBlock',
			ambientIntensity: 'animationBlock',
			diffuseColor: 'animationBlock',
			diffuseIntensity: 'animationBlock',
			attenuationStart: 'animationBlock',
			attenuationEnd: 'animationBlock',
			unk: 'animationBlock'
		},

		camera: {
			type: 'uint32',
			fov: 'float',
			farClipping: 'float',
			nearClipping: 'float',
			translationPos: 'animationBlock',
			position: 'float3',
			translationTar: 'animationBlock',
			target: 'float3',
			scaling: 'animationBlock'
		},

		particleEmitter: {
			unk1: 'uint32',
			flags1: 'uint16',
			flags2: 'uint16',
			position: 'float3',
			boneID: 'uint16',
			textureID: 'uint16',
			modelFilename: ['struct', 'char'],
			particleFilename: ['struct', 'char'],
			blendingType: 'uint8',
			emitterType: 'uint8',
			particleColor: 'uint16',
			particleType: 'uint8',
			headOrTail: 'uint8',
			textureTileRotation: 'uint16',
			textureRows: 'uint16',
			textureCols: 'uint16',
			emissionSpeed: 'animationBlock',
			speedVariation: 'animationBlock',
			verticalRange: 'animationBlock',
			horizontalRange: 'animationBlock',
			gravity: 'animationBlock',
			lifespan: 'animationBlock',
			unk2: 'uint32',
			emissionRate: 'animationBlock',
			unk3: 'uint32',
			emissionAreaLength: 'animationBlock',
			emissionAreaWidth: 'animationBlock',
			gravity2: 'animationBlock',
			particleColor: 'fakeAnimationBlock',
			particleOpacity: 'fakeAnimationBlock',
			particleSize: 'fakeAnimationBlock',
			unk4: 'uint32',
			intensity: 'fakeAnimationBlock',
			unk5: 'fakeAnimationBlock',
			unk6: 'float3',
			scale: 'float3',
			slowdown: 'float',
			unk7: 'float2',
			rotation: 'float',
			unk8: 'float3',
			rotation1: 'float3',
			rotation2: 'float3',
			translation: 'float3',
			unk9: 'float4',
			unk10: 'nofs',
			enabledIn: 'animationBlock'
		}
	},

	load: function (filename) {
		var that = this;
//		console.log(filename);
		jBinary.load(filename, this.typeSet, function (err, binary) { 
			if (err) throw err;
			that.pushRequest();
			that.model = binary.inContext(that, function () { return this.read(that.description_entry) });
			that.popRequest();
		});
	},

	pushRequest: function () {
		this.requestCount += 1;
	},

	popRequest: function () {
		this.requestCount -= 1;
		if (this.requestCount === 0) {
			this.callback(this.model);
		}
	},
};
