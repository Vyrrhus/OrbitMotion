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
	
	// Clear and redraw bodies
		if (PAUSE) {
			draw_body();
		}
	SCALE.draw(CONTEXT.CONTROL);
});

// Event
document.addEventListener('keypress', function(event) {
	if (event.key === 'a') {
	
	// Toggle orbit
	if (event.key === 'o') {
		CONTEXT.TRAJECTORY.clearRect(0,0,WIDTH,HEIGHT);
		for (var i = 0 ; i < LIST_OBJ.length ; i++) {
			LIST_OBJ[i].sketch.toggle_orbit();
		}
	}
	
	// Toggle SOI
	if (event.key === 'p') {
		for (var i = 0 ; i < LIST_OBJ.length ; i++) {
			LIST_OBJ[i].sketch.toggle_SOI();
		}
		draw_body();
	}
	
	// Dev mode
	if (event.key === '$') {
		TIME.toggle_devMode();
	}
	
	// Time 
	/*
		Adapt time so that it is smoother on date change (ie use multiple of 60 & 24)
	*/
	if (event.key === '+') {
		TIME.dT *= 1.05;
	}
	if (event.key === '-') {
		TIME.dT *= 0.95;
	}
	
	// Change focus
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
	// Camera motion
	if (event.key === 'z' || 
		event.key === 's' ||
	    event.key === 'q' ||
	    event.key === 'd' ||
	    event.key === 'a' ||
	    event.key === 'e') {

		var rotation = 1; // [°]
		
		// Rotation
		switch (event.key) {
			case 'z':
				PLANE.y = quat.rotate(PLANE.y, rotation, PLANE.x);
				break;
			case 's':
				rotation *= -1;
				PLANE.y = quat.rotate(PLANE.y, rotation, PLANE.x);
				break;
			case 'q':
				PLANE.x = quat.rotate(PLANE.x, rotation, PLANE.y);
				break;
			case 'd':
				rotation *= -1;
				PLANE.x = quat.rotate(PLANE.x, rotation, PLANE.y);
				break;
			case 'a':
				var z = vect3.cross(PLANE.x, PLANE.y);
				PLANE.x = quat.rotate(PLANE.x, rotation, z);
				PLANE.y = quat.rotate(PLANE.y, rotation, z);
				break;
			case 'e':
				rotation *= -1;
				var z = vect3.cross(PLANE.x, PLANE.y);
				PLANE.x = quat.rotate(PLANE.x, rotation, z);
				PLANE.y = quat.rotate(PLANE.y, rotation, z);
				break;
			default:
				return
		}
		
		// Clear and redraw orbits
		CONTEXT.TRAJECTORY.clearRect(0,0,WIDTH,HEIGHT);
		for (var i = 0 ; i < LIST_OBJ.length ; i++) {
			LIST_OBJ[i].sketch.draw_stored_position(CONTEXT.TRAJECTORY, CENTER, SCALE.value, SCALE.unit, FOCUS.body, PLANE);
		}
		
		// Clear and redraw bodies
		if (PAUSE) {
			draw_body();
		}
		
		// Redraw
		PLANE.draw(CONTEXT.CONTROL);
	}
});

document.addEventListener('keyup', function(event) {
	if (event.keyCode === 32) {
		PAUSE = !PAUSE;
	}
})