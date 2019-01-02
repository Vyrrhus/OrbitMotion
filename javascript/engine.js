// Body class
class Body {
	// Constructor
	constructor(name, color, mass, radius) {
		this.name 	= name;
		this.color 	= color;
		this.mass 	= mass;
		this.radius = radius;
		this.G =
		this.gravitationalParameter = G * mass;		// ==> à convertir pour être homogène en UA ou convertir toutes orbites en km
		
		// Bodies within SOI
		this.child = [];
		
		// State vectors (relative to the reference)
		this.position = new vect3(0,0,0);
		this.velocity = new vect3(0,0,0);
		this.reference = 'inertial';		// either 'inertial' or another Body class instance.
		
		// Keplerian orbit
		this.orbit = null;
		
		// N-body orbit
		this.n_body = null;
		
		// Sketch
		this.sketch = new Sketch(this);
	}
	
	// Getter
	get abs_position() {
		var ref = this.reference;
		var position = this.position;
		while (ref !== 'inertial') {
			position = vect3.sum(1,position,1,ref.position);
			ref = ref.reference;
		}
		return position
	}
	get SOI() {
		if (this.orbit === null) {
			return undefined
		} else {
			return this.orbit.a * Math.pow(this.mass/this.orbit.parent.mass, 2/5)
		}	
	}
	get abs_state() {
		var ref = this.reference;
		var position = this.position;
		var velocity = this.velocity;
		while (ref !== 'inertial') {
			position = vect3.sum(1,position,1,ref.position);
			velocity = vect3.sum(1,velocity,1,ref.velocity);
			ref = ref.reference;
		}
		return {position: position, velocity: velocity}
	}
	
	// Methods
	init_state(x, y, z, vx, vy, vz, reference) {
		/*
			Initialization of state & reference
		*/
		if (reference === undefined) {
			this.reference = 'inertial';
		} else {
			this.reference = reference;
		}
		this.position = new vect3(x, y, z);
		this.velocity = new vect3(vx, vy, vz);
	}
	get_rel_state(reference) {
		var abs_state = this.abs_state;
		while (reference !== 'inertial') {
			abs_state.position = vect3.sum(1,abs_state.position,-1,reference.position);
			abs_state.velocity = vect3.sum(1,abs_state.velocity,-1,reference.velocity);
			reference = reference.reference;
		}
		return abs_state
	}
	
	get_orbit(central_body) {
		/*
			The hardest thing is to find which is the central body.
			It mustn't be massless, hence there must be a gravitational parameter.
			Initial state vectors have to be set up carefully considering those of the central body (and its own central body as long as one exists)
		*/
		var central_G = central_body.G;
		
		// Initial state vectors
		var r = this.position;
		var v = this.velocity;
		
		// Angular momentum vector
		var h = vect3.cross(r, v);
		
		// Node vector
		var n = vect3.cross(K, h);
		
		// Eccentricity vector
		var e = vect3.scale(1 / central_G, 
							vect3.sum(vect3.dot(v,v) - central_G / r.module, 
									  r, 
									  - vect3.dot(r, v), 
									  v));
		
		// Specific mechanical energy
		var E = vect3.dot(v,v) / 2 - central_G / r.module;
		
		// Shape parameters
		if (e.module !== 1) {
			var a = - central_G / (2 * E);				// semi-major axis [km]
			var p = a * (1-Math.square(e.module)) 		// semi-parameter [km]
		} else {
			var a = Infinity;							// semi-major axis [km]
			var p = Math.square(h.module) / central_G	// semi-parameter [km]
		}
		
		// Common angles
		var i = Math.acos(h.z / h.module);				// inclination [rad]
		var W = Math.acos(n.x / n.module);				// Longitude of the Ascending Node [rad]
		if (n.y < 0) {
			W = 2 * Math.PI - W;
		}
		var w = Math.acos(vect3.dot(n, e) / (n.module * e.module));		// Argument of the periapsis
		if (e.z < 0) {
			w = 2 * Math.PI - w;
		}
		var TA = Math.acos(vect3.dot(e, r) / (e.module * r.module));	// True anomaly
		if (vect3.dot(r, v) < 0) {
			TA = 2 * Math.PI - TA;
		}
		
		// Special cases angles
		var w_true = Math.acos(e.x / e.module);							// True longitude of periapsis (non-circular equatorial)
		if (e.y < 0) {
			w_true = 2 * Math.PI - w_true;
		}
		var u = Math.acos(vect3.dot(n, r) / (n.module * r.module));		// Argument of latitude (circular inclined)
		if (r.z < 0) {
			u = 2 * Math.PI - u;
		}
		var l = Math.acos(r.x / r.module);								// True longitude
		if (r.y < 0) {
			l = 2 * Math.PI - l;
		}
		
		this.orbit = new Orbit(central_body, i, W, e.module, a, w, TA, {h: h.module, E: E, w_true: w_true, u: u, l_true: l});
	}
	kepler_motion(dT, TESTING_BODY) {
		if (this.orbit === null) {
			return
		}
		
		// Set orbit from state vectors
		this.get_orbit(this.orbit.parent);
		
		// Get initial guess for anomaly
		if (this.orbit.special_case === "circular equatorial" || this.orbit.special_case === 'circular inclined') {
			var guess = this.latitude;
		} else {
			var guess = this.orbit.v_to_anomaly(this.orbit.v);
		}
		
		// Get anomaly
		if (this.orbit.shape === 'ellipse') {
			var mean_anomaly = guess - this.orbit.e * Math.sin(guess) + this.orbit.n * dT;
		} else if (this.orbit.shape === 'parabola') {
			var mean_anomaly = this.orbit.n * dT;
		} else {
			var mean_anomaly = this.orbit.e * Math.sinh(guess) - guess + this.orbit.n * dT;
		}
		var anomaly = this.orbit.mean_to_anomaly(mean_anomaly);
		
		// Get true anomaly
		if (this.orbit.special_case === 'circular equatorial' || this.orbit.special_case === 'circular inclined') {
			this.orbit.latitude = anomaly;
		} else {
			this.orbit.v = this.orbit.anomaly_to_v(anomaly);
		}
		
		// Get state vectors
		var state = this.orbit.get_state();
		this.position = state.r;
		this.velocity = state.v;
		
		if (this === TESTING_BODY) {
			var v = Math.round(1e2*this.orbit.kepler.v)/1e2;
			console.log(`${v}° - v = ${this.velocity.module} km/s`);
			if (v === 0 || v === 360) {
				console.log('orbit');
			}
		}
		
		// SOI Checks
		// 1st check: out of parent SOI (if not around primary object)
		if (this.orbit.parent.orbit !== null && Body.get_distance(this, this.orbit.parent) >= this.orbit.parent.SOI) {
			console.log(`${this.name} leaves ${this.orbit.parent.name}'s orbit`);
			var reference = this.orbit.parent.orbit.parent;
			var rel_state = this.get_rel_state(reference);
			
			this.reference = reference;
			this.position = rel_state.position;
			this.velocity = rel_state.velocity;
			
			this.orbit.parent.child.splice(this.orbit.parent.child.indexOf(this), 1);
			this.reference.child.push(this);
			
			this.get_orbit(this.reference);
			console.log(`${this.name} enters ${this.reference.name}'s orbit`);
		}
		// 2nd check: crossing other children SOI
		for (var i = 0 ; i < this.orbit.parent.child.length ; i++) {
			var child = this.orbit.parent.child[i];
			if (child === this) {
				continue
			}
			if (Body.get_distance(this, child) <= child.SOI) {
				console.log(`${this.name} leaves ${this.orbit.parent.name}'s orbit`);
				var rel_state = this.get_rel_state(child);
				
				this.reference = child;
				this.position = rel_state.position;
				this.velocity = rel_state.velocity;
				
				this.orbit.parent.child.splice(this.orbit.parent.child.indexOf(this), 1);
				this.reference.child.push(this);
				
				this.get_orbit(this.reference);
				console.log(`${this.name} enters ${this.reference.name}'s orbit`);
			}
		}
	}
	move(list_body, dT) {
		/*
			Given a step time dT, update this.position, this.velocity & this.reference.
			Either use this.orbit (Keplerian motion) or n-body method (ie sum all the forces exerted on the body, get acceleration then Verlet's method)
			It might even be a good thing to be able to use both approaches with a "ghost" point (ie a sketch for orbit and a sketch for body ? A specific class for n-body ? State vectors for Kepler and others for n-body?)
			
			As for Kepler's method:
			- check SOI for parabolas & hyperbolas
			- choose wisely a minimum step TIME according to the body position / velocity.
			
			There will be a GENERAL STEP TIME.
			If the local one is lesser, use the general one for an iteration.
			If the local one is greater, store the accumulated general step times until the sum reaches the local one, then iterate and reset.
			That might save a lot of computations and thus improve efficiency with large orbits.
			
			
			Work in progress:
			-> sketch for Kepler orbits
					check: data.js filled with state vectors rather than orbital elements
					To go further, improve Orbit class so that it can be set directly with orbital elements
			-> sketch for n-body problem (should be the same, maybe with another couple of state vectors)
			-> set the transition between n-body and Kepler
		*/
		if (this.n_body === null) {
			this.n_body = new N_body(this, dT);
		}
		this.position = this.n_body.verlet(list_body, dT);
	}
	
	// Static methods
	static get_distance(A,B) {
		return vect3.distance(A.abs_position, B.abs_position)
	}
	static get_specific_force(attracted, attractor) {
		var vect_dist = vect3.sum(-1,attracted.abs_position, 1, attractor.abs_position);
		return vect3.scale(G * attractor.mass / vect3.square_distance(attracted.abs_position, attractor.abs_position),
						   vect3.scale(1/vect_dist.module, vect_dist))
	}
}

class Orbit {
	// Constructor
	constructor(central_body, inclination, node, eccentricity, semi_major_axis, argument, true_anomaly,
				{h: angular_momentum, E: specific_energy, w_true: true_periapsis, u: latitude, l_true: true_longitude}) {
		// Reference body
		this.parent = central_body;

		// Kepler elements
		this.i		= this.inclination 			= inclination; 		// [rad];
		this.W		= this.AN_longitude 		= node;  			// [rad]
		this.e		= this.eccentricity 		= eccentricity;		// []
		this.a		= this.semi_major_axis 		= semi_major_axis; 	// UA
		this.w		= this.periapsis_argument	= argument; 		// [rad]
		this.v		= this.true_anomaly 		= true_anomaly; 	// [rad]
		
		this.h		= this.angular_momentum 	= angular_momentum;	// [UA²/s]
		this.E		= this.specific_energy 		= specific_energy;	// [UA²/s²]
		this.w_true	= this.true_periapsis 		= true_periapsis;	// [rad]
		this.u 		= this.latitude 			= latitude;			// [rad]
		this.l_true	= this.true_longitude 		= true_longitude;	// [rad]
		
		// Derived elements
		this.p 		= this.semi_parameter		= this.h * this.h / this.parent.G; // [UA]
		
		// Shape
		this.shape 			= "";
		this.special_case 	= null;
		var criterion = 1e-5;	// Tolerance for orbit definition
		
		// Ellipse
		if (this.e < 1 - criterion) {
			this.shape = "ellipse";
			if (this.e < criterion) {
				if (this.i < criterion) {
					this.special_case = "circular equatorial";
				} else {
					this.special_case = "circular inclined";
				}
			} else if (this.i < criterion) {
				this.special_case = "elliptical equatorial";
			}
			this.n = this.mean_motion 	= Math.sqrt(this.parent.G / Math.cube(this.a)); 	// [rad/s]
			this.P = this.period		= 2 * Math.PI / this.n;
		}
		
		// Parabola
		if (Math.abs(this.e - 1) < criterion) {
			this.shape = "parabola";
			this.n = this.mean_motion = 2 * Math.sqrt(this.parent.G / Math.cube(this.p)); 	// [rad/s]
		}
		
		// Hyperbola
		if (this.e > 1 + criterion) {
			this.shape = "hyperbola";
			this.n = this.mean_motion = Math.sqrt(this.parent.G / - Math.cube(this.a));	// [rad/s]
		}
	}
	
	// Getters
	get kepler() {
		var kepler_elements = {Central_body: this.parent,
							   i: tool.rad_to_deg(this.i), W: tool.rad_to_deg(this.W), e: this.e, a: this.a, w: tool.rad_to_deg(this.w), v: tool.rad_to_deg(this.v)};
		return kepler_elements;
	}
	
	// Methods
	v_to_anomaly(v) {
		if (this.shape === "ellipse") {
			// Ellipse
			let sin_v = Math.sin(v);
			let cos_v = Math.cos(v);
			let sin_E = (sin_v * Math.sqrt(1 - this.e * this.e)) / (1 + this.e * cos_v);
			let cos_E = (this.e + cos_v) / (1 + this.e * cos_v);
			return tool.quadrant(cos_E, sin_E);
		} else if (this.shape === "hyperbola") {
			// Hyperbola
			let sin_v = Math.sin(v);
			let cos_v = Math.cos(v);
			return Math.asinh((sin_v * Math.sqrt(this.e * this.e - 1)) / (1 + this.e * cos_v));
		} else {
			// Parabola
			return Math.tan(v/2);
		}
	}
	anomaly_to_v(anomaly, r) {
		if (this.shape === "ellipse") {
			// Ellipse
			let sin_E = Math.sin(anomaly);
			let cos_E = Math.cos(anomaly);
			let sin_v = (sin_E * Math.sqrt(1 - this.e * this.e)) / (1 - this.e * cos_E);
			let cos_v = (cos_E - this.e) / (1 - this.e * cos_E);
			return tool.quadrant(cos_v, sin_v);
		} else if (this.shape === "hyperbola") {
			// Hyperbola
			let sinh_H = Math.sinh(anomaly);
			let cosh_H = Math.cosh(anomaly);
			let sin_v = (- sinh_H * Math.sqrt(this.e * this.e - 1)) / (1 - this.e * cosh_H);
			let cos_v = (cosh_H - this.e) / (1 - this.e * cosh_H);
			return tool.quadrant(cos_v, sin_v);
		} else {
			// Parabola
			let sin_v = this.p * anomaly / r;
			let cos_v = (this.p - r) / r;
			return tool.quadrant(cos_v, sin_v);
		}
	}
	mean_to_anomaly(M) {
		/*
			Given the mean anomaly, returns either the Eccentric, Parabolic or Hyperbolic anomaly.
		*/
		if (this.shape === "ellipse") {
			// Ellipse
			var e = this.e
			// Initial guess
			if ((M > - Math.PI && M < 0) || (M > Math.PI)) {
				var E0 = M - e;
			} else {
				var E0 = M + e;
			}
			// Kepler equations
			function f(E) {
				return E - e * Math.sin(E) - M
			}
			function df(E) {
				return 1 - e * Math.cos(E)
			}
			// Newton-Raphson scheme
			return tool.newton_raphson(E0, f, df, 1e-8)
			
		} else if (this.shape === "hyperbola") {
			// Hyperbola
			var e = this.e;
			// Initial guess
			if (e < 1.6) {
				if ((M > - Math.PI && M < 0) || (M > Math.PI)) {
					var H0 = M - e;
				} else {
					var H0 = M + e;
				}
			} else if (e < 3.6 && Math.abs(M) > Math.PI) {
				var H0 = M - Math.sign(M) * e;
			} else {
				var H0 = M / (e-1);
			}
			// Kepler equations
			function f(H) {
				return - H - M + e * Math.sinh(H)
			}
			function df(H) {
				return e * Math.cosh(H) - 1
			}
			// Newton-Raphson scheme
			return tool.newton_raphson(H0, f, df, 1e-8)
			
		} else {
			// Parabola
			
			function f(B) {
				return Math.cube(B) / 3 + B - M
			}
			function df(B) {
				return Math.square(B) + 1
			}
			// Newton-raphson scheme
			return tool.newton_raphson(0, f, df, 1e-8);
		}
	}
	get_state() {
		// Initialization
		var v = this.v;
		var w = this.w;
		var W = this.W;
		if (this.special_case !== null) {
			switch (this.special_case) {
				case "circular equatorial":
					w, W = 0;
					v = this.l_true;
					break;
				case "circular inclined":
					w = 0;
					v = this.u;
					break;
				case "elliptical equatorial":
					W = 0;
					w = this.w_true;
					break;
				default:
					console.log(`Special case isn't properly defined: ${this.special_case}`);
			}
		}
		let cos_v = Math.cos(v);
		let sin_v = Math.sin(v);
		let mu_p = this.parent.G / this.p;
		
		// Perifocal frame
		let pos = new vect3(this.p * cos_v / (1 + this.e * cos_v),
						  this.p * sin_v / (1 + this.e * cos_v),
						  0);
		let vel = new vect3(- Math.sqrt(mu_p) * sin_v,
						  Math.sqrt(mu_p) * (this.e + cos_v),
						  0);
		
		// DCM Matrix
		let cos_i = Math.cos(this.i);
		let sin_i = Math.sin(this.i);
		let cos_W = Math.cos(W);
		let sin_W = Math.sin(W);
		let cos_w = Math.cos(w);
		let sin_w = Math.sin(w);
		let DCM = new vect3(new vect3(cos_W * cos_w - sin_W * sin_w * cos_i,
									  - cos_W * sin_w - sin_W * cos_w * cos_i,
									  sin_W * sin_i),
						    new vect3(sin_W * cos_w + cos_W * sin_w * cos_i,
									  - sin_W * sin_w + cos_W * cos_w * cos_i,
									  - cos_W * sin_i),
						    new vect3(sin_w * sin_i,
									  cos_w * sin_i,
									  cos_i));
		let r_centered = vect3.product(DCM, pos);
		let v_centered = vect3.product(DCM, vel);
		return {r: r_centered, v: v_centered};
	}
}

class N_body {
	// Constructor
	constructor(self, dT) {
		this.body = self;
		this.dT = dT;
		this.previousPosition = vect3.sum(1, self.position, -dT, self.velocity);
	}
	
	// Methods
	verlet(list_body, dT) {
		// Algorithm with non-constant steptime
		var acceleration = this.get_acceleration(list_body);
		var pos = this.body.position;
		var previous_pos = this.previousPosition;
		var dX = vect3.sum(1, pos, -1, previous_pos);
		dX = vect3.scale(dT/this.dT, dX);
		dX = vect3.sum(1,pos,1,dX);
		var dG = vect3.scale((dT+this.dT)/2*this.dT, acceleration);
		var position = vect3.sum(1,dX,1,dG);
		
		// Update elements
		this.previousPosition = this.body.position;
		this.dT = dT;
		this.body.velocity = vect3.scale(1/dT, vect3.sum(1,position,-1,this.previousPosition));
		return position
	}
	get_acceleration(list_body) {
		var force = new vect3(0,0,0);
		for (var i = 0 ; i < list_body.length ; i++) {
			if (list_body[i] === this.body) {
				continue
			}
//			console.log(`${this.body.name} - by ${list_body[i].name}`);
			var f = Body.get_specific_force(this.body, list_body[i]);
//			console.log(f.module);
			force = vect3.sum(1,force,1,f);
		}
		return force;
	}
}

class Sketch {
	// Constructor
	constructor(self) {
		// Properties
		this.body 			= self;
		this.color 			= self.color;	// element color
		this.font 			= '10px Arial';	// font for label
		this.color_font		= '#BBB';		// color for font
		
		this.visible 		= true;			// body visible or not
		this.legend 		= true;			// label visible or not
		this.infobox 		= false;		// orbit informations displayed or not
		this.show_SOI		= true;		// show SOI
		this.show_orbit 	= false;		// show orbit
		this.store_orbit 	= false;		// if true, store orbit data to display it on zoom / focus change
		this.min_radius		= 5;			// minimum pixel to display on screen
		
		// Sketch positions & dimensions
		this.radius = this.min_radius;
		this.SOI_radius = 0;
		this.screen_position = {
			x: 0,
			y: 0
		}
		this.store = [];
	}
	
	// Methods
	draw(context_body, context_path) {
		/*
			Draw body on canvas, labels & orbit path
		*/
		
		// Not showing
		if (!this.visible) {
			return	
		}
		
		// Body
		if (this.show_SOI) {
			context_body.beginPath();
			context_body.arc(this.screen_position.x, this.screen_position.y, this.SOI_radius, 0, 2*Math.PI);
			context_body.fillStyle = 'rgba(205,92,92,0.5)';
			context_body.fill();
			context_body.closePath();
		}
		context_body.beginPath();
		context_body.arc(this.screen_position.x, this.screen_position.y, this.radius, 0, 2*Math.PI);
		context_body.fillStyle = this.color;
		context_body.fill();
		context_body.closePath();
		
		// Label
		if (this.legend) {
			context_body.font = this.font;
			context_body.fillStyle = this.color_font;
			context_body.fillText(this.body.name, 
								  this.screen_position.x - 3 * this.body.name.length,
								  this.screen_position.y - this.radius*1.05 - 5); // Minimum 5 px + 5% offset
		}
		
		// Trajectory
		if (this.show_orbit) {
			context_path.beginPath();
			context_path.rect(this.screen_position.x, this.screen_position.y, 1, 1);
			context_path.fillStyle = this.color;
			context_path.fill();
			context_path.closePath();
		}
		
	}
	set_position(center, scale, scale_unit, focus, plane) {
		/*
			Update screen position
			We will consider that everything is in km for now
			center: {x: WIDTH/2, y:HEIGHT/2}
			scale: km/px or UA/px
			scale_unit: 'km' or 'UA'
			focus: Body class
			plane: [vect3, vect3]
		*/
		var position = this.body.abs_position;
		
		// Set focus
		position = vect3.sum(1,position, -1, focus.abs_position);
		
		// Store position
		if (this.store_orbit) {
//			if (this.store.length > 120) {
//				this.store.shift();
//			}
			this.store.push(position);
		}
		
		// Scale in px
		if (scale_unit === 'UA') {
			scale = tool.UA_to_km(scale);
		}
		position = vect3.scale(1/scale, position);
		
		// Plane projection and translation to the center
		var screen_position = {x: vect3.dot(position, plane[0]) + center[0],
							   y: - vect3.dot(position, plane[1]) + center[1]};
		this.screen_position = {
			x: screen_position.x,
			y: screen_position.y
		};
	}
	set_radius(scale, scale_unit) {
		/*
			Scale radius body and convert it in pixel.
			> 'scale' represents the total distance in 1 pixel
		*/
		// Convert 
		if (scale_unit === 'UA') {
			scale = tool.UA_to_km(scale);
		}
		// Get radius in px
		var radius = Math.round(this.body.radius / scale);
		if (this.body.orbit !== null) {
			var SOI_radius = Math.round(this.body.SOI / scale);
		}
		if (radius < this.min_radius) {
			radius = this.min_radius;
		}
		this.radius = radius;
		this.SOI_radius = SOI_radius;
	}
	toggle_orbit() {
		this.show_orbit = !this.show_orbit;
		this.store_orbit = !this.store_orbit;
		if (!this.store_orbit) {
			this.reset_store();
		}
	}
	reset_store() {
		this.store = [];
	}
	draw_stored_position(context, center, scale, scale_unit, focus, plane) {
		for (var i = 0 ; i < this.store.length ; i++) {
			var position = this.store[i];
			var reference_body = this.body.reference;
			
			// Set focus
			position = vect3.sum(1, position, -1, focus.sketch.store[i]);
			
			// Scale in px
			if (scale_unit === 'UA') {
				scale = tool.UA_to_km(scale);
			}
			position = vect3.scale(1/scale, position);
			
			// Plane projection and translation to the center
			var screen_position = {x: vect3.dot(position, plane[0]) + center[0],
								   y: - vect3.dot(position, plane[1]) + center[1]};
			context.beginPath();
			context.rect(screen_position.x, screen_position.y, 1, 1);
			context.fillStyle = this.color;
			context.fill();
			context.closePath();
		}
	}
	
	// Events
	/*
		Put events such as onclick to toggle legend
	*/
	
}