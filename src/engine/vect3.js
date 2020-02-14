// Vector class
class vect3 {
	// Constructor
	constructor(x, y, z) {
        // [I,J,K] basis
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
	get module_2() {
		return (Math.square(this.x) + Math.square(this.y) + Math.square(this.z))
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
				   screen_origine.y + screen_vect.y * this.length);
		
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
			ctx.font = "13px Arial";
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