addEventListener('load', function () {
	var canvas = document.getElementById('gl');

	var viewer = new ModelViewer({
		file: 'assets/Item/Objectcomponents/weapon/axe_1h_blacksmithing_d_01.m2',
		glCanvas: canvas,
		playBtn: document.getElementById('play')
	});

	document.addEventListener('keydown', function (event) {
		switch (event.keyCode) {
			case 40: viewer.angleSpeed.X = 0.03; break;
			case 38: viewer.angleSpeed.X = -0.03; break;
			case 39: viewer.angleSpeed.Y = 0.03; break;
			case 37: viewer.angleSpeed.Y = -0.03; break;
		}
	});
	
	document.addEventListener('keyup', function (event) {
		switch (event.keyCode) {
			case 40:
			case 38:
				viewer.angleSpeed.X = 0;
				break;

			case 39:
			case 37:
				viewer.angleSpeed.Y = 0;
				break;
		}
	});

	var lastCoords = null,
		sizeMappings = {X: 'width', Y: 'height'};

	function getCoords(data) {
		return {X: data.clientY, Y: data.clientX};
	}

	function onDown(data) {
		lastCoords = getCoords(data);
	}

	function onUp() {
		lastCoords = null;
	}

	function onMove(data) {
		if (!lastCoords) return;
		
		var newCoords = getCoords(data);

		for (var name in newCoords) {
			viewer.angle[name] += (newCoords[name] - lastCoords[name]) / viewer[sizeMappings[name]] * 4;
		}

		lastCoords = newCoords;
	}

	canvas.addEventListener('mousedown', function (event) {
		onDown(event);
		event.preventDefault();
	});
	canvas.addEventListener('mouseup',   onUp);
	canvas.addEventListener('mousemove', onMove);

	canvas.addEventListener('touchstart', function (event) { onDown(event.touches[0]) });
	canvas.addEventListener('touchend',   onUp);
	canvas.addEventListener('touchmove',  function (event) { onMove(event.touches[0]) });
});