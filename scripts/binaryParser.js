
var BinaryParser = function (binaryReader, description, caller) {
	this.binaryReader = binaryReader;

	this.description = BinaryParser.stdDescription;
	for (var i in description) {
		this.description[i] = description[i];
	}

	this.caller = caller;

	var that = this;
	this.param = {
		parse: function (desc, param) { return that.parse(desc, param); },
		binaryReader: binaryReader
	};
};

BinaryParser.stdDescription = {
	uint8:	function (config) { return config.binaryReader.getUint8.call(config.binaryReader, undefined, true); },
	int8:	function (config) { return config.binaryReader.getInt8.call(config.binaryReader,  undefined, true); },
	uint16: function (config) { return config.binaryReader.getUint16.call(config.binaryReader, undefined, true); },
	int16:	function (config) { return config.binaryReader.getInt16.call(config.binaryReader, undefined, true); },
	uint32: function (config) { return config.binaryReader.getUint32.call(config.binaryReader, undefined, true); },
	int32:	function (config) { return config.binaryReader.getInt32.call(config.binaryReader, undefined, true); },
	float:	function (config) { return config.binaryReader.getFloat32.call(config.binaryReader, undefined, true); },
	char:	function (config) { return config.binaryReader.getChar.call(config.binaryReader, undefined, true); },
	string: function (config, size) { return config.binaryReader.getString.call(config.binaryReader, undefined, size); },
	array:	function (config, type, number) {
		var num_type = typeof number;
		var k = num_type === 'number' ? number
			  : num_type === 'function' ? number(config)
			  : 0;
		
		var array = [];
		for (var i = 0; i < k; ++i) {
			array[i] = config.parse(type);
		}
		return array;
	}
};

BinaryParser.prototype = {
	parse: function (description, param) {
		var that = this;
		var type = typeof description;

		if (type === 'function') {
			return description.apply(this.caller,
				[this.param].concat(param));
		}

		// Shortcut: 'string' == ['string']
		if (type === 'string') {
			description = [description];
		}

		if (description instanceof Array) {
			return this.parse(this.description[description[0]], description.slice(1));
		}

		if (type === 'object') {
			var output = {};
			for (var key in description) {
				if (!description.hasOwnProperty(key)) {
					continue;
				}
				output[key] = this.parse(description[key]);
			}
			return output;
		}

		throw new Error('Unknown description type ' + description);
	}
};
