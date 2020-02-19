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
var CACHE_TOUCHES = {
	list: new Array(),
	prevTouches: new Array(),
	minDist: 10,
	length: 0,
	center: {x: 0, y: 0},
	add: function(touch) {
		this.list.push(touch);
		this.prevTouches.push(touch);
		this.length += 1;
		if (this.length === 2) {
			this.center = this.getCenter(this.list[0], this.list[1]);
		}
	},
	remove: function(touch) {
		for (let i = 0 ; i < this.length ; i++) {
			if (this.list[i].identifier === touch.identifier) {
				this.list.splice(i,1);
				this.prevTouches.splice(i,1);
				this.length -= 1;
				if (this.length === 2) {
					this.center = this.getCenter(this.list[0], this.list[1]);
				}
				break;
			}
		}
	},
	getCenter: function(touchA, touchB) {
		return {x: Math.floor((touchA.clientX + touchB.clientX) / 2),
			    y: Math.floor((touchA.clientY + touchB.clientY) / 2)}
	},
	swipeDirection: function(curTouch) {
		// Should be called if and only if length === 1
		let center		= this.getCenter(curTouch, this.prevTouches[0]);
		let swipeAngle	= curTouch.angle(center.x, center.y);
		let swipeDist	= curTouch.radius(center.x, center.y) * 2;
		if (swipeDist > this.minDist) {
			this.prevTouches[0] = curTouch;
			return {angle: swipeAngle, radius: swipeDist}
		}
		return null
	}
};

Touch.prototype.radius	= function(centerX, centerY) {
	return Math.hypot(this.clientX - centerX, centerY - this.clientY)
}
Touch.prototype.angle	= function (centerX, centerY) {
	let hypot = this.radius(centerX, centerY);
	if (hypot === 0) {
		return 0
	} else {
		return tool.quadrant((this.clientX - centerX) / hypot, (centerY - this.clientY) / hypot)
	}
}

var PREV_DIFF	= -1;
document.ontouchstart	= touchstart_handler;
document.ontouchend		= touchend_handler;
document.ontouchcancel	= touchend_handler;
document.ontouchmove	= touchmove_handler;

function touchstart_handler(ev) {
	let touchList = ev.changedTouches;
	for (let i = 0 ; i < touchList.length ; i++) {
		CACHE_TOUCHES.add(ev.changedTouches[i]);
	}
}
function touchend_handler(ev) {
	let touchList = ev.changedTouches;
	for (let i = 0 ; i < touchList.length ; i++) {
		CACHE_TOUCHES.remove(ev.changedTouches[i]);
	}
}
function touchmove_handler(ev) {
	/*
		Besoin de gérer la position des Touch avec un .identifier commun à l'instant précédent.
		On pourrait imaginer définir une distance minimale entre les deux Touch pour considérer le move valide ? Pas énorme tho, quelques pixels
		Si coefficient directeur globalement constant mais que la distance augmente / diminue ==> zoom
		Si coefficient directeur évolue ==> rotation
		Si distance trop faible ==> osef, on update pas le CACHE_TOUCH, un dict dont les entrées seront les identifier des Touch ? 
		Un objet où l'on puisse ajouter des "familles" de Touch qui partagent un id commun, les comparer en terme de distance ou avec une autre famille pour obtenir le coefficient directeur
		Nécessité peut-être de jongler entre screenX et clientX
		Besoin de faire un site web qui permettent de tester toutes les configs possibles (github.io) : rotate, zoom in, zoom out, vitesse dudit zoom, distance minimale entre les deux, ellipse, etc.
		
		Besoin ensuite de créer de quoi bloquer les rotations / zoom sur mobile et de switch de mode pour afficher les trajectoires
		Besoin également d'ajouter des boutons pour accélérer / réduire le temps
		Réfléchir aux propriétés du zoom via le delta pour éventuellement l'améliorer
		HELP ME spécial mobile ? Pour la partie contrôles?
	*/
	if (CACHE_TOUCHES.length === 1) {
		// Rotation around a given vector
		let touch	= ev.changedTouches[0];
		let swipe	= CACHE_TOUCHES.swipeDirection(touch);
		if (swipe !== null) {
			let direction		= vect3.exp(swipe.angle, 1);
			let vectRotation	= vect3.cross(PLANE.z, direction);
			PLANE.x = quat.rotate(PLANE.x, 0.1 * swipe.radius, vectRotation);
			PLANE.y = quat.rotate(PLANE.y, 0.1 * swipe.radius, vectRotation);
			PLANE.z = vect3.cross(PLANE.x, PLANE.y);
		}
	}
	if (CACHE_TOUCHES.length === 2) {
		// Zoom inOut + rotate around K if circle
		let touchList	= ev.changedTouches;
		let touchA		= touchList[0];
		let touchB		= touchList[1];
		let curDiff		= Math.hypot(touchB.clientX - touchA.clientX, touchB.clientY - touchA.clientY);
		if (PREV_DIFF > 0) {
			HUD.zoom(CONTEXT.CONTROL, PREV_DIFF - curDiff);
		}
		PREV_DIFF = curDiff;
	}
}