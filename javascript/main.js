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
		CONTROL.draw_ORBIT.draw();
	}
}


		context_TEXT.font = "16px Arial";
		context_TEXT.fillStyle = "#BBB";
		context_TEXT.fillText("Time: " + this.date, 10, 30);

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

var clog = true;
FOCUS.change(SUN);

function draw() {
	context_ANIMATION.clearRect(0,0,WIDTH,HEIGHT);
	MERCURY.orbit.motion(TIME.dT);
	VENUS.orbit.motion(TIME.dT);
	EARTH.orbit.motion(TIME.dT);
	MARS.orbit.motion(TIME.dT);
	JUPITER.orbit.motion(TIME.dT);
	SATURNE.orbit.motion(TIME.dT);
	URANUS.orbit.motion(TIME.dT);
	NEPTUNE.orbit.motion(TIME.dT);
	MOON.orbit.motion(TIME.dT);
	TIME.value += TIME.dT;
	TIME.draw();
	
	FOCUS.planet.setFocus();
	
	SUN.draw();
	MERCURY.draw();
	VENUS.draw();
	EARTH.draw();
	MARS.draw();
	JUPITER.draw();
	URANUS.draw();
	SATURNE.draw();
	NEPTUNE.draw();
	MOON.draw();
	if (RUNNING) {
		requestAnimationFrame(draw);
	}
}
draw();

