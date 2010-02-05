
var M2 = function (filename, callback, description_entry) {
	this.filename = filename;
	this.callback = callback;
	this.description_entry = description_entry;
	this.load(filename, callback);
}

M2.prototype = {
	load: function (filename) {
		var that = this;
		$.get(filename, function (data) { that.parse(data); }, "binary" );
	},

	parse: function (data) {
		var reader = new BinaryReader(data);
		var parser = new BinaryParser(reader, this.description, this);
		this.callback(parser.parse(this.description_entry));
	},

	description: {
		/* Common definitions */
		
		bmp: {
			tag: ['string', 2],
			fileSize: 'uint32',
			unused: 'uint32',
			dataStart: 'uint32',
			headerSize: 'uint32',
			width: 'uint32',
			height: 'uint32',
			colorPlanes: 'uint16',
			colorsPerPixel: 'uint16',
			compression: 'uint32',
			rawSize: 'uint32',
			horizontalResolution: 'uint32',
			verticalResolution: 'uint32',
			colors: 'uint32',
			meanColors: 'uint32',
			pixels: ['array', 'pixelRow', function (config) { return config.data.height; }]
		},
		
		pixelRow: 
		
	}
};