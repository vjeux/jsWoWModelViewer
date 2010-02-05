
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
	uint8:	function (config) { return config.binaryReader.readUInt8.call(config.binaryReader); },
	int8:	function (config) { return config.binaryReader.readInt8.call(config.binaryReader); },
	uint16: function (config) { return config.binaryReader.readUInt16.call(config.binaryReader); },
	int16:	function (config) { return config.binaryReader.readInt16.call(config.binaryReader); },
	uint32: function (config) { return config.binaryReader.readUInt32.call(config.binaryReader); },
	int32:	function (config) { return config.binaryReader.readInt32.call(config.binaryReader); },
	float:	function (config) { return config.binaryReader.readFloat.call(config.binaryReader); },
	char:	function (config) { return config.binaryReader.readChar.call(config.binaryReader); },
	string: function (config, size) { return config.parse(['array', 'char', size]).join(''); },
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
