// CANVAS
var CANVAS = {
	BACKGROUND: document.getElementById('background'),
	TRAJECTORY: document.getElementById('orbit'),
	BODY: document.getElementById('animation'),
	CONTROL: document.getElementById('control')
};

// CONTEXT
var CONTEXT = {
	BACKGROUND: CANVAS.BACKGROUND.getContext('2d'),
	TRAJECTORY: CANVAS.TRAJECTORY.getContext('2d'),
	BODY: CANVAS.BODY.getContext('2d'),
	CONTROL: CANVAS.CONTROL.getContext('2d')
};

// SCREEN SIZE & HUD
var WIDTH = document.getElementById('body').offsetWidth;
var HEIGHT = document.getElementById('body').offsetHeight;
var CENTER = {x: Math.floor(WIDTH/2), y: Math.floor(HEIGHT/2)};

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
	unit: 'km',
	draw: function(ctx) {
		/*
			Draw simulation scale
			To redraw only on change /!\
		*/
		// Scale
		var length = WIDTH * 1/10;
		var padding = length / 10;
		var height = length / 20;
		var value = (this.value * length);
		ctx.clearRect(WIDTH-length*1.2, 
					  HEIGHT-length/2,
					  length*1.2,
					  length/2);
		ctx.beginPath();
		ctx.rect(WIDTH-padding-length, HEIGHT-padding-height,1,height);
		ctx.rect(WIDTH-padding, HEIGHT-padding-height,1,height);
		ctx.rect(WIDTH-padding-length, HEIGHT-padding-height/2, length, 1);
		ctx.fillStyle = '#BBB';
		ctx.fill();
		ctx.closePath();
		
		// Text
		ctx.font = '13px Arial';
		var text = value.toExponential(3) + ' ' + this.unit;
		ctx.textBaseline = "bottom";
		ctx.textAlign = "center";
		ctx.fillText(text, WIDTH-padding-length/2,HEIGHT-padding-height);
	}
};

// TIME
var TIME = {
	dT: 86400/60, //[s]
	devMode: true,
	LAST_TICK: 0,
	FPS: 0,
	delta: 0,
	date: new Date(2019,0,1),
	tick: function() {
		var time = new Date().getTime();
		if (this.LAST_TICK === 0) {
			this.FPS = 60;
		} else {
			var delta = (time - this.LAST_TICK) / 1000;
			this.delta += delta;
			if (delta > 0 && delta < 0.5) {
				this.FPS = 1 / delta;
			} else {
				this.FPS = 0;
			}
			if (this.delta > 0.25) {
				this.delta = 0;
				this.draw_FPS(CONTEXT.CONTROL);
			}
		}
		this.LAST_TICK = time;
	},
	draw_FPS: function(ctx) {
		var txt = `${Math.round(this.FPS)} | FPS`;
		ctx.font = "15px Arial";
		var width = ctx.measureText(txt).width;
		
		// Box
		ctx.clearRect(WIDTH-1.2*width, 0, 1.2*width,15);
		if (!this.devMode) {
			return
		}
		ctx.fillStyle = 'rgba(80,80,80,0.5)'
		ctx.fillRect(WIDTH - width, 0, width, 15);
		
		// Text
		ctx.fillStyle = 'rgb(35,115,77)';
		ctx.textAlign = "right";
		ctx.textBaseline = "top";
		ctx.fillText(txt, WIDTH, 0);
	},
	set_date: function() {
		this.date = new Date(this.date.getTime() + this.dT*1000);
	},
	draw_date: function(ctx) {
		var txt = this.date.str();
		ctx.font = "15px Arial";
		var padding = 5; // px
		var width = ctx.measureText(txt).width;
		
		ctx.clearRect(0,0,width+padding,30);
		
		// Text
		ctx.fillStyle = '#FFF';
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText(txt, padding, padding);
	},
	toggle_devMode: function() {
		this.devMode = !this.devMode;
	}
};

// FOCUS
var FOCUS = {
	body: null,
	num: 0
};

// PAUSE
var PAUSE = true;

// LIST OF BODIES (STARTING EMPTY)
var LIST_OBJ = null;

function start() {
	/*
		Init all the objects with the data stored then call the function animation()
		ie declare all bodies then do the Kepler conversion thing to get their orbits
		
		Draw all HUD elements
	*/
	list_body = init()
	LIST_OBJ = list_body;
	FOCUS.body = LIST_OBJ[FOCUS.num];
	
	// Draw elements before running
	SCALE.draw(CONTEXT.CONTROL);
	PLANE.draw(CONTEXT.CONTROL);
	TIME.draw_date(CONTEXT.CONTROL);
	draw_body();
	
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
	TIME.tick();
	if (PAUSE) {
		return requestAnimationFrame(animation);
	}
	
	run();
	draw_body();
	requestAnimationFrame(animation);
}

function draw_body() {
	CONTEXT.BODY.clearRect(0,0,WIDTH,HEIGHT);
	
	for (var i = 0 ; i < LIST_OBJ.length ; i++) {
		// Body
		var body = LIST_OBJ[i];
		
		// Sketch
		body.sketch.set_radius(SCALE.value, SCALE.unit);
		body.sketch.set_position(CENTER, SCALE.value, SCALE.unit, FOCUS.body, PLANE);
		body.sketch.draw(CONTEXT.BODY, CONTEXT.TRAJECTORY);
	}
}

function run() {
	for (var i = 0 ; i < LIST_OBJ.length ; i++) {
		LIST_OBJ[i].kepler_motion(TIME.dT);
	}
	TIME.set_date();
	TIME.draw_date(CONTEXT.CONTROL);
}