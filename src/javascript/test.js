var G 	= 6.67408e-20; 							// m3/kg/s2

var tool = {
	UA_to_km: function(e) {
		return 149597870.7 * e;
	},
	km_to_UA: function(e) {
		return e / 149597870.7;
	},
	km_to_px: function(e) {
		
	}
}

// Planet
function Body(NAME, MASS, RADIUS, COLOR, ORBIT) {
	// self
	var self = this;
	
	// Main properties
	this.name 		= NAME;		// str
	this.mass 		= MASS;		// kg
	this.radius 	= RADIUS;	// km
	this.color 		= COLOR;	// (r,g,b)
	this.orbit 		= ORBIT;	// object
	this.nb_child 	= 0;		// int
	this.rank 		= 0;		// int
	
	// Secondary properties
	this.G = this.gravitationalParameter = G * this.mass;
	
	if (this.orbit) {
		this.specificEnergy = - this.G / (2 * this.orbit.a);
		this.orbit.parent.nb_child++;
		var body = this;
		while (body.orbit) {
			this.rank++;
			body = body.orbit.parent;
		}
	}
	
	// Methods
	this.draw = function(CONTEXT) {
		// Scale for radius
		px_RADIUS = 5;
		
		// Get and scale current position
		if (this.orbit) {
			position = this.orbit.get_position()
		} else {
			position = {x: 0, y:0, z:0};
		}
		
		/* 
			Translate position considering the focus
		*/
		
		// Draw body
		CONTEXT.beginPath();
		CONTEXT.arc(position.x, position.y, px_RADIUS, 0, Math.PI/2);
		CONTEXT.fillStyle = this.color;
		CONTEXT.fill();
		CONTEXT.closePath();
	}
}

// Orbit
function Orbit(PARENT, INCLINATION, NA_LONGITUDE, SEMI_MAJOR_AXIS, ECCENTRICITY, PERIAPSIS_ARGUMENT, ANOMALY_AT_EPOCH) {
	// self
	var self = this;
	
	// Main properties
	this.parent							= PARENT;				// object
	this.i = this.inclination 			= INCLINATION;			// °
	this.W = this.na_longitude 			= NA_LONGITUDE;			// °
	this.a_UA = this.semi_major_axis_UA = SEMI_MAJOR_AXIS;		// UA
	this.e = this.eccentricity 			= ECCENTRICITY;			// []
	this.w = this.periapsis_argument 	= PERIAPSIS_ARGUMENT;	// °
	this.v0 = this.anomaly_at_epoch 	= ANOMALY_AT_EPOCH;		// °
	
	// Secondary properties
	this.a = this.semi_major_axis = tool.UA_to_km(this.a)
	this.ap = this.apoapsis = (1+this.e) * this.a;
	this.pe = this.periapsis = (1-this.e) * this.a;
	this.z_ap = this.alt_apoapsis = this.ap - this.parent.radius;
	this.z_pe = this.alt_periapsis = this.pe - this.parent.radius;
	this.semilatus_rec = this.a * (1 - this.e * this.e);
	this.b = this.semi_minor_axis = this.a * Math.sqrt(1 - this.e * this.e)
	this.c = this.e * this.a;
	
	this.period = 2 * Math.PI * Math.sqrt(this.a * this.a * this.a / this.parent.G);
	this.meanMotion = 360 / this.period;
	this.h = Math.sqrt(this.parent.G * this.a * (1 - this.e * this.e));
	
	this.f = this.flattening = (this.a - this.b) / this.a;
	
	// Keplerian position
	this.v = this.anomaly = this.v0;
	
	// Methods
	this.motion = function(time) {
		/*
			Given dT (time) and the current anomaly, update the anomaly
		*/
	};
	this.get_position = function() {
		/*
			Given current anomaly, returns position & velocity vectors in the general frame
		*/
	}
}