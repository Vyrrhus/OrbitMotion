// CANVAS
var CANVAS = {
	BACKGROUND: document.getElementById('background'),
	SKETCH: document.getElementById('orbit'),
	SKETCH2: document.getElementById('animation'),
	CONTROL: document.getElementById('control')
};

// CONTEXT
var CONTEXT = {
	BACKGROUND: CANVAS.BACKGROUND.getContext('2d'),
	SKETCH: CANVAS.SKETCH.getContext('2d'),
	SKETCH2: CANVAS.SKETCH2.getContext('2d'),
	CONTROL: CANVAS.CONTROL.getContext('2d')
};

// SCREEN SIZE & HUD
var WIDTH = document.getElementById('body').offsetWidth;
var HEIGHT = document.getElementById('body').offsetHeight;
var CENTER = {x: Math.floor(WIDTH/2), y: Math.floor(HEIGHT/2)};

// CONSTANTS
var UA 	= 149597870.7; 							// km
var G 	= 6.67408e-20; 							// km3/kg/s2

// Inertial coordinate vectors
const I = new vect3(1,0,0);
const J = new vect3(0,1,0);
const K = new vect3(0,0,1);

const U = new vect3(0.9174992863750878, 0, 0.39773742532128487);
const V = new vect3(-0.39773742532128487, 0, 0.9174992863750878);

const X = new vect3(0.6057451752, -0.7945322475, 0.0423236662);
const Y = new vect3(0.1706610795, 0.18169775, 0.9684320972);

const CONST_I = new vect3(0.8971550081, 0.4317187875, 0.0934439943);
const CONST_J = new vect3(-0.4060478158, 0.7227653433, 0.5592275297);

// SCRIPT
var _SCENARIO = 'sat_demo';

// PAUSE
var PAUSE = false;

// ANIMATION REQUEST
var ANIMATION_REQUEST = null;

// LIST of OBJs
var LIST_OBJ = null;
var LIST_TO_SORT = null;

// Functions
function start() {
	/*
		Init all the objects with the data stored then call the function animation()
		ie declare all bodies then do the Kepler conversion thing to get their orbits
		
		Draw all HUD elements
	*/
    // Reset
    PAUSE = false;
    
	// Load scenario
	var SCENARIO 	= _SCENARIO;	//_SOLAR_SYSTEM;
	SCENARIO.init();
	LIST_OBJ 		= SCENARIO.list_bodies;
	LIST_TO_SORT	= SCENARIO.sort_list;
	
	// Focus
	FOCUS.num 		= SCENARIO.list_bodies.indexOf(SCENARIO.focus);
	FOCUS.body 		= SCENARIO.focus;
	for (var i = 0 ; i < SCENARIO.list_bodies.length ; i++) {
		SCENARIO.list_bodies[i].sketch.focus = FOCUS.body;
	}
	console.log(`FOCUS on ${FOCUS.body.name}`);
	
	// Scale
	SCALE.value 	= SCENARIO.scale;
	SCALE.draw(CONTEXT.CONTROL);
	
	// Time
	TIME.date 		= SCENARIO.epoch;
	TIME.dT			= SCENARIO.dT;
	TIME.draw_date(CONTEXT.CONTROL);
	
	// Plane
	PLANE.x			= SCENARIO.plane.x;
	PLANE.y			= SCENARIO.plane.y;
	PLANE.z 		= vect3.cross(PLANE.x, PLANE.y);
	PLANE.draw(CONTEXT.CONTROL);
	
	// Draw sketch
	draw_body();
	
	// Run animation
	ANIMATION_REQUEST = requestAnimationFrame(animation);
}
function animation(time) {
	TIME.tick();
	
    if (!PAUSE) {
        run();
        draw_body();
    }
    
	ANIMATION_REQUEST = requestAnimationFrame(animation);
}
function run() {
	for (var i = 0 ; i < LIST_OBJ.length ; i++) {
		LIST_OBJ[i].kepler_motion2(TIME.dT);
	}
	TIME.set_date();
	TIME.draw_date(CONTEXT.CONTROL);
}

function draw_body() {
	CONTEXT.SKETCH.clearRect(0,0,WIDTH,HEIGHT);
	for (var i = 0 ; i < LIST_TO_SORT.length ; i++) {
		// Compute state
		LIST_TO_SORT[i].sketch.compute_state(SCALE.value, PLANE, CENTER);
	}
	LIST_TO_SORT.sort(function(a,b) {
		return (a.sketch.current.position.z - b.sketch.current.position.z)
	});
	for (var i = 0 ; i < LIST_TO_SORT.length ; i++) {
		LIST_TO_SORT[i].sketch.draw_SOI(CONTEXT.SKETCH, SCALE.value);
	}
	for (var i = 0 ; i < LIST_TO_SORT.length ; i++) {
		LIST_TO_SORT[i].sketch.draw_body(CONTEXT.SKETCH, SCALE.value);
		LIST_TO_SORT[i].sketch.draw_trajectory(CONTEXT.SKETCH, SCALE.value, PLANE, CENTER, {ctx: CONTEXT.SKETCH2});
	}
}