// Resize function
function resize() {
	WIDTH = document.getElementById('body').offsetWidth;
	HEIGHT = document.getElementById('body').offsetHeight;
	CENTER = {x: Math.floor(WIDTH/2), y: Math.floor(HEIGHT/2)};
	resizeCanvas(CANVAS);
	set_background();
    HUD.drawPlane(CONTEXT.CONTROL);
    HUD.drawScale(CONTEXT.CONTROL);
//	set_blackscreen();

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
		img.src = 'src/assets/background.png';
	}
	function set_blackscreen() {
			CONTEXT.BACKGROUND.fillStyle = 'black';
			CONTEXT.BACKGROUND.fillRect(0,0,WIDTH,HEIGHT);
		}
}

// ONLOAD EVENT
window.onload = function() {
	// CANVAS resized & HUD set
	resize();
	window.addEventListener('resize', function() {draw_body();resize();}, false);
	Script.load(_SCENARIO, start);
}

// WHEEL EVENT
document.addEventListener('wheel', function(event) {
	HUD.zoom(CONTEXT.CONTROL, event.deltaY);
});

// KEYUP EVENT
document.addEventListener('keyup', function(event) {
	if (event.keyCode === 32) {
		PAUSE = !PAUSE;
	}
});

// KEYPRESS EVENT
document.addEventListener('keypress', function(event) {
	
//	// Toggle orbit
//	if (event.key === 'o') {
//		CONTEXT.SKETCH2.clearRect(0,0,WIDTH,HEIGHT);
//		for (var i = 0 ; i < LIST_OBJ.length ; i++) {
//			LIST_OBJ[i].sketch.switch_mode();
//		}
//	}
	
	// Toggle SOI
	if (event.key === 'p') {
		for (var i = 0 ; i < LIST_OBJ.length ; i++) {
			LIST_OBJ[i].sketch.toggle.SOI();
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
		if (!HUD.focus) {return}
		var sign = 1;
		if (event.key === '(') {
			sign *= -1;
		}
		let focusNum = FOCUS.num + sign;
		
		if (focusNum < 0) {
			focusNum = LIST_OBJ.length-1;
		}
		if (focusNum > LIST_OBJ.length-1) {
			focusNum = 0;
		}
		FOCUS.setFocusByNum(focusNum);
		
		if (PAUSE) {
			draw_body();
		}
	}
	
	// Camera motion
	if (event.key === 'z' || 
		event.key === 's' ||
	    event.key === 'q' ||
	    event.key === 'd' ||
	    event.key === 'a' ||
	    event.key === 'e') {
		if (!HUD.move){return}

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
				PLANE.x = quat.rotate(PLANE.x, rotation, PLANE.z);
				PLANE.y = quat.rotate(PLANE.y, rotation, PLANE.z);
				break;
			case 'e':
				rotation *= -1;
				PLANE.x = quat.rotate(PLANE.x, rotation, PLANE.z);
				PLANE.y = quat.rotate(PLANE.y, rotation, PLANE.z);
				break;
			default:
				return
		}
		PLANE.z = vect3.cross(PLANE.x, PLANE.y);
		
		// Clear and redraw orbits
//		CONTEXT.TRAJECTORY.clearRect(0,0,WIDTH,HEIGHT);
//		for (var i = 0 ; i < LIST_OBJ.length ; i++) {
//			LIST_OBJ[i].sketch.draw_stored_position(CONTEXT.TRAJECTORY, CENTER, SCALE.value, SCALE.unit, FOCUS.body, PLANE);
//		}
		
		// Clear and redraw bodies
		if (PAUSE) {
			draw_body();
		}
		
		// Redraw
        HUD.drawPlane(CONTEXT.CONTROL);
	}
});

// CLICK EVENT
document.addEventListener('click', function(event) {
	for (var i = 0 ; i < LIST_OBJ.length ; i++) {
		LIST_OBJ[i].sketch.onclick(event.clientX, event.clientY);
	}
	console.log(`x:${event.clientX} ; y:${event.clientY}`);
})

// TOUCH EVENTS (mobile purpose)
var PREV_DIFF	= -1;
document.ontouchmove	= touchmove_handler;

function touchmove_handler(ev) {
	if (ev.changedTouches.length === 2) {
		let touchList	= ev.changedTouches;
		let touchA		= touchList[0];
		let touchB		= touchList[1];
		let curDiff		= Math.hypot(touchB.clientX - touchA.clientX, touchB.clientY - touchA.clientY);
		if (PREV_DIFF > 0) {
			HUD.zoom(CONTEXT.CONTROL, PREV_DIFF - currDiff);
		}
		PREV_DIFF = curDiff;
	}
}