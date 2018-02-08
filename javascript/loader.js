// CONSTANTS
var UA 	= 149597870.7; 							// km
var G 	= 6.67408e-20; 							// m3/kg/s2

// Inertial coordinate frame
var I = [1,0,0];
var J = [0,1,0];
var K = [0,0,1];

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

// Canvas
var BACKGROUND 	= document.getElementById('background');
var ORBIT 		= document.getElementById('orbit');
var ANIMATION 	= document.getElementById('animation');
var TEXT 		= document.getElementById('text');
var CONTROL 	= document.getElementById('control');

// Contexts
var CONTEXT = {
	BACKGROUND: BACKGROUND.getContext('2d'),
	ORBIT: ORBIT.getContext('2d'),
	ANIMATION: ANIMATION.getContext('2d'),
	TEXT: TEXT.getContext('2d'),
	CONTROL: CONTROL.getContext('2d')
};

// Screen size
var WIDTH  = document.getElementById('body').offsetWidth;
var HEIGHT = document.getElementById('body').offsetHeight;
var CENTER = [Math.floor (WIDTH/2), Math.floor(HEIGHT/2)];


// Settings
var RUNNING = true;
var POSITION = {
	text: {
		time: {
		},
		focus: {},
		information: {}
	},
	button: {
		
	},
	scale: {
		length: Math.min(WIDTH, HEIGHT)/5,
		fontsize: 13,
		fontwidth: 7,
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
			return Math.floor((x-1)/9) - 8;
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
var PX 	= {
	value: ZOOM.value / Math.min(WIDTH, HEIGHT),		// km
	set: function() {
		PX.value = ZOOM.value / Math.min(WIDTH, HEIGHT);
	},
	scale: function(x,y) {
		let length = Math.min(WIDTH, HEIGHT)/5;
		let value = Math.round(PX.value/ZOOM.unit*length*1000)/1000;
		value = value.toString() + ZOOM.unit_name;
		let size = 7* value.length;
		CONTEXT.TEXT.clearRect(WIDTH-x-length-5,HEIGHT-y-10,x+length+5,y+10);
		CONTEXT.TEXT.beginPath();
		CONTEXT.TEXT.rect(WIDTH-length-x, HEIGHT-y-5, 1, 10);
		CONTEXT.TEXT.rect(WIDTH-x, HEIGHT-y-5, 1, 10);
		CONTEXT.TEXT.rect(WIDTH-length-x, HEIGHT-y,length,1);
		CONTEXT.TEXT.fillStyle = "#BBB";
		CONTEXT.TEXT.fill();
		CONTEXT.TEXT.closePath();
		CONTEXT.TEXT.font = "13px Arial";
		CONTEXT.TEXT.fillStyle = "#BBB";
		CONTEXT.TEXT.fillText(value, WIDTH-length/2-x-size/2, HEIGHT-y+15);
		
		CONTEXT.TEXT.beginPath();
		CONTEXT.TEXT.moveTo(WIDTH-x+length*(ZOOM.num/92-1), HEIGHT-y);
		CONTEXT.TEXT.lineTo(WIDTH-x+length*(ZOOM.num/92-1)-5, HEIGHT-y-10);
		CONTEXT.TEXT.lineTo(WIDTH-x+length*(ZOOM.num/92-1)+5, HEIGHT-y-10);
		CONTEXT.TEXT.fillStyle = "#BBB";
		CONTEXT.TEXT.fill();
		CONTEXT.TEXT.closePath();
	}
}

var TIME = {
	value: 0,
	date: '0',
	dT: 0,
	dT_memory: 3600,
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
		CONTEXT.TEXT.clearRect(10,10,WIDTH,25)
		CONTEXT.TEXT.font = "16px Arial";
		CONTEXT.TEXT.fillStyle = "#BBB";
		CONTEXT.TEXT.fillText("Time: " + this.date, 10, 30);
	}
};
var FOCUS = {
	position: [0,0],
	num: 0,
	planet: 'initialization',
	change: function(planet) {
		CONTEXT.ORBIT.clearRect(0,0,WIDTH,HEIGHT);
		this.planet = planet;
		CONTEXT.TEXT.clearRect(10,45,200,20);
		this.draw();
	},
	draw: function() {
		CONTEXT.TEXT.font = "16px Arial";
		CONTEXT.TEXT.fillStyle = "#BBB";
		CONTEXT.TEXT.fillText("Focus on : " + this.planet.name, 10, 60);
		CONTEXT.TEXT.clearRect(WIDTH/2-200,HEIGHT-150,400,150);
	}
};

// Controls
var BUTTON = {
	draw_ORBIT: {
		state: false,
		draw: function() {
			CONTEXT.CONTROL.clearRect(10, 70, 200, 30);
			let x = 0;
			if (this.state) {x = 15;}
			var img_BUTTON = new Image();
			img_BUTTON.onload = function() {
				CONTEXT.CONTROL.drawImage(img_BUTTON,x,0,15,15,15,75,15,15);
				CONTEXT.CONTROL.font = '13px Arial';
				CONTEXT.CONTROL.fillStyle = "#BBB";
				CONTEXT.CONTROL.fillText('Show orbits', 33, 88);
			};
			img_BUTTON.onerror = function() {
			console.log('failed to load !');
			};
			img_BUTTON.src = 'img/orbit.png';
		},
		switch: function() {
			this.state = !this.state;
			if (!this.state) {
				CONTEXT.ORBIT.clearRect(0,0,WIDTH,HEIGHT);
			}
			this.draw();
		}
	},
	draw_INFO: {
		state: false,
		characteristics: true,
		elements: false,
		vector: false,
		draw: function() {
			CONTEXT.CONTROL.clearRect(10, 100, 200, 80);
			let x0 = 0; let x1 = 0; let x2 = 0; let x3 = 0;
			if (this.state) {x0 = 15;}
			if (this.characteristics) {x1 = 15;}
			if (this.elements) {x2 = 15;}
			if (this.vector) {x3 = 15;}
			var img_BUTTON = new Image();
			img_BUTTON.onload = function() {
				CONTEXT.CONTROL.drawImage(img_BUTTON,x0,0,15,15,15,100,15,15);
				CONTEXT.CONTROL.font = '13px Arial';
				CONTEXT.CONTROL.fillStyle = "#BBB";
				CONTEXT.CONTROL.fillText('Show informations', 33, 113);
				if (BUTTON.draw_INFO.state) {
					CONTEXT.CONTROL.drawImage(img_BUTTON,x1,0,15,15,35,120,15,15);
					CONTEXT.CONTROL.fillText('Characteristics',53,133);
					CONTEXT.CONTROL.drawImage(img_BUTTON,x2,0,15,15,35,140,15,15);
					CONTEXT.CONTROL.fillText('Orbital elements',53,153);
					CONTEXT.CONTROL.drawImage(img_BUTTON,x3,0,15,15,35,160,15,15);
					CONTEXT.CONTROL.fillText('State vector',53,173);
				}
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
		size: 60, 
		play_pause: {
			X: WIDTH/2 - this.size,
			Y: HEIGHT- this.size * 4/3,
			state: false,
			pause: false,
			draw: function() {
				let posX = this.X;
				let posY = this.Y;
				CONTEXT.CONTROL.clearRect(posX, posY, BUTTON.draw_TIMELINE.size, BUTTON.draw_TIMELINE.size);
				var row = 0;
				var sx = 60;
				if (this.state) {row=1;}
				if (this.pause) {sx = 240;}
				var img_button = new Image();
				img_button.onload = function() {
					CONTEXT.CONTROL.drawImage(img_button,sx,60*row,60,60,posX,posY,BUTTON.draw_TIMELINE.size,BUTTON.draw_TIMELINE.size);
				}
				img_button.onerror = function() {
					console.log('failed to load !');
				}
				img_button.src = 'img/control.png';
			},
			switch: function() {
				this.pause = !this.pause;
				if (!this.pause) {
					TIME.dT_memory = TIME.dT;
					TIME.dT = 0;
				}
				else {
					TIME.dT = TIME.dT_memory;
				}
			},
			resize: function() {
				this.X = WIDTH/2 - BUTTON.draw_TIMELINE.size;
				this.Y = HEIGHT - 4/3*BUTTON.draw_TIMELINE.size;
			}
		},
		stop: {
			X: WIDTH/2,
			Y: HEIGHT-this.size * 4/3,
			state: false,
			draw: function() {
				let posX = this.X;
				let posY = this.Y;
				CONTEXT.CONTROL.clearRect(posX, posY, BUTTON.draw_TIMELINE.size, BUTTON.draw_TIMELINE.size);
				var row = 0;
				if (this.state) {row=1;}
				var img_button = new Image();
				img_button.onload = function() {
					CONTEXT.CONTROL.drawImage(img_button,120,60*row,60,60,posX,posY,BUTTON.draw_TIMELINE.size,BUTTON.draw_TIMELINE.size);
				}
				img_button.onerror = function() {
					console.log('failed to load !');
				}
				img_button.src = 'img/control.png';
			},
			resize: function() {
				this.X = WIDTH/2 ;
				this.Y = HEIGHT - 4/3*BUTTON.draw_TIMELINE.size;
			}
		},
		fast_forward: {
			X: WIDTH/2 + this.size,
			Y: HEIGHT-this.size * 4/3,
			state: false,
			draw: function() {
				let posX = this.X;
				let posY = this.Y;
				CONTEXT.CONTROL.clearRect(posX, posY, BUTTON.draw_TIMELINE.size, BUTTON.draw_TIMELINE.size);
				var row = 0;
				if (this.state) {row=1;}
				var img_button = new Image();
				img_button.onload = function() {
					CONTEXT.CONTROL.drawImage(img_button,180,60*row,60,60,posX,posY,BUTTON.draw_TIMELINE.size,BUTTON.draw_TIMELINE.size);
				}
				img_button.onerror = function() {
					console.log('failed to load !');
				}
				img_button.src = 'img/control.png';
			},
			resize: function() {
				this.X = WIDTH/2 +BUTTON.draw_TIMELINE.size;
				this.Y = HEIGHT - 4/3*BUTTON.draw_TIMELINE.size;
			}
		},
		rewind: {
			X: WIDTH/2 - 2*this.size,
			Y: HEIGHT - this.size * 4/3,
			state: false,
			draw: function() {
				let posX = this.X;
				let posY = this.Y;
				CONTEXT.CONTROL.clearRect(posX, posY, BUTTON.draw_TIMELINE.size, BUTTON.draw_TIMELINE.size);
				var row = 0;
				if (this.state) {row=1;}
				var img_button = new Image();
				img_button.onload = function() {
					CONTEXT.CONTROL.drawImage(img_button,0,60*row,60,60,posX,posY,BUTTON.draw_TIMELINE.size,BUTTON.draw_TIMELINE.size);
				}
				img_button.onerror = function() {
					console.log('failed to load !');
				}
				img_button.src = 'img/control.png';
			},
			resize: function() {
				this.X = WIDTH/2 - 2 * BUTTON.draw_TIMELINE.size;
				this.Y = HEIGHT - 4/3*BUTTON.draw_TIMELINE.size;
			}
		},
		draw: function () {
			this.fast_forward.resize();
			this.fast_forward.draw();
			this.stop.resize();
			this.stop.draw();
			this.play_pause.resize();
			this.play_pause.draw();
			this.rewind.resize();
			this.rewind.draw();
		}
	}
};
