// Canvas
var canvas = document.getElementById('canvas');
var canvas2 = document.getElementById('canvas2');
var canvas3 = document.getElementById('canvas3');
var canvas4 = document.getElementById('canvas4');
var canvas0 = document.getElementById('canvas0');
var parent = document.getElementById('body');
canvas.width = parent.offsetWidth;
canvas.height = parent.offsetHeight;
canvas2.width = parent.offsetWidth;
canvas2.height = parent.offsetHeight;
canvas3.width = parent.offsetWidth;
canvas3.height = parent.offsetHeight;
canvas4.width = parent.offsetWidth;
canvas4.height = parent.offsetHeight;
canvas0.width = parent.offsetWidth;
canvas0.height = parent.offsetHeight;

var width = canvas.width;
var height = canvas.height;
var center = [Math.floor(width/2), Math.floor(height/2)];
var ctx = canvas.getContext('2d');
var ctx2 = canvas2.getContext('2d');
var ctx3 = canvas3.getContext('2d');
var ctx4 = canvas4.getContext('2d');
var raf;
var running = false;
var angle = 0;

// Adapt the size of the canvas to the window it belongs to
var ctx0 = canvas0.getContext('2d');
var BACKGROUND = new Image();
BACKGROUND.onload = function() {console.log('Image loaded successfully')};
BACKGROUND.onerror = function() {console.log('Image failed to load')};
BACKGROUND.src = 'bide.png';

window.onload = affichage;
function affichage() {
	window.addEventListener('resize', resizeCanvas, false);
	function resizeCanvas() {
		width = parent.offsetWidth;
		height = parent.offsetHeight;
		canvas.width = width;
		canvas.height = height;
		canvas2.width = width;
		canvas2.height = height;
		canvas3.width = width;
		canvas3.height = height;
		canvas4.width = width;
		canvas4.height = height;
		canvas0.width = width;
		canvas0.height = height;
		center = [Math.floor(width/2), Math.floor(height/2)];
		running = false;
		canvas.click();
	}
}

var circle = {
	x: center[0]+200,
	y: center[1],
	radius: 30,
	color: 'blue',
	draw: function() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fillStyle = this.color;
		ctx.fill();
	}
};

var circle2 = {
	x: circle.x+circle.radius,
	y: center[1],
	radius: 20,
	color: 'red',
	draw: function() {
		ctx2.beginPath();
		ctx2.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
		ctx2.closePath();
		ctx2.fillStyle = this.color;
		ctx2.fill();
	}
};

var circle3 = {
	x: circle2.x+circle2.radius,
	y: center[1],
	radius: 10,
	color: 'green',
	draw: function() {
		ctx3.beginPath();
		ctx3.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
		ctx3.closePath();
		ctx3.fillStyle = this.color;
		ctx3.fill();
	}
};

var circle4 = {
	x: circle3.x+circle3.radius,
	y: center[1],
	radius: 5,
	color: 'black',
	draw: function() {
		ctx4.beginPath();
		ctx4.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
		ctx4.closePath();
		ctx4.fillStyle = this.color;
		ctx4.fill();
	}
};


function draw() {
	
	ctx.fillStyle='rgba(255,255,255,0.3)'; // fillStyle + fillRect au lieu de clearRect pour effet de traînée
	ctx.fillRect(0,0,width, height);
	circle.draw();
	angle += Math.PI/180/1
	circle.x = center[0] + 200 * Math.cos(4 * angle / Math.PI);
	circle.y = center[1] + 200 * Math.sin(4 * angle / Math.PI);
	
	ctx2.clearRect(0,0,canvas2.width, canvas2.height);
	circle2.draw();
	circle2.x = circle.x + circle.radius * Math.cos(4 * angle * 3 / Math.PI);
	circle2.y = circle.y + circle.radius * Math.sin(4 * angle * 3 / Math.PI);
	
	ctx3.clearRect(0,0,canvas3.width, canvas3.height);
	circle3.draw();
	circle3.x = circle2.x + circle2.radius * Math.cos(4 * angle * 5 / Math.PI);
	circle3.y = circle2.y + circle2.radius * Math.sin(4 * angle * 5 / Math.PI);
	
	ctx4.clearRect(0,0,canvas4.width, canvas4.height);
	circle4.draw();
	circle4.x = circle3.x + circle3.radius * Math.cos(4 * angle * 7 / Math.PI);
	circle4.y = circle3.y + circle3.radius * Math.sin(4 * angle * 7 / Math.PI);
	raf = window.requestAnimationFrame(draw);
}


raf = window.requestAnimationFrame(draw);
//circle.draw()
//circle2.draw();
//circle3.draw();
//circle4.draw();

/*
1st canvas : background : "nuit étoilée"
2nd canvas : planets + Sun : Sun, Venus, Earth, Mars for now
3rd canvas : boutons : vitesse simulation (+/-), start/stop/pause, défilement planète (+/-), moar infos
*/
