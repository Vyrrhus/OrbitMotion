// Resize of canvas:
window.onload = function() {
	resize();
	window.addEventListener('resize', resize, false);
	function resize() {
		WIDTH  = document.getElementById('body').offsetWidth;
		HEIGHT = document.getElementById('body').offsetHeight;
		CENTER = [Math.floor (WIDTH/2),
				  Math.floor(HEIGHT/2)];
		resizeCanvas(BACKGROUND,ORBIT,ANIMATION,TEXT,CONTROL);
		function resizeCanvas() {
			[].forEach.call(arguments, function(element) {
				element.width  = WIDTH;
				element.height = HEIGHT;
			});
		}
		// Function for backgrounds redraw at each resize
		set_BACKGROUND();
		FOCUS.draw();
		PX.scale(20,30);
		BUTTON.draw_ORBIT.draw();
		BUTTON.draw_INFO.draw();
		BUTTON.draw_TIMELINE.size = 40 + WIDTH/100;
		BUTTON.draw_TIMELINE.draw();
	}
}

// Fill canvas with 'background.png'
function set_BACKGROUND() {
	var img_BACKGROUND = new Image();
	img_BACKGROUND.onload = function() {
		var Y = 0;
		while (Y < HEIGHT) {
			fill_width();
			Y += img_BACKGROUND.height;
		}
		function  fill_width() {
			var X = 0;
			while (X < WIDTH) {
				context_BACKGROUND.drawImage(img_BACKGROUND, X, Y);
				X += img_BACKGROUND.width;
			}
		}
	};
	img_BACKGROUND.onerror = function() {
		console.log('failed to load !');
	};
	img_BACKGROUND.src = 'img/background.png';
}

function planet_animation() {
	DATA.forEach(function(element) {
		if (element.orbit != null) {
			element.orbit.motion(TIME.dT);
		}
	});
}
function planet_draw() {
	DATA.forEach(function(element) {
		element.draw();
	});
}

FOCUS.change(SUN);

function draw() {
	context_ANIMATION.clearRect(0,0,WIDTH,HEIGHT);
	planet_animation(DATA);
	TIME.value += TIME.dT;
	TIME.draw();
	FOCUS.planet.setFocus();
	planet_draw(DATA);
	
	if (RUNNING) {
		requestAnimationFrame(draw);
	}
}

draw();
