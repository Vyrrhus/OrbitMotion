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

var time = 3600;
function draw() {
	context_ANIMATION.clearRect(0,0,WIDTH,HEIGHT);
	SUN.draw(time);
	MERCURY.draw(time);
	VENUS.draw(time);
	EARTH.draw(time);
	MARS.draw(time);
	if (RUNNING) {
		requestAnimationFrame(draw);
	}
}
draw();

document.addEventListener('keypress', function(event) {
	if (event.key === '+') {time*=1.25;}
	if (event.key === '-') {time*=0.8;}
	if (event.keyCode === 32) {
		RUNNING = !RUNNING;
		if (RUNNING) {draw();}
	}
	if (event.keyCode === 47) {time *= -1;}
	console.log(event.key);
	console.log(event.keyCode);
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

