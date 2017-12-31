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
	}
	img_BACKGROUND.src = 'img/background.png';
}
function text_time() {
	context_ANIMATION.font = "16px Arial";
	context_ANIMATION.fillStyle = "#BBB";
	context_ANIMATION.fillText("Time " + Math.floor(TIME) + " s", 10, 30);
}

var clog = true;
FOCUS.change(SUN);
function draw() {
	context_ANIMATION.clearRect(0,0,WIDTH,HEIGHT);
	MERCURY.orbit.motion(dT);
	VENUS.orbit.motion(dT);
	EARTH.orbit.motion(dT);
	MARS.orbit.motion(dT);
	JUPITER.orbit.motion(dT);
	SATURNE.orbit.motion(dT);
	URANUS.orbit.motion(dT);
	NEPTUNE.orbit.motion(dT);
	TIME += dT;
	text_time();
	
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
	if (RUNNING) {
		requestAnimationFrame(draw);
	}
}
draw();

document.addEventListener('keypress', function(event) {
	if (event.key === '+') {dT*=1.25;}
	if (event.key === '-') {dT*=0.8;}
	if (event.key === '1') {FOCUS.change(SUN);}
	if (event.key === '2') {FOCUS.change(MERCURY);}
	if (event.key === '3') {FOCUS.change(VENUS);}
	if (event.key === '4') {FOCUS.change(EARTH);}
	if (event.key === '5') {FOCUS.change(MARS);}
	if (event.key === '6') {FOCUS.change(JUPITER);}
	if (event.key === '7') {FOCUS.change(SATURNE);}
	if (event.key === '8') {FOCUS.change(URANUS);}
	if (event.key === '9') {FOCUS.change(NEPTUNE);}
	if (event.key === 'a') {DRAW_ORBIT = !DRAW_ORBIT;}
	if (event.keyCode === 32 || event.key === 'q') {
		RUNNING = !RUNNING;
		if (RUNNING) {draw();}
	}
	if (event.keyCode === 47) {dT *= -1;}
	if (event.key === '0') {
		RUNNING = false;
		dT = - TIME;
		context_ORBIT.clearRect(0,0,WIDTH,HEIGHT);
		draw();
		dT = 3600;
	}
})
/*
	Functions to add:
	- orbits
	- controls :
	- timeline + start, pause, retour arrière, ++, --, changer de focus
	- titles
	- infos
	
	Let's focus on the animation itself :
		> object planet with all informations
		> object orbit with all parameters
		> method for planets : draw planet() (fonction du zoom)
		> method for orbits : draw orbit()
		
		
	ATTENTION : pour l'orbite, il faut la redraw à chaque frame car elle est sensible au zoom (fuck)
*/

