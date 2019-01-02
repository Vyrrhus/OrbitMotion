var Q = {};

// Create
Q.create = function() {
	if (arguments.length == 0) {
		return new Quaternion([1,0,0,0])
	}
	return new Quaternion(arguments)
};

// Conjugate
Q.conj = Q.conjugate = function(p) {
	return Q.create(p.w, -p.x, -p.y, -p.z);
};

// Inverse
Q.inv = Q.inverse = function(p) {
	var pBar = Q.conj(p),
		norm = p.norm();
	return Q.scale(1/(norm*norm), pBar);
};

// Scale
Q.scale = function(a, p) {
	return Q.create(a*p.w, a*p.x, a*p.y, a*p.z);
};

// Addition
Q.add = function(p, q) {
	var more, length;
	if (q instanceof Quaternion) {
		more = Array.prototype.slice.call(arguments, 2);
		length = arguments.length;
	} else {
		more = q.slice(1);
		q = q[0];
		length = more.length + 2;
	}
	var newW = p.w + q.w,
		newX = p.x + q.x,
		newY = p.y + q.y,
		newZ = p.z + q.z,
		r = Q.create(newW, newX, newY, newZ);
	if ( length == 2) {
		return r;
	}
	return Q.add(r, more);
};

// Dot product
Q.dot = function(p, q) {
	return p.w*q.w + p.x*q.x + p.y*q.y + p.z*q.z;
}

// Multiply
Q.mult = function(p, q) {
	var more, length;
	if (q instanceof Quaternion) {
		more = Array.prototype.slice.call(arguments, 2);
		length = arguments.length;
	} else {
		more = q.slice(1);
		q = q[0];
		length = more.length + 2;
	}
	var newA = p.w*q.w - p.x*q.x - p.y*q.y -p.z*q.z,
		newB = p.w*q.x + p.x*q.w + p.y*q.z - p.z*q.y,
		newC = p.w*q.y - p.x*q.z + p.y*q.w + p.z*q.x,
		newD = p.w*q.z + p.x*q.y - p.y*q.x + p.z*q.w,
		r = Q.create(newA, newB, newC, newD);
	if (length == 2 ) {
		return r;
	}
	return Q.mult(r, more)
};

// Rotation
Q.rot = Q.rotation = function(angle) {
	var u, args = arguments;
	if ( args[1].isQuaternion) {
		u = args[1];
		if ( u.hasReal ) {
			console.log("Warning: ignoring real component of rotation vector quaternion");
		}
		var length = Math.sqrt(u.x*u.x + u.y*u.y + u.z*u.z);
		u = Q.create(0, u.x/length,u.y/length, u.z/length);
	} else {
		if (arguments.length != 4) {
			args = arguments[1];
		}
		var length = Math.sqrt(args[1]*args[1] + args[2]*args[2] + args[3]*args[3]);
		u = Q.create(0, args[1]/length, args[2]/length, args[3]/length);
	}
	var newA = Math.cos(angle / 2),
		sine = Math.sin(angle / 2),
		newB = sine * u.x,
		newC = sine * u.y,
		newD = sine * u.z;
	return Q.create(newA,newB,newC,newD);
};

// Apply rotation
Q.R = Q.applyRotation = function(p) {
	var q = Q.$(),
		args = Array.prototype.slice.call(arguments, 1);
	while ( args.length ) {
		q = Q.mult(q,args.pop());
	}
	var r = Q.mult(q,p,Q.inv(q));
	return r;
};

// Compare quaternions
Q.eq = Q.equal = function(p, q) {
	var more, length;
	if ( q instanceof Quaternion ) {
		more = Array.prototype.slice.call(arguments, 2);
		length = arguments.length;
	} else {
		more = q.slice(1);
		q = q[0];
		length = more.length + 2;
	}
	var equal = (Math.abs(p.w - q.w) < 0.00000001 &&
				 Math.abs(p.x - q.x) < 0.00000001 &&
				 Math.abs(p.y - q.y) < 0.00000001 &&
				 Math.abs(p.z - q.z) < 0.00000001);
	if ( !equal || length == 2 ) {
		return equal;
	}
	return Q.eq(q, more);
};


// QUATERNION CLASS

function Quaternion(arg) {
	if ( arg != undefined && arg instanceof Quaternion ) {
		// Copy constructor
		this.w = arg.w;
		this.x = arg.x;
		this.y = arg.y;
		this.z = arg.z;
	} else {
		// Regular constructor
		this.w = arg[0];
		this.x = arg[1];
		this.y = arg[2];
		this.z = arg[3];
	}
}

Quaternion.prototype.toString = function() {
	var hash = (this.w != 0 ? 8 : 0) + (this.x != 0 ? 4 : 0) + (this.y != 0 ? 2 : 0) + (this.z != 0 ? 1 : 0);
	return "" + (this.w != 0 ? this.w : "") + (this.x != 0 ? (this.x > 0 ? (hash > 7 ? "+" : "") + this.x : this.x) + "i" : "") + (this.y != 0 ? (this.y > 0 ? (hash > 3 ? "+" : "") + this.y : this.y) + "j" : "") + (this.z != 0 ? (this.z > 0 ? (hash > 1 ? "+" : "") + this.z : this.z) + "k" : "");
};

Quaternion.prototype.isUnit = function() {
	var dot = Q.dot(this,this);
	return (dot > 0 && Math.abs(dot - 1) < 0.00000001);
};

Quaternion.prototype.hasReal = function() {
	return (Math.abs(this.w) > 0.00000001);
};

Quaternion.prototype.norm = function() {
	return Math.sqrt(this.w*this.w + this.x*this.x + this.y*this.y + this.z*this.z);
};