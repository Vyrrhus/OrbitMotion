// CONSTANTS
var UA 	= 149597870.7; 							// km
var G 	= 6.67408e-20; 							// m3/kg/s2

// Inertial coordinate frame
var I = [1,0,0];
var J = [0,1,0];
var K = [0,0,1];

// Settings
var RUNNING = true;
var TIME = {
	value: 0,
	date: '0',
	dT: 0,
	dT_memory: 3600,
	num: '0',
	s_to_date: function() {
		let time = Math.floor(TIME.value);
		let y = Math.floor(time / (365.25*24*3600));
		let d = Math.floor((time - y * (365.25*24*3600)) / (24*3600));
		let h = Math.floor((time - (365.25*y + d) * 24 * 3600) / (3600));
		let m = Math.floor((time - ((365.25*y+d)*24 + h) * 3600) / 60);
		let s = time - (((365.25*y + d)* 24 + h)*60+m)*60;
		this.date = str_date(y) + 'y ' + str_date(d) + 'd - ' + str_date(h) + ':' + str_date(m) + ':' + str_date(s);
		
		function str_date(x) {
			let date = x.toString();
			let len = date.length;
			if (len == 1) {date = '0'+date;}
			return date;
		}
	},
	draw: function() {
		this.s_to_date();
		context_TEXT.clearRect(10,10,WIDTH,25)
		context_TEXT.font = "16px Arial";
		context_TEXT.fillStyle = "#BBB";
		context_TEXT.fillText("Time: " + this.date, 10, 30);
	}
};
var FOCUS = {
	position: [0,0],
	num: 0,
	planet: 'initialization',
	change: function(planet) {
		context_ORBIT.clearRect(0,0,WIDTH,HEIGHT);
		this.planet = planet;
		context_TEXT.clearRect(10,45,200,20);
		this.draw();
	},
	draw: function() {
		context_TEXT.font = "16px Arial";
		context_TEXT.fillStyle = "#BBB";
		context_TEXT.fillText("Focus on : " + this.planet.name, 10, 60);
	}
};
var ZOOM = {
	value: 1 * UA,
	unit: UA,
	unit_name: 'UA',
	num: 64,
	a: function(x) {
		if (this.unit == 1) {
			return Math.floor(x/9);
		}
		else {
			return Math.floor((x-1)/9) - 7;
		}
	},
	b: function(x) {
		if (this.unit == 1) {
			return x % 9 + 1;
		}
		else {
			return (x-1) % 9 + 1;
		}
	}
};

// Screen size
var WIDTH  = document.getElementById('body').offsetWidth;
var HEIGHT = document.getElementById('body').offsetHeight;
var CENTER = [Math.floor (WIDTH/2),
			  Math.floor(HEIGHT/2)];
var PX 	= {
	value: ZOOM.value / Math.min(WIDTH, HEIGHT),		// km
	set: function() {
		PX.value = ZOOM.value / Math.min(WIDTH, HEIGHT);
	},
	scale: function(x,y) {
		let length = Math.min(WIDTH, HEIGHT)/10;
		let value = Math.round(PX.value/ZOOM.unit*length*100)/100;
		value = value.toString() + ZOOM.unit_name;
		let size = 7* value.length;
		context_TEXT.clearRect(WIDTH-x-length-5,HEIGHT-y-10,x+length+5,y+10);
		context_TEXT.beginPath();
		context_TEXT.rect(WIDTH-length-x, HEIGHT-y-5, 1, 10);
		context_TEXT.rect(WIDTH-x, HEIGHT-y-5, 1, 10);
		context_TEXT.rect(WIDTH-length-x, HEIGHT-y,length,1);
		context_TEXT.fillStyle = "#BBB";
		context_TEXT.fill();
		context_TEXT.closePath();
		context_TEXT.font = "13px Arial";
		context_TEXT.fillStyle = "#BBB";
		context_TEXT.fillText(value, WIDTH-length/2-x-size/2, HEIGHT-y+15);
	}
}
	

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
	return value / PX.value;
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

// Controls
var BUTTON = {
	draw_ORBIT: {
		state: false,
		draw: function() {
			context_CONTROL.clearRect(10, 70, 200, 30);
			let x = 0;
			if (this.state) {x = 15;}
			var img_BUTTON = new Image();
			img_BUTTON.onload = function() {
				context_CONTROL.drawImage(img_BUTTON,x,0,15,15,15,75,15,15);
				context_CONTROL.font = '13px Arial';
				context_CONTROL.fillStyle = "#BBB";
				context_CONTROL.fillText('Show orbits', 33, 88);
			};
			img_BUTTON.onerror = function() {
			console.log('failed to load !');
			};
			img_BUTTON.src = 'img/orbit.png';
		},
		switch: function() {
			this.state = !this.state;
			this.draw();
		}
	},
	draw_TIMELINE: {
		state: true,
		draw: function() {
			context_CONTROL.clearRect(WIDTH/2 - 180,HEIGHT-240,360,240);
			let sy = 80;
			if (this.state) {sy = 0;}
			var img_TIMELINE = new Image();
			var img_INFO = new Image();
			img_TIMELINE.onload = function() {
				context_CONTROL.drawImage(img_TIMELINE,0,sy,320,80,WIDTH/2-160,HEIGHT-100,320,80);
			};
			img_TIMELINE.onerror = function() {
				console.log('failed to load !');
			};
			img_TIMELINE.src = 'img/control.png';
			img_INFO.onload = function() {
				context_CONTROL.drawImage(img_INFO,WIDTH/2-120,HEIGHT-160,240,60);
			};
			img_INFO.onerror = function() {
				console.log('failed to load !');
			};
			img_INFO.src = 'img/info.png';
		},
		switch: function() {
			this.state = !this.state;
			if (this.state) {
				TIME.dT_memory = TIME.dT;
				TIME.dT = 0;
			}
			else {
				TIME.dT = TIME.dT_memory;
			}
			this.draw();
		}
	}
};

/*
	Use canonical units 1 ER = R+, TU = 806.8s, mu+ = 1 :
	- reduce size of numbers
	- more stable
	- speed up algorithms
	- reduce maintenance programming
	- Allow different people to use standard values
*/
