// CANVAS
var CANVAS = {
	BACKGROUND: document.getElementById('background'),
	TRAJECTORY: document.getElementById('orbit'),
	BODY: document.getElementById('animation')
};

// CONTEXT
var CONTEXT = {
	BACKGROUND: CANVAS.BACKGROUND.getContext('2d'),
	TRAJECTORY: CANVAS.TRAJECTORY.getContext('2d'),
	BODY: CANVAS.BODY.getContext('2d')
};

// SCREEN SIZE & HUD
var WIDTH = document.getElementById('body').offsetWidth;
var HEIGHT = document.getElementById('body').offsetHeight;
var CENTER = [Math.floor(WIDTH/2), Math.floor(HEIGHT/2)];

// PLANE
var PLANE = {
	x: I, 
	y: J,
	draw: function(ctx) {
		ctx.clearRect(0,HEIGHT-230,230,230);
		I.draw(ctx, this, {type: 'vec', text: 'I', center: {x: 100, y: HEIGHT-100}});
		J.draw(ctx, this, {type: 'vec', text: 'J', center: {x: 100, y: HEIGHT-100}});
		K.draw(ctx, this, {type: 'vec', text: 'K', center: {x: 100, y: HEIGHT-100}});
	}
};

// SCALE
var SCALE = {
	value: 2e6,
	unit: 'km'
};

// TIME
var TIME = {
	dT: 86400/60, //[s]
	running: true,
	LAST_TICK: 0,
	FPS: 0,
	tick: function() {
		var time = new Date().getTime();
		if (this.LAST_TICK === 0) {
			this.FPS = 60;
		} else {
			var delta = (time - this.LAST_TICK) / 1000;
			if (delta > 0 && delta < 0.5) {
				this.FPS = 1 / delta;
			} else {
				this.FPS = 0;
			}
		}
		this.LAST_TICK = time;
	}
};

// FOCUS
var FOCUS = {
	body: null,
	num: 0
};

// PAUSE
var PAUSE = false;

// LIST OF BODIES (STARTING EMPTY)
var LIST_OBJ = null;

function start() {
	/*
		Init all the objects with the data stored then call the function animation()
		ie declare all bodies then do the Kepler conversion thing to get their orbits
	*/
	list_body = init()
	LIST_OBJ = list_body;
	FOCUS.body = LIST_OBJ[FOCUS.num];
	requestAnimationFrame(animation);
	
	function init() {
		list_bodies = []
		for (var element in BODIES) {
			if (element in VECTORS) {
				e = VECTORS[element];
				BODIES[element].init_state(e[0], e[1], e[2], e[3], e[4], e[5]);
			}
			list_bodies.push(BODIES[element]);
		}
		return set_kepler(list_bodies);
	}
	function set_kepler(list_body) {
		// Sort by mass
		list_body.sort(function(a,b) {
			return (b.mass - a.mass)
		});
	
		// Iterate through bodies
		for (var i = 1 ; i < list_body.length ; i++) {
			console.log(`+ Add: ${list_body[i].name}`);
			var reference = list_body[0];
			for (var j = i-1 ; j > 0 ; j--) {
				var distance = Body.get_distance(list_body[i], list_body[j]);
				var SOI = list_body[j].SOI;
				if (distance < SOI) {
					// Reference found
					reference = list_body[j];
					j = 0;
				}
			}
			// Set children
			reference.child.push(list_body[i]);
		
			// Set state vectors
			list_body[i].reference = reference;
			while (reference !== 'inertial') {
				list_body[i].position = vect3.sum(1,list_body[i].position, -1, reference.position);
				list_body[i].velocity = vect3.sum(1, list_body[i].velocity, -1, reference.velocity);
				reference = reference.reference;
			}
			list_body[i].get_orbit(list_body[i].reference);
		}
	
		// Return list 
		return list_body
	}
}
	
function animation(time) {
	if (PAUSE) {
		return requestAnimationFrame(animation);
	}
	CONTEXT.BODY.clearRect(0,0,WIDTH,HEIGHT);
	
	for (var i = 0 ; i < LIST_OBJ.length ; i++) {
		// Body
		var body = LIST_OBJ[i];
		
		// Sketch
		body.sketch.set_radius(SCALE.value, SCALE.unit);
		body.sketch.set_position(CENTER, SCALE.value, SCALE.unit, FOCUS.body, PLANE);
		body.sketch.draw(CONTEXT.BODY, CONTEXT.TRAJECTORY);
		
		if (!TIME.running) {
			requestAnimationFrame(animation);
		}
		body.kepler_motion(TIME.dT, LIST_OBJ[9]);
//		body.move(LIST_OBJ, TIME.dT);
	}
	TIME.tick();
	requestAnimationFrame(animation);
}

start();