// Canvas
var BACKGROUND = document.getElementById('background');
var DRAWING = document.getElementById('canvas');

// Contexts
var context_BACKGROUND = BACKGROUND.getContext('2d');
var context_DRAWING = DRAWING.getContext('2d');

// Settings
RUNNING = true;

// Screen size
var WIDTH = document.getElementById('body').offsetWidth;
var HEIGHT = document.getElementById('body').offsetHeight;
var CENTER = [Math.floor(WIDTH/2), Math.floor(HEIGHT/2)];

/* Adjust the size of canvas to the size of the screen */
//window.onload = function() {
//	function resize() {
//		WIDTH = document.getElementById('body').offsetWidth;
//		HEIGHT = document.getElementById('body').offsetHeight;
//		CENTER = [Math.floor(WIDTH/2), Math.floor(HEIGHT/2)];
//		resizeCanvas(BACKGROUND, DRAWING, INTERFACE);
//		function resizeCanvas() {
//			[].forEach.call(arguments, function (element) {
//				element.width = WIDTH;
//				element.height = HEIGHT;
//			});
//		}
//	}
//	resize();
//	context_DRAWING.fillStyle = "#FF0000"; 
//	context_DRAWING.fillRect(CENTER[0],CENTER[1],150,75);
//	window.addEventListener('resize', function() {
//		console.log('resize');
//		console.log(CENTER);
//		resize();
//		console.log(CENTER);
//	}, false);
//}
//
//// Settings

// Background
function background(X,Y,COLOR,CONTEXT) {
	
}

// Circles defined
function circle(X,Y,RADIUS,COLOR,CONTEXT) {
	var object = {
		x: X,
		y: Y,
		radius: RADIUS,
		color: COLOR,
		draw: function() {
			CONTEXT.beginPath();
			CONTEXT.arc(this.x,this.y,this.radius,0,Math.PI*2);
			CONTEXT.fillStyle = COLOR;
			CONTEXT.fill();
			CONTEXT.closePath();
		},
		motion: function(ORIGIN, RADIUS, ANGLE) {
			this.x = ORIGIN[0] + RADIUS * Math.cos(2 * ANGLE * Math.PI * 2);
			this.y = ORIGIN[1] + RADIUS * Math.sin(2 * ANGLE * Math.PI * 2);
		},
		line: function() {
			CONTEXT.beginPath();
			CONTEXT.rect(this.x, this.y-1, WIDTH-this.x,3);
			CONTEXT.fillStyle = COLOR;
			CONTEXT.fill();
			CONTEXT.closePath();
		}
	};
	return object;
}

var c0 = circle(CENTER[0]+200, CENTER[1], 50, 'green', context_DRAWING);
var c1 = circle(c0.x + c0.radius, CENTER[1], 30, 'blue', context_DRAWING);
var c2 = circle(c1.x + c1.radius, CENTER[1], 20, 'red', context_DRAWING);
var c3 = circle(c2.x + c2.radius, CENTER[1], 10, 'yellow', context_DRAWING);
var c4 = circle(c3.x + c3.radius, CENTER[1], 5, 'black', context_DRAWING);

c0.draw();
c1.draw();
c2.draw();
c3.draw();
c4.draw();

//Drawing
angle = 0;
velocity = 0.38;
function draw() {
	context_DRAWING.clearRect(0, 0, WIDTH, HEIGHT);
	c0.draw();
	c1.draw();
	c2.draw();
	c3.draw();
	c4.draw();
	c0.line();
	c4.line();
	angle = (angle+Math.PI/720 * velocity)%(4*Math.PI);
	
	c0.motion(CENTER, 200, angle);
	c1.motion([c0.x, c0.y], c0.radius, 3*angle);
	c2.motion([c1.x, c1.y], c1.radius, 5*angle);
	c3.motion([c2.x, c2.y], c2.radius, 7*angle);
	c4.motion([c3.x, c3.y], c3.radius, 9*angle);
	if (RUNNING) {
		requestAnimationFrame(draw);
	}
}
draw();

// Events
document.addEventListener('keypress', function(event) {
	if (event.key === '+') {velocity *= 1.1;}
	if (event.key === '-') {velocity *= 0.9;}
	if (event.key === 'q') {
		RUNNING = !RUNNING;
		if (RUNNING) {
			draw();
		}
	}
});

///*
//1st canvas : background : "nuit étoilée"
//2nd canvas : planets + Sun : Sun, Venus, Earth, Mars for now
//3rd canvas : boutons : vitesse simulation (+/-), start/stop/pause, défilement planète (+/-), moar infos
//*/
