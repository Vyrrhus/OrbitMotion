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
		
		// State
		this.state = new stateVector({position: {x: 0, y: 0, z: 0}, 
									  velocity: {x: 0, y: 0, z: 0}}, 
									 null);
		
		// Keplerian orbit
		this.orbit = null;
		
		// N-body orbit
		this.n_body = null;
		
		// Sketch
		this.sketch = new Sketch(this);
	}
	
	// Getter
	get SOI() {
		if (this.orbit === null) {
			return undefined
		} else {
			return this.orbit.a * Math.pow(this.mass/this.orbit.parent.mass, 2/5)
		}	
	}
	
	// Methods
	init_state(x, y, z, vx, vy, vz, reference) {
		/*
			Initialization of state & reference
		*/
		this.state.position = new vect3(x, y, z);
		this.state.velocity = new vect3(vx, vy, vz);
		
		if (reference !== undefined) {
			this.state.reference = reference;
			var abs_state = this.state.get_absolute();
			this.state.position = abs_state.position;
			this.state.velocity = abs_state.velocity;
			this.state.reference = null;
		}
	}
	
	get_orbit(central_body) {
		/*
			The hardest thing is to find which is the central body.
			It mustn't be massless, hence there must be a gravitational parameter.
			Initial state vectors have to be set up carefully considering those of the central body (and its own central body as long as one exists)
		*/
		var central_G = central_body.G;
		
		// Initial state vectors
		var r = this.state.position;
		var v = this.state.velocity;
		
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
		var w = Math.acos(Math.round(vect3.dot(n, e) / (n.module * e.module) * 1e12)/1e12);		// Argument of the periapsis
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
		var u = Math.acos(Math.round(vect3.dot(n, r) / (n.module * r.module) * 1e12)/1e12);		// Argument of latitude (circular inclined)
		if (r.z < 0) {
			u = 2 * Math.PI - u;
		}
		var l = Math.acos(r.x / r.module);								// True longitude
		if (r.y < 0) {
			l = 2 * Math.PI - l;
		}
		
		this.orbit = new Orbit(central_body, i, W, e.module, a, w, TA, {h: h.module, E: E, w_true: w_true, u: u, l_true: l});
	}
	kepler_motion(dT) {
		if (this.orbit === null) {
			return
		}
		
		// Set orbit from state vectors
		this.get_orbit(this.orbit.parent);
		
		// Get initial guess for anomaly
		if (this.orbit.special_case !== 'circular equatorial' && this.orbit.special_case !== 'circular inclined') {
			var guess = this.orbit.v_to_anomaly(this.orbit.v);
		} else if (this.orbit.special_case === 'circular equatorial') {
			var guess = this.orbit.l_true;
		} else {
			var guess = this.orbit.latitude;
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
		if (this.orbit.special_case !== 'circular equatorial' && this.orbit.special_case !== 'circular inclined') {
			this.orbit.v = this.orbit.anomaly_to_v(anomaly);
		} else if (this.orbit.special_case === 'circular equatorial') {
			this.orbit.l_true = this.orbit.true_longitude = anomaly;
		} else {
			this.orbit.u = this.orbit.latitude = anomaly;
		}
		
		// Get state vectors
		this.state = new stateVector(this.orbit.get_state(), this.state.reference);
		
		// SOI Checks
		// 1st check: out of parent SOI (if not around primary object)
		if (this.orbit.parent.orbit !== null && Body.get_distance(this, this.orbit.parent) >= this.orbit.parent.SOI) {
			console.log(`${this.name} leaves ${this.orbit.parent.name}'s orbit`);
			var reference = this.orbit.parent.orbit.parent;
			var rel_state = this.state.get_relative(reference);
			
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
				var rel_state = this.state.get_relative(child);
				
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
	copy(name) {
		return new Body(name, this.color, this.mass, this.radius)
	}
	
	// Static methods
	static get_distance(A,B) {
		return vect3.distance(A.state.get_absolute().position, B.state.get_absolute().position)
	}
	static get_specific_force(attracted, attractor) {
		// Relative position
		var relative_position = attractor.state.get_relative(attracted);
		var scale = G * attractor.mass / relative_position.module_2;
		
		return vect3.scale(scale, relative_position.unit)
	}
}

// Orbit class
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
		if (this.special_case !== null) {
			switch (this.special_case) {
				case "circular equatorial":
					this.w = this.periapsis_argument = this.W = this.AN_longitude = 0;
					this.v = this.true_anomaly = this.l_true;
					break;
				case "circular inclined":
					this.w = this.periapsis_argument = 0;
					this.v = this.true_anomaly = this.u;
					break;
				case "elliptical equatorial":
					this.W = this.AN_longitude = 0;
					this.w = this.periapsis_argument = this.w_true;
					break;
				default:
					console.log(`Special case isn't properly defined: ${this.special_case}`);
			}
		}
		let cos_v = Math.cos(this.v);
		let sin_v = Math.sin(this.v);
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
		let cos_W = Math.cos(this.W);
		let sin_W = Math.sin(this.W);
		let cos_w = Math.cos(this.w);
		let sin_w = Math.sin(this.w);
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
		return {position: r_centered, velocity: v_centered};
	}
}

// Useless class
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

// Sketch class
class Sketch {
	// Constructor
	constructor(body) {
		// Properties
		this.body 		= body;
		this.color		= body.color;
		this.font		= 'px Arial';
		this.color_font	= '#BBB';
		
		this.show = {
			body: 			true,
			label: 			true,
			infobox: 		false,
			SOI: 			true,
			vector: {
				position: 	false,
				velocity: 	false
			}
		};
		
		// Toggle
		this.toggle = {
			SOI: function() {
				this.show.SOI = !this.show.SOI;
			},
			body: function() {
				this.show.body = !this.show.body;
			}
		};
		
		this.focus = null;
		this.min_radius = 5;
		this.radius = this.min_radius;
		this.radius_SOI = 0;
		
		this.screen = {
			x: 0,
			y: 0,
			z: 0,
		};
		this.store = [];
		this.length = 0;
		this.max_length = 150;
	}
	
	// Methods
	draw(ctx, scale, plane, center, ctx_Infinity) {
		if (!this.show.body) {
			this.store = [];
			return
		}
		
		// SOI
		if (this.show.SOI) {
			ctx.beginPath();
			ctx.arc(this.screen.x, this.screen.y, this.radius_SOI, 0, 2*Math.PI);
			ctx.fillStyle = 'rgba(205,92,92,0.5)';
			ctx.fill();
			ctx.closePath();
		}
		// POSITION VECTOR
		if (this.show.vector.position) {
			/*
				show vector position
			*/
		}
		
		// BODY
		ctx.beginPath();
		ctx.arc(this.screen.x, this.screen.y, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
		
		// VELOCITY VECTOR
		if (this.show.vector.velocity) {
			/*
				show velocity vector
			*/
		}
		
		// LABEL
		if (this.show.label) {
			ctx.font = `${8 + 2/5 * this.radius}${this.font}`;
			ctx.fillStyle = this.color_font;
			ctx.textBaseline = 'bottom';
			ctx.textAlign = 'center';
			ctx.fillText(this.body.name, this.screen.x, this.screen.y - this.radius * 1.15);
		}
		
		// STORED POINTS
		/*
			différencier 0, else et Infinity
		*/
		if (this.body === this.focus) {
			return
		}
		switch (this.length) {
			case Infinity:
				ctx_Infinity.beginPath();
				ctx_Infinity.rect(this.screen.x, this.screen.y, 1, 1);
				ctx_Infinity.fillStyle = this.color;
				ctx_Infinity.fill();
				ctx_Infinity.closePath();
				break;
			case 0:
				// Nothing happens
				break;
			default:
				for (var i = 0 ; i < this.store.length - 1 ; i++) {
					var state = this.store[i];
					var position = this.convert(state, scale, plane, center);
					ctx.beginPath();
					ctx.rect(position.x, position.y, 1, 1);
					ctx.fillStyle = tool.setOpacity(this.color, i/this.store.length);
					ctx.fill();
					ctx.closePath();
				}
				break;
		}
		
	}
	set_length(length) {
		this.length = length;
	}
	toggle_length() {
		console.log(this.length);
		if (this.length === 0 ) {
			this.length = this.max_length;
		} else {
			this.length = 0;
		}
	}
	build(scale, plane, center) {
		// Radius
		var radius = Math.round(this.body.radius / scale);
		radius *= (1 + this.screen.z / 200);
		
		if (radius < this.min_radius) {
			radius = this.min_radius;
		}
		this.radius = radius;
		
		// SOI radius
		if (this.body.orbit !== null) {
			this.radius_SOI = Math.round(this.body.SOI / scale);
		}
		
		if (this.body !== this.focus) {
			var a = "osef";
		}
		
		// Store
		this.store.push(this.body.state);
		while (this.store.length > this.length + 1) {
			this.store.shift();
		}
		this.screen = this.convert(this.store[this.store.length - 1], scale, plane, center);
	}
	convert(state, scale, plane, center) {
		var position = state.get_relative(this.focus).position;
		position = vect3.scale(1/scale, position);
		return {x: vect3.dot(position, plane.x) + center.x,
			    y: - vect3.dot(position, plane.y) + center.y,
			    z: vect3.dot(position, plane.z)}
	}
}

// Scenario class
/*
	Elements qui changent pour chaque scénario :
	- valeur UA	=> preset
	- valeur G	=> preset
	- liste des BODIES initialisés (ie avec position de départ)
	- FOCUS.body
	- SCALE.value	=> preset
	- TIME.value	=> preset
	- TIME.date (à noter que ce serait cool de récup automatiquement les vecteurs d'état de chaque corps pour toutes les époques)
	- PLANE.x && PLANE.y	=> preset
	
	Concernant les pb d'époque on va pour le moment considérer que tout est cohérent ; à l'avenir faudra distinguer "simulation epoch" et les différentes epoch, et initialiser la position des corps à la simulation epoch.
	Concernant les valeurs preset pour l'instant on les fixe, à l'avenir on pourrait s'en passer en automatisant leur génération
	Concernant l'ajout de bodies faudra pouvoir utiliser des éléments orbitaux directement plutôt que vecteur d'état (tous les angles par défaut à 0° si non renseignés)
*/
class Scenario {
	// Constructor
	constructor(name, options) {
		this.name = name;
		this.list_bodies = [];
		
		// Options
		if (options === undefined) {
			options = {};
		}
		if (options.UA === undefined) {
			options.UA = 149597870.7;	// km
		}
		if (options.G === undefined) {
			options.G = 6.67408e-20; 	// km3/kg/s2
		}
		
		this.UA = options.UA;
		UA = this.UA;
		this.G 	= options.G;
		G = this.G;
		this.focus = options.focus;
		this.scale = options.scale;
		this.dT = options.dT;
		this.epoch = options.epoch;
		this.plane = options.plane; // On pourrait faire des trucs sympas avec plane (ecliptique, perifocal, etc.)
	}
	
	// Methods
	add_body(body, options) {
		if (options.body === undefined) {
			// Vector elements
			body.init_state(options.x, options.y, options.z, options.vx, options.vy, options.vz, options.reference);
		} else {
			// Kepler elements (KERBAL ONLY - WIP)
			body.orbit = new Orbit(options.body, 
								   tool.deg_to_rad(options.i), 
								   tool.deg_to_rad(options.W), 
								   options.e, 
								   options.a, 
								   tool.deg_to_rad(options.w), 
								   options.v, 
								   {h: Math.sqrt(options.a * options.body.G * (1-options.e*options.e)), 
									w_true:tool.deg_to_rad(options.W + options.w), 
									u:tool.deg_to_rad(options.w + options.v), l_true:tool.deg_to_rad(options.w + options.v + options.W)});
			body.orbit.v = body.orbit.true_anomaly = body.orbit.mean_to_anomaly(body.orbit.v);
			
			// Set state vectors
			var state = body.orbit.get_state();
			body.state = new stateVector(state, options.body);
		}
		
		this.list_bodies.push(body);
	}
	set_kepler() {
		var list_bodies = this.list_bodies;
		
		// Sort by mass
		list_bodies.sort(function(a,b) {
			return (b.mass - a.mass)
		});
		console.log(`${this.name} - central body : ${list_bodies[0].name}`);
		
		// Iterate
		for (var i = 1 ; i < list_bodies.length ; i++) {
			console.log(`${this.name} - add ${list_bodies[i].name}`);
			var reference = this.list_bodies[0];
			for (var j = i - 1; j > 0 ; j--) {
				var distance = Body.get_distance(list_bodies[i], list_bodies[j]);
				var SOI = list_bodies[j].SOI;
				if (distance < SOI) {
					// Reference found
					reference = list_bodies[j];
					j = 0;
				}
			}
			
			// Add child to reference
			reference.child.push(list_bodies[i]);
			
			// Set relative state vectors
			var relative_state = list_bodies[i].state.get_relative(reference);
			list_bodies[i].state = new stateVector(relative_state, reference);
			list_bodies[i].get_orbit(list_bodies[i].state.reference);
			console.log(`${list_bodies[i].orbit.shape} - ${list_bodies[i].orbit.special_case}`);
		}
	}
	init() {
		this.set_kepler();
		if (!this.list_bodies.includes(this.focus)) {
			this.focus = this.list_bodies[0];
		}
		
	}
}

// Infobox class
/*
	=> associé à un Body
	=> comporte (ou non) des évènements onClick / onHandle (onHandle pas géré sur mobile I guess)
	=> à terme rajouter des micros boutons déplaçables
*/