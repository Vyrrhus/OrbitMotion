// CONSTANTS
var UA 	= 149597870.7; 							// km
var G 	= 6.67408e-20; 							// m3/kg/s2

// Inertial coordinate frame
var I = [1,0,0];
var J = [0,1,0];
var K = [0,0,1];

// Screen size
var WIDTH  = document.getElementById('body').offsetWidth;
var HEIGHT = document.getElementById('body').offsetHeight;
var CENTER = [Math.floor (WIDTH/2),
			  Math.floor(HEIGHT/2)];
var PX 	= 12 * UA / Math.min(WIDTH, HEIGHT);		// km
/* At first, Earth is the outer border of the screen. Thus 2 UA <=> WIDTH or HEIGHT. */

// Canvas
var BACKGROUND 	= document.getElementById('background');
var ORBIT 		= document.getElementById('orbit');
var ANIMATION 	= document.getElementById('animation');
var TEXT 		= document.getElementById('text');
var CONTROL 	= document.getElementById('control');

// Contexts
var context_BACKGROUND 	= BACKGROUND.getContext('2d');
var context_ORBIT 		= ORBIT.getContext('2d');
var context_ANIMATION 	= ANIMATION.getContext('2d');
var context_TEXT 		= TEXT.getContext('2d');
var context_CONTROL 	= CONTROL.getContext('2d');

// Settings
var TIME = 0;
var dT = 3600;
var RUNNING = true;
var DRAW_ORBIT = false;
var FOCUS = {
	position: [0,0],
	planet: 'initialization',
	change: function(planet) {
		context_ORBIT.clearRect(0,0,WIDTH,HEIGHT);
		this.planet = planet;
		context_TEXT.clearRect(0,0,WIDTH,HEIGHT);
		this.draw();
	},
	draw: function() {
		context_TEXT.font = "16px Arial";
		context_TEXT.fillStyle = "#BBB";
		context_TEXT.fillText("Focus on : " + this.planet.name, 10, 60);
	}
};

// SI Units functions
function km_to_UA(value) {
	return value / UA;
}
function UA_to_km(value) {
	return value * UA;
}
function rad_to_deg(value) {
	return value / Math.PI * 180;
}
function deg_to_rad(value) {
	return value * Math.PI / 180;
}
function km_to_px(value) {
	return value / PX;
}

// Math functions
function square(value) {
	return Math.pow(value, 2);
}
function cube(value) {
	return Math.pow(value, 3);
}
function newton_raphson(guess, f, df) {
	if (df(guess) == 0) {return newton_raphson(guess+1, f, df);}
	let value_i = guess;
	let value_j = guess;
	let epsilon = 1e-15;
	do {
		value_i = value_j;
		value_j = value_i - f(value_i) / df(value_i);
	} while (Math.abs((value_j - value_i) / value_i) > epsilon)
	return value_j;
}
var matrix = {
	transpose: function(M) {
		/* Input checking first */
		let size_i = M.length;
		if (size_i == undefined) {return M;}
		let size_j = M[0].length;
		if (size_j == 1 && size_i == 1) {return M;}
		if (size_j == 0 || size_i == 0) {return null;}
		
		/* Transposition */
		let result = [];
		if (size_j > 0) {
			for (let j = 0 ; j < size_j ; j++) {
				let line = [];
				for (let i = 0 ; i < size_i ; i++) {
					line.push(M[i][j]);
				}
				result.push(line);
			}
		}
		else {
			for (let k = 0 ; k < size_i ; k++) {
				result.push([M[k]]);
			}
		}
		if (size_j == 1) {
			return result[0];
		}
		return result;
	},
	product: function(A, B) {
		// Input checking
		let size_A = A.length;
		let size_B = B.length;
		for (let k = 1 ; k < size_A ; k++) {
			if (A[k].length != A[0].length) {return null;}
		}
		for (let k = 1 ; k < size_B ; k++) {
			if (B[k].length != B[0].length) {return null;}
		}
		if (A[0].length != B.length) {
			console.log('Dimension error, check your input');
			return null;
		}
		
		// Initialization
		let result = [];
		for (i=0 ; i < A.length ; i++) {
			let line = [];
			for (j=0 ; j < B[0].length ; j++) {
				line.push(0);
			}
			result.push(line);
		}
		
		// Product
		for (let j = 0 ; j < B[0].length ; j++) {
			for (let i = 0 ; i < A.length ; i++) {
				let inner_sum = 0;
				for (let k = 0 ; k < B.length ; k++) {
					inner_sum += A[i][k] * B[k][j];
				}
				result[i][j] = inner_sum;
			}
		}
		return result;
	}
};
var vector = {
	module: function(v) {
		let result = 0;
		for (let k = 0, c = v.length ; k < c ; k++) {
			result += square(v[k]);
		}
		return Math.sqrt(result);
	},
	dot: function(u,v) {
		if (u.length != v.length && u.length != undefined) {
			console.log('Dimension error, check your inputs');
			return null;
		}
		let result = 0;
		for (let k = 0, c = u.length ; k < c ; k++) {
			result += u[k] * v[k];
		}
		return result;
	},
	cross: function(u,v) {
		if (u.length != v.length || u.length != 3) {
			console.log('Dimension error, check your inputs'); 
			return null;
		}
		else {
			let x = u[1]*v[2] - u[2]*v[1];
			let y = u[2]*v[0] - u[0]*v[2];
			let z = u[0]*v[1] - u[1]*v[0];
			return [x,y,z];
		}
		
	},
	scalar: function(a,u) {
		if (a.length > 1) {
			console.log('Dimension error, check your input'); 
			return null;
		}
		else {
			let result = u;
			for (let k = 0, c = u.length ; k < c ; k++) {
				result[k] *= a;
			}
			return result;
		}
	}
};

// Printer
function draw_circle(X,Y,RADIUS,COLOR,CONTEXT) {
	CONTEXT.beginPath();
	CONTEXT.arc(X,Y,RADIUS,0,Math.PI*2);
	CONTEXT.fillStyle = COLOR;
	CONTEXT.fill();
	CONTEXT.closePath();
}
function draw_point(X,Y,COLOR,CONTEXT) {
	CONTEXT.beginPath();
	CONTEXT.rect(X,Y,1,1);
	CONTEXT.fillStyle = COLOR;
	CONTEXT.fill();
	CONTEXT.closePath();
}


/*
	Use canonical units 1 ER = R+, TU = 806.8s, mu+ = 1 :
	- reduce size of numbers
	- more stable
	- speed up algorithms
	- reduce maintenance programming
	- Allow different people to use standard values
*/
