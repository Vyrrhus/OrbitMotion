// Canvas
var BACKGROUND 	= document.getElementById('background');
var ORBIT 		= document.getElementById('orbit');
var ANIMATION 	= document.getElementById('animation');
var TEXT 		= document.getElementById('text');
var CONTROL 	= document.getElementById('control');
var SWITCH = false;

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
var CONFIG = {};
var CONFIG_LIST = [];
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
	x: 1,
	y: 1,
	state: false,
	length: Math.min(WIDTH,HEIGHT)/5,
	scale: function(x,y) {
		this.x = x;
		this.y = y;
		this.length = Math.min(WIDTH, HEIGHT)/5;
		let value = Math.round(PX.value/ZOOM.unit*this.length*1000)/1000;
		value = value.toString() + ZOOM.unit_name;
		let size = 7* value.length;
		CONTEXT.TEXT.clearRect(WIDTH-x-this.length-5,HEIGHT-y-10,x+this.length+5,y+10);
		CONTEXT.TEXT.beginPath();
		CONTEXT.TEXT.rect(WIDTH-this.length-x, HEIGHT-y-5, 1, 10);
		CONTEXT.TEXT.rect(WIDTH-x, HEIGHT-y-5, 1, 10);
		CONTEXT.TEXT.rect(WIDTH-this.length-x, HEIGHT-y,this.length,1);
		CONTEXT.TEXT.fillStyle = "#BBB";
		CONTEXT.TEXT.fill();
		CONTEXT.TEXT.closePath();
		CONTEXT.TEXT.font = "13px Arial";
		CONTEXT.TEXT.fillStyle = "#BBB";
		CONTEXT.TEXT.fillText(value, WIDTH-this.length/2-x-size/2, HEIGHT-y+15);
		
		CONTEXT.TEXT.beginPath();
		CONTEXT.TEXT.moveTo(WIDTH-x+this.length*(ZOOM.num/92-1), HEIGHT-y);
		CONTEXT.TEXT.lineTo(WIDTH-x+this.length*(ZOOM.num/92-1)-5, HEIGHT-y-10);
		CONTEXT.TEXT.lineTo(WIDTH-x+this.length*(ZOOM.num/92-1)+5, HEIGHT-y-10);
		CONTEXT.TEXT.fillStyle = "#BBB";
		CONTEXT.TEXT.fill();
		CONTEXT.TEXT.closePath();
	}
};
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
			img_BUTTON.src = 'src/img/orbit.png';
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
			img_BUTTON.src = 'src/img/orbit.png';
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
				img_button.src = 'src/img/control.png';
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
				img_button.src = 'src/img/control.png';
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
				img_button.src = 'src/img/control.png';
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
				img_button.src = 'src/img/control.png';
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

function init() {
	for (var element in DATA) {
		element = DATA[element];
		let orbit = element.orbit;
		
		if (!orbit) {
			CONFIG[element.name] = new Body(element.name,
										    element.mass,
										    element.radius,
										    element.color,
										    orbit);
			var body_to_focus = element.name
		} else {
			CONFIG[element.name] = new Body(element.name,
										    element.mass,
										    element.radius,
										    element.color,
										    new Orbit(CONFIG[orbit.body],
													  orbit.i, orbit.W, 
													  orbit.a, orbit.e,
													  orbit.w, orbit.v));
		}
	CONFIG_LIST.push(CONFIG[element.name]);
	}
	FOCUS.change(CONFIG[body_to_focus]);
	draw();
}

function draw() {
	CONTEXT.ANIMATION.clearRect(0,0,WIDTH,HEIGHT);
	if (SWITCH) {
		planet_animation();
	} else {
		n_body_animation();
	}
	TIME.value += TIME.dT;
	TIME.draw();
	FOCUS.planet.setFocus();
	planet_draw();
	
	if (RUNNING) {requestAnimationFrame(draw);}
}


function planet_animation() {
	for (var element in CONFIG) {
		element = CONFIG[element];
		if (element.orbit != null) {
			element.orbit.motion(TIME.dT);
		}
	}
}

function n_body_animation() {
	for (var i = 0 ; i < CONFIG_LIST.length ; i++) {
		for (var j = i+1 ; j < CONFIG_LIST.length ; j++) {
			get_force(CONFIG_LIST[i], CONFIG_LIST[j]);
		}
	}
	for (var element in CONFIG) {
		e = CONFIG[element];
		if (e.orbit !== null) {
			var acc = vector.scalar(1/e.mass, [e.orbit.force.x, e.orbit.force.y, e.orbit.force.z]);
			e.orbit.n_body(acc, TIME.dT);
			e.orbit.force.reset();
		}
	}
}

function planet_draw() {
	for (var element in CONFIG) {
		element = CONFIG[element];
		element.draw();
	}
}

init()