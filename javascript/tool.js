// CONSTANTS
var UA 	= 149597870.7; 							// km
var G 	= 6.67408e-20; 							// km3/kg/s2

// Toolbox for conversion or maths
tool = {
	km_to_UA: function(value) {
		return value / UA;
	},
	UA_to_km: function(value) {
		return value * UA;
	},
	
	rad_to_deg: function(value) {
		return value / Math.PI * 180;
	},
	deg_to_rad: function(value) {
		return value / 180 * Math.PI;
	},
	quadrant: function(cos, sin) {
		if (sin > 0) {
			return Math.acos(cos)
		} else {
			return 2 * Math.PI - Math.acos(cos)
		}
	},
	newton_raphson: function(guess, f, df, epsilon) {
		if (df(guess) == 0) {
			// This ain't right as it's not guaranteed to be close enough to the exact solution.
			return tool.newton_raphson(guess+1, f, df);
		}
		let i = guess;
		let j = guess;
		do {
			i = j;
			j = i - f(i) / df(i);
		} while (Math.abs((j-i) / i) > epsilon)
		return j
	}
};

Math.square = function(value) {
	return value * value;
};
Math.cube = function(value) {
	return Math.pow(value, 3);
};
Number.prototype.pad = function() {
	return ('0' + this).slice(-2);
}
Date.prototype.strDate = function() {
	let year = this.getFullYear().toString();
	if (this.getFullYear() < 0) {year += " BC"}
	return year + "-" + (1+ this.getMonth()).pad() + "-" + this.getDate().pad()
}
Date.prototype.strTime = function() {
	return this.getHours().pad() + ":" + this.getMinutes().pad() + ":" + this.getSeconds().pad()
}
Date.prototype.str = function() {
	return this.strDate() + " " + this.strTime()
}

// Vector class
class vect3 {
	// Constructor
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		
		// Properties
		this.length = 80;	// px
		this.height = 7;	// px
		this.width 	= 7; 	// px
	}
	
	// Getters
	get module() {
		return Math.hypot(this.x, this.y, this.z)
	}
	get unit() {
		if (this.module === 0) {
			return this
		} else {
			return vect3.scale(1/this.module, this);
		}
	}
	
	// Methods
	project(plane) {
		var x = vect3.dot(this.unit, plane.x);
		var y = vect3.dot(this.unit, plane.y);
		return {x: vect3.dot(this.unit, plane.x),
			    y: vect3.dot(this.unit, plane.y)}
	}
	draw(ctx, plane, options) {
		// Key arguments
		if (options === undefined) {
			options = {};
		}
		if (options.center === undefined) {
			options.center = CENTER;
		}
		if (options.origine === undefined) {
			options.origine = [new vect3(0,0,0)];
		} else if (options.origine.constructor.name === "vect3") {
			options.origine = [options.origine];
		}
		if (options.color === undefined) {
			options.color = "#FFF";
		}
		if (options.length !== undefined) {
			this.length = options.length
		}
		if (options.type === undefined) {
			options.type = 'line';
		}
		
		// Screen origine for the vector
		var screen_origine = {x: options.center.x, y: options.center.y};
		
		for (let i = 0 ; i < options.origine.length ; i++) {
			let unit = options.origine[i].project(plane);
			let length = options.origine[i].length;
			screen_origine.x += unit.x * length;
			screen_origine.y += unit.y * length;
		}
		
		// Unit vector
		var screen_vect = this.project(plane);
		screen_vect.y *= -1;
		
		// Drawing
		ctx.beginPath();
		ctx.moveTo(screen_origine.x, screen_origine.y);
		ctx.lineTo(screen_origine.x + screen_vect.x * this.length, 
				   screen_origine.y + screen_vect.y * this.length);4
		
		if (options.type == 'vec') {
			ctx.moveTo(screen_origine.x + screen_vect.x * (this.length - this.height) - this.width * screen_vect.y,
					   screen_origine.y + screen_vect.y * (this.length - this.height) + this.width * screen_vect.x);
			ctx.lineTo(screen_origine.x + screen_vect.x * this.length, 
					   screen_origine.y + screen_vect.y * this.length);
			ctx.moveTo(screen_origine.x + screen_vect.x * (this.length - this.height) + this.width * screen_vect.y,
					   screen_origine.y + screen_vect.y * (this.length - this.height) - this.width * screen_vect.x);
			ctx.lineTo(screen_origine.x + screen_vect.x * this.length, 
					   screen_origine.y + screen_vect.y * this.length);
			}
		ctx.strokeStyle = options.color;
		ctx.stroke();
		
		// Text
		if (options.text !== undefined) {
			ctx.font = "15px Arial";
			ctx.fillStyle = options.color;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(options.text, 
					 	screen_origine.x + screen_vect.x * (this.length + 15),
					 	screen_origine.y + screen_vect.y * (this.length + 15))
		}
	}
	
	// Static methods
	static dot(u, v) {
		return u.x * v.x + u.y * v.y + u.z * v.z;
	}
	static cross(u, v) {
		return new vect3(u.y * v.z - u.z * v.y,
						 u.z * v.x - u.x * v.z,
						 u.x * v.y - u.y * v.x)
	}
	static scale(a, u) {
		return new vect3(u.x * a,
						 u.y * a,
						 u.z * a)
	}
	static sum(a, u, b, v) {
		u = vect3.scale(a, u);
		v = vect3.scale(b, v);
		return new vect3(u.x + v.x,
						 u.y + v.y,
						 u.z + v.z)
	}
	static add() {
		var rslt = new vect3(0,0,0);
		for (var i = 0 ; i < arguments.length ; i++) {
			rslt = this.sum(1,rslt,1,arguments[i]);
		}
		return rslt
	}
	static diff(u,v) {
		return this.sum(1,u,-1,v)
	}
	static product(M, u) {
		return new vect3(u.x * M.x.x + u.y * M.x.y + u.z * M.x.z,
						 u.x * M.y.x + u.y * M.y.y + u.z * M.y.z,
						 u.x * M.z.x + u.y * M.z.y + u.z * M.z.z)
	}
	static distance(u,v) {
		return Math.hypot(u.x-v.x, u.y-v.y, u.z-v.z)
	}
	static square_distance(u,v) {
		return Math.square(u.x - v.x) + Math.square(u.y - v.y) + Math.square(u.z - v.z)
	}
}

class quat {
	// Constructor
	constructor(w, x, y, z) {
		this.w = w;
		this.x = x;
		this.y = y;
		this.z = z;
	}
	// Properties
	get conj() {
		return new quat(this.w, - this.x, - this.y, - this.z)
	}
	get round() {
		function set_round(e) {
			return Math.round(e*1e10)/1e10
		}
		return new quat(set_round(this.w),
						set_round(this.x),
						set_round(this.y),
						set_round(this.z))
	}
	
	// Static methods
	static hamilton(u, v) {
		var H = new quat(u.w * v.w - u.x * v.x - u.y * v.y - u.z * v.z,
					    u.w * v.x + v.w * u.x + u.y * v.z - u.z * v.y,
					    u.w * v.y - u.x * v.z + u.y * v.w + u.z * v.x,
					    u.w * v.z + u.x * v.y - u.y * v.x + u.z * v.w);
		return H
	}
	static rotate(u, angle, axis) {
		angle = tool.deg_to_rad(angle)
		var R = new quat(Math.cos(angle/2),
						 Math.sin(angle/2) * axis.x,
						 Math.sin(angle/2) * axis.y,
						 Math.sin(angle/2) * axis.z);
		var R_conj = R.conj;
		var P = new quat(0, u.x, u.y, u.z);
		var P_rot = quat.hamilton(quat.hamilton(R, P),R_conj);
		P_rot = P_rot.round;
		return new vect3(P_rot.x, P_rot.y, P_rot.z);
	}
}

// Inertial coordinate vectors
const I = new vect3(1,0,0);
const J = new vect3(0,1,0);
const K = new vect3(0,0,1);

const U = new vect3(0.9174992863750878, 0, 0.39773742532128487);
const V = new vect3(-0.39773742532128487, 0, 0.9174992863750878);