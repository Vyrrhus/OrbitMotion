// Body class
class Body {
	// Constructor
	constructor(name, color, mass, radius) {
		this.name 	= name;
		this.color 	= color;
		this.mass 	= mass;
		this.radius = radius;
		this.G =
		this.gravitationalParameter = G * mass; // ==> à convertir pour être homogène en UA ou convertir toutes orbites en km
		
		// Bodies within SOI
		this.child = [];
		
		// State
		this.state = new State(this, null, {x:0,y:0,z:0,vx:0,vy:0,vz:0});
		
		// Keplerian orbit
		this.orbit = null;
		
		// N-body orbit
		this.n_body = null;
		
		// Sketch
		this.sketch = new Sketch(this);
        
        // Events
        this.event = new Event(this);
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
    init() {
        this.child = [];
        this.state = new State(this, null, {x:0,y:0,z:0,vx:0,vy:0,vz:0});
        this.orbit = null;
        this.n_body = null;
        this.sketch = new Sketch(this);
        this.event = new Event(this);
    }
	init_state(options, reference) {
		/*
			Initialization of state & reference
		*/
		if (options.position === undefined) {
			this.state.position = new vect3(options.x, options.y, options.z);
		} else {
			this.state.position = options.position;
		}
		
		if (options.velocity === undefined) {
			this.state.velocity = new vect3(options.vx, options.vy, options.vz);
		} else {
			this.state.velocity = options.velocity;
		}
		
		if (reference !== undefined) {
			this.state.reference = reference;
			var abs_state = this.state.absolute;
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
        // True longitude of periapsis (non-circular equatorial)
		var w_true = Math.acos(e.x / e.module);
		if (e.y < 0) {
			w_true = 2 * Math.PI - w_true;
		}
        // Argument of latitude (circular inclined)
		var u = Math.acos(Math.round(vect3.dot(n, r) / (n.module * r.module) * 1e12)/1e12);
		if (r.z < 0) {
			u = 2 * Math.PI - u;
		}
        // True longitude
		var l = Math.acos(r.x / r.module);
		if (r.y < 0) {
			l = 2 * Math.PI - l;
		}
		
		this.orbit = new Orbit(central_body, i, W, e.module, a, w, TA, {h: h.module, E: E, w_true: w_true, u: u, l_true: l});
        var TOF = this.event.check()
//        console.log(this.name, "'s orbit around ", this.orbit.parent.name, ' : ', this.orbit.shape)
	}
	kepler_motion(dT) {
		if (this.orbit === null) {
			return
		}
		
		// Set orbit from state vectors
		this.get_orbit(this.orbit.parent);
//        if (this.name == 'TEST') {console.log(this.orbit.kepler)}
		
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
		this.state = new State(this, this.state.reference, this.orbit.get_state());
		
		// SOI Checks
		// 1st check: out of parent SOI (if not around primary object)
		if (this.orbit.parent.orbit !== null && Body.get_distance(this, this.orbit.parent) >= this.orbit.parent.SOI) {
			console.log(`${TIME.date.str()} - ${this.name} leaves parent's SOI: ${this.orbit.parent.name}`);
			var reference = this.orbit.parent.orbit.parent;
			var rel_state = State.relative(this.state, reference.state);
			
			this.state.reference = reference;
			this.state.position = rel_state.position;
			this.state.velocity = rel_state.velocity;
			
			this.orbit.parent.child.splice(this.orbit.parent.child.indexOf(this), 1);
			this.state.reference.child.push(this);
			
			this.get_orbit(this.state.reference);
			console.log(`${this.name} enters parent's SOI: ${this.state.reference.name}`);
            console.log('New orbit is: ', this.orbit.shape, ' - [ ', this.orbit.ap, ' | ', this.orbit.pe, ' | ', tool.rad_to_deg(this.orbit.i), ' ]')
		}
		// 2nd check: crossing other children SOI
		for (var i = 0 ; i < this.orbit.parent.child.length ; i++) {
			var child = this.orbit.parent.child[i];
			if (child === this) {
				continue
			}
			if (Body.get_distance(this, child) <= child.SOI) {
				console.log(`${TIME.date.str()} - ${this.name} enters ${this.orbit.parent.name}'s child SOI`);
				var rel_state = State.relative(this.state, child.state);
				
				this.state.reference = child;
				this.state.position = rel_state.position;
				this.state.velocity = rel_state.velocity;
				
				this.orbit.parent.child.splice(this.orbit.parent.child.indexOf(this), 1);
				this.state.reference.child.push(this);
				
				this.get_orbit(this.state.reference);
				console.log(`${this.name} enters child SOI: ${this.state.reference.name}`);
                console.log('New orbit is: ', this.orbit.shape, ' - [ ', this.orbit.a, ' | ', this.orbit.e, ' | ', tool.rad_to_deg(this.orbit.i), ' ]')
			}
		}
        
        // CRASH Check
        if (this.orbit.parent !== null && this.state.position.module <= this.orbit.parent.radius) {
            console.log(this.name, ' crashed on ', this.orbit.parent.name, ' at ', TIME.date.str())
            this.orbit = null;
        }
        
        // EVENTS FUTURE DEVELOPMENT
        // 1/ OUT OF PRIMARY SOI
        
        // 2/ CRASH ON PRIMARY
        // 3/ ENCOUNTER WITH PRIMARY'S CHILD
	}
    kepler_motion2(dT) {
		/*
			WARNING FOR EVENT DETERMINATION: RELATIVE BODIES POSITION HAVE TO BE UPDATED BEFORE SEARCHING FOR A CRASH OR AN ENCOUNTER, OTHERWISE CONDITIONS COULD BE MET WHEREAS THEY'RE NOT SUPPOSED TO BE.
			REWORK ON THAT PART WHEN CONSIDERING EVENTS !!!!
		*/
        if (this.orbit === null) {
            return
        }
        
        // Set orbit true anomaly
        this.orbit.motion(dT);
        
        // Get state vectors
        this.state = new State(this, this.state.reference, this.orbit.get_state());
        
        // EVENTS
        // 1 - OUT OF PRIMARY's SOI
        if (this.orbit.parent.SOI !== undefined && Body.get_distance(this, this.orbit.parent) >= this.orbit.parent.SOI) {
            console.log(TIME.date.str(), '- [<', this.name, '>] OUT OF [<', this.orbit.parent.name, '>] SOI');
            var reference = this.orbit.parent.orbit.parent;
            var rel_state = State.relative(this.state, reference.state);
            
            this.state.reference = reference;
            this.state.position  = rel_state.position;
            this.state.velocity  = rel_state.velocity;
            
            this.orbit.parent.child.splice(this.orbit.parent.child.indexOf(this), 1);
            reference.child.push(this);
            
            this.get_orbit(reference);
            console.log('ENTERS WITHIN [<', reference.name, '>] SOI')
        } 
        
        // 2 - CRASH ON PRIMARY
        if (this.orbit.parent !== null && this.state.position.module <= this.orbit.parent.radius) {
            console.log(TIME.date.str(), ' - [<', this.name, '>] CRASHES ON [<', this.orbit.parent.name, '>]');
            this.orbit = null;
            return
        }
        
        // 3 - ENCOUNTER WITH PRIMARY's CHILD
        for (var i = 0 ; i < this.orbit.parent.child.length ; i++) {
			var child = this.orbit.parent.child[i];
			if (child === this) {
				continue
			}
			if (Body.get_distance(this, child) <= child.SOI) {
				console.log(`${TIME.date.str()} - ${this.name} enters ${this.orbit.parent.name}'s child SOI`);
                console.log(child.name, ':', child.orbit.kepler.v, '-', this.name, ':',this.orbit.kepler.v)
				var rel_state = State.relative(this.state, child.state);
				
				this.state.reference = child;
				this.state.position = rel_state.position;
				this.state.velocity = rel_state.velocity;
				
				this.orbit.parent.child.splice(this.orbit.parent.child.indexOf(this), 1);
				this.state.reference.child.push(this);
				
				this.get_orbit(this.state.reference);
				console.log(`${this.name} enters child SOI: ${this.state.reference.name}`);
                console.log('New orbit is: ', this.orbit.shape, ' - [ ', this.orbit.a, ' | ', this.orbit.e, ' | ', tool.rad_to_deg(this.orbit.i), ' ]')
			}
		}
    }
	
	// Static methods
	static get_distance(A,B) {
		return vect3.distance(A.state.absolute.position, B.state.absolute.position)
	}
	static get_specific_force(attracted, attractor) {
		// Relative position
		var relative_position = State.relative(attractor.state, attracted.state);
		var scale = G * attractor.mass / relative_position.module_2;
		
		return vect3.scale(scale, relative_position.unit)
	}
}