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

// Vector class
class vect3 {
	// Constructor
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	// Properties
	get module() {
		return Math.sqrt(Math.square(this.x) + Math.square(this.y) + Math.square(this.z))
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
	static product(M, u) {
		return new vect3(u.x * M.x.x + u.y * M.x.y + u.z * M.x.z,
						 u.x * M.y.x + u.y * M.y.y + u.z * M.y.z,
						 u.x * M.z.x + u.y * M.z.y + u.z * M.z.z)
	}
	static distance(u,v) {
		return Math.sqrt(vect3.square_distance(u,v))
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
var I = new vect3(1,0,0);
var J = new vect3(0,1,0);
var K = new vect3(0,0,1);