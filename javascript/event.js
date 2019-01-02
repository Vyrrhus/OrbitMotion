// Resize canvas
window.onload = function() {
	resize();
	window.addEventListener('resize', resize, false);
	
	function resize() {
		WIDTH = document.getElementById('body').offsetWidth;
		HEIGHT = document.getElementById('body').offsetHeight;
		CENTER = [Math.floor(WIDTH/2), Math.floor(HEIGHT/2)];
		resizeCanvas(CANVAS);
		set_background();
		
		function resizeCanvas(canvas) {
			for (element in canvas) {
				CANVAS[element].width = WIDTH;
				CANVAS[element].height = HEIGHT;
			}
		}
		function set_background() {
			var img = new Image();
			img.onload = function() {
				var Y = 0;
				while (Y < HEIGHT) {
					fill_width();
					Y += img.height;
				}
				function fill_width() {
					var X = 0;
					while (X < WIDTH) {
						CONTEXT.BACKGROUND.drawImage(img, X, Y);
						X += img.width;
					}
				}
			};
			img.onerror = function() {
				console.log('background loading failed !');
			};
			img.src = 'img/background.png';
		}
	}
};

// Zoom
document.addEventListener('wheel', function(event) {
	SCALE.value *= (1 + Math.sign(event.deltaY) * 5/100) ;
	if (SCALE.value < 1) {SCALE.value =1}
	CONTEXT.TRAJECTORY.clearRect(0,0,WIDTH,HEIGHT);
	for (var i = 0 ; i < LIST_OBJ.length ; i++) {
		LIST_OBJ[i].sketch.draw_stored_position(CONTEXT.TRAJECTORY, CENTER, SCALE.value, SCALE.unit, FOCUS.body, PLANE);	
	}
});

// Event
document.addEventListener('keypress', function(event) {
	if (event.key === 'a') {
		CONTEXT.TRAJECTORY.clearRect(0,0,WIDTH,HEIGHT);
		for (var i = 0 ; i < LIST_OBJ.length ; i++) {
			LIST_OBJ[i].sketch.toggle_orbit();
		}
	}
	if (event.key === '+') {
		TIME.dT *= 1.05;
	}
	if (event.key === '-') {
		TIME.dT *= 0.95;
	}
	if (event.key === '(' || event.key === ')') {
		var sign = 1;
		if (event.key === '(') {
			sign *= -1;
		}
		FOCUS.num += sign;
		if (FOCUS.num < 0) {
			FOCUS.num = LIST_OBJ.length-1;
		}
		if (FOCUS.num > LIST_OBJ.length-1) {
			FOCUS.num = 0;
		}
		FOCUS.body = LIST_OBJ[FOCUS.num];
		CONTEXT.TRAJECTORY.clearRect(0,0,WIDTH,HEIGHT);
		for (var i = 0 ; i < LIST_OBJ.length ; i++) {
			LIST_OBJ[i].sketch.reset_store();
			LIST_OBJ[i].sketch.draw_stored_position(CONTEXT.TRAJECTORY, CENTER, SCALE.value, SCALE.unit, FOCUS.body, PLANE);	
		}
		console.log(FOCUS.body.name)
	}
	
	if (event.key === 'z' || event.key === 's') {
		var angle = 0.3;
		if (event.key === 's') {angle *= -1}
		var K = quat.rotate(PLANE[1],angle,I);
		PLANE = [PLANE[0], K];
//		console.log(tool.rad_to_deg(Math.acos(vect3.dot(K,J))));
		CONTEXT.TRAJECTORY.clearRect(0,0,WIDTH,HEIGHT);
		for (var i = 0 ; i < LIST_OBJ.length ; i++) {
			LIST_OBJ[i].sketch.draw_stored_position(CONTEXT.TRAJECTORY, CENTER, SCALE.value, SCALE.unit, FOCUS.body, PLANE);
		}
	}
});