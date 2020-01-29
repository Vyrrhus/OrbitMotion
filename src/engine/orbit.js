// Orbit class
class Orbit {
	// CONSTRUCTOR
	constructor(central_body, inclination, node, eccentricity, semi_major_axis, argument, true_anomaly,
				{h: angular_momentum, E: specific_energy, w_true: true_periapsis, u: latitude, l_true: true_longitude}) {
		// Reference body
		this.parent = central_body;

		// Kepler elements
		this.i		= this.inclination 			= inclination; 		// [rad];
		this.W		= this.AN_longitude 		= node;  			// [rad]
		this.e		= this.eccentricity 		= eccentricity;		// []
		this.a		= this.semi_major_axis 		= semi_major_axis; 	// km
		this.w		= this.periapsis_argument	= argument; 		// [rad]
		this.v		= this.true_anomaly 		= true_anomaly; 	// [rad]
		
		this.h		= this.angular_momentum 	= angular_momentum;	// [km²/s]
		this.E		= this.specific_energy 		= specific_energy;	// [km²/s²]
		this.w_true	= this.true_periapsis 		= true_periapsis;	// [rad]
		this.u 		= this.latitude 			= latitude;			// [rad]
		this.l_true	= this.true_longitude 		= true_longitude;	// [rad]
		
		// Derived elements
		this.p 		= this.semi_parameter		= this.h * this.h / this.parent.G; // [km]
		
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
	
	// GETTERS
	get kepler() {
		var kepler_elements = {Central_body: this.parent,
							   i: tool.rad_to_deg(this.i), W: tool.rad_to_deg(this.W), e: this.e, a: this.a, w: tool.rad_to_deg(this.w), v: tool.rad_to_deg(this.v)};
		return kepler_elements;
	}
    get ap() {
        return this.a * (1 + this.e)
    }
    get pe() {
        return this.a * (1 - this.e)
    }
    get anomaly() {
        return this.v_to_anomaly(this.v)
    }
    get distance() {
        // Return actual distance
        return this.v_to_distance(this.v)
    }
    get vect_normal() {
        return new vect3(Math.sin(this.W)*Math.sin(this.i),
                         Math.cos(this.W)*Math.sin(this.i),
                         Math.cos(this.i))
    }
    
    // METHODS
    // 1 - True anomaly change as with the time
    motion(dT) {
        // General case or elliptical equatorial
        if (this.special_case !== 'circular equatorial' && this.special_case !== 'circular inclined') {
            var guess = this.v_to_anomaly(this.v);
            if (this.shape === 'ellipse') {
                var mean_anomaly = guess - this.e * Math.sin(guess) + this.n * dT;
            } else if (this.shape === 'parabola') {
                var mean_anomaly = this.n * dT;
            } else {
                var mean_anomaly = this.e * Math.sinh(guess) - guess + this.n * dT
            }
            var anomaly = this.mean_to_anomaly(mean_anomaly);
            this.v = this.true_anomaly = this.anomaly_to_v(anomaly);
        } 
        
        // Circular equatorial
        else if (this.special_case === 'circular equatorial') {
            var guess = this.true_longitude;
            var anomaly = this.mean_to_anomaly(guess - this.e * Math.sin(guess) + this.n * dT);
            this.l_true = this.true_longitude = anomaly % (2 * Math.PI);
        } 
        // Circular inclined
        else {
            var guess = this.latitude;
            var anomaly = this.mean_to_anomaly(guess - this.e * Math.sin(guess) + this.n * dT);
            this.u = this.latitude = anomaly % (2 * Math.PI);
        }
    }
    
    // 2 - Anomalies
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
    time_dv(ri, rf, dv) {
        // f & g functions
        var f = 1 - rf/this.p * (1 - Math.cos(dv))
        var g = ri * rf * Math.sin(dv) / Math.sqrt(Math.abs(this.parent.G * this.p))
        
        if (this.shape === 'ellipse') {
            var df = Math.sqrt(this.parent.G / this.p) * Math.tan(dv/2) * ((1 - Math.cos(dv))/this.p - 1/ri - 1/rf)
            var cos_dE = 1 - ri/this.a * (1-f)
            var sin_dE = - ri * rf * df / Math.sqrt(this.parent.G * this.a)
            var dE = tool.quadrant(cos_dE, sin_dE)
            var TOF = g + Math.sqrt(Math.cube(this.a)/this.parent.G) * (dE - sin_dE)
        } else if (this.shape === 'parabola') {
            var chord = Math.sqrt(Math.cube(ri) + Math.cube(rf) - 2 * ri * rf * Math.cos(dv))
            var semiperimeter = (ri + rf + chord) / 2
            var TOF = 2/3 * Math.sqrt(Math.cube(semiperimeter)/2/this.parent.G) * (1 - Math.pow((semiperimeter - chord)/semiperimeter,3/2))
        } else {
            var f = 1 + rf/this.p * (1 - Math.cos(dv))
            var cosh_dH = 1 - (f - 1) * ri / this.a
            var dH = Math.acosh(cosh_dH)
            var sinh_dH = Math.sinh(dH)
            var TOF = g + Math.sqrt(Math.cube(- this.a) / this.parent.G) * (sinh_dH - dH)
        }
        return TOF
    }
    
    // 3 - State vectors from orbital parameters
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
    
    // 4 - Distance & true anomaly
    v_to_distance(true_ano) {
        return this.a * (1 - Math.square(this.e)) / (1 + this.e * Math.cos(true_ano))
    }
    distance_to_v(distance) {
        return Math.acos((this.a / distance * (1 - Math.square(this.e)) - 1) / this.e)
    }
}