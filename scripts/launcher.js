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
});