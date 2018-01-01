// Planet class
function _planet(NAME, MASS, RADIUS, COLOR, ORBIT) {
	// self
	var self = this;
	
	// Properties
	this.name 	= NAME;
	this.mass 	= MASS;
	this.radius = RADIUS;
	this.color 	= COLOR;
	this.orbit 	= ORBIT;
	this.gravitationalParameter = G * this.mass;
	if (this.orbit == null) {
		this.rank = 0;
	}
	else {
		this.rank = 1;
		let parent = this.orbit.parent;
		while (parent.orbit != null) {
			this.rank++;
			parent = parent.orbit.parent;
		}
		this.specificEnergy = - this.gravitationalParameter / (2 * this.orbit.a);
	}
	this.nb_child = 0;
	if (this.rank != 0) {
		this.orbit.parent.nb_child++;
	}
	
	// Drawing
	this.x = 0;
	this.y = 0;
	this.visible = true;
	this.setFocus = function() {
//		console.log('enter');
//		console.log(this.orbit);
		if (this.orbit == null) {
			FOCUS.position = [0,0];
		}
		else {
			X = km_to_px(this.orbit.position.x);
			Y = km_to_px(this.orbit.position.y);
			FOCUS.position = [X, Y];
		}
	}
	this.draw = function(time) {									
		var px_RADIUS = Math.floor(km_to_px(this.radius));
		if (px_RADIUS < 5) {
			px_RADIUS = 5;
		}
		if (this.orbit != null) {
			X = km_to_px(this.orbit.position.x)
			Y = km_to_px(this.orbit.position.y)
		}
		else {
			X = 0;
			Y = 0;
		}
		X += CENTER[0] - FOCUS.position[0];
		Y += CENTER[1] - FOCUS.position[1];
		Y = - Y + HEIGHT;
		this.x = X;
		this.y = Y;
		if (this.rank > 0) {
			if (Math.abs(this.x - this.orbit.parent.x) < 5 && Math.abs(this.y - this.orbit.parent.y) < 5) {
				this.visible = false;
			}
			else {
				this.visible = true;
			}
		}
		if (CONTROL.draw_ORBIT.state && this.visible) {
			context_ORBIT.beginPath();
			context_ORBIT.rect(X, Y, 1, 1);
			context_ORBIT.fillStyle = COLOR;
			context_ORBIT.fill();
			context_ORBIT.closePath();
			/* That draw only one point ; if we zoom, we'll have to redraw each and every of these points within the boundaries (WIDTH & HEIGHT)*/
		}
		if (this.visible) {
			context_ANIMATION.beginPath();
			context_ANIMATION.arc(X, Y, px_RADIUS, 0, Math.PI * 2);
			context_ANIMATION.fillStyle = COLOR;
			context_ANIMATION.fill();
			context_ANIMATION.closePath();
		}
	}
}

// Orbit class - we only consider ellipse here (for now)
function _orbit(PARENT, INCLINATION, NA_LONGITUDE, SEMI_MAJOR_AXIS, ECCENTRICITY, ARGUMENT, ANOMALY_0) {
	// self
	var self = this;
	
	// Properties
	this.parent 		= PARENT;				// object
	this.i 				= INCLINATION;			// °
	this.W 				= NA_LONGITUDE;			// °
	this.a 				= SEMI_MAJOR_AXIS; 		// UA
	this.e 				= ECCENTRICITY; 		// []
	this.w 				= ARGUMENT; 			// °
	this.v0 			= ANOMALY_0; 			// °
	
	let a_km 		 	= UA_to_km(this.a);
	this.period 		= 2 * Math.PI * Math.sqrt(cube(a_km) / this.parent.gravitationalParameter);
	this.ap 		 	= (1+this.e) * a_km;
	this.pe 		 	= (1-this.e) * a_km;
	this.altitude_ap 	= this.ap - this.parent.radius;
	this.altitude_pe 	= this.pe - this.parent.radius;
	this.h 			 	= Math.sqrt(this.parent.gravitationalParameter * a_km * (1-square(this.e)));
	this.meanMotion  	= 360 / this.period;
	this.semilatus_rec 	= a_km * (1-square(this.e));
	this.b 				= a_km * Math.sqrt(1 - square(this.e));
	this.c 				= this.e * a_km;
	this.flattening 	= (a_km - this.b) / a_km;
	this.mu 			= this.parent.gravitationalParameter;
	// Methods
	this.get_velocity = function(value) {
		return Math.sqrt(this.parent.gravitationalParameter * (2 / value - 1 / a_km));
	}
	this.velocity_ap 	= this.get_velocity(this.ap);
	this.velocity_pe 	= this.get_velocity(this.pe);
	
	// Motion
	this.angle 		= ANOMALY_0;
	this.position 	= {
		x: 0,
		y: 0,
		z: 0,
		fill: function(vect) {
			vect = matrix.transpose(vect);
			this.x = vect[0];
			this.y = vect[1];
			this.z = vect[2];
			if (self.parent.orbit != null) {
				this.x += self.parent.orbit.position.x;
				this.y += self.parent.orbit.position.y;
				this.z += self.parent.orbit.position.z;
				
			}
		}
	};
	this.velocity 	= {
		x: 0,
		y: 0,
		z: 0,
		fill: function(vect) {
			vect = matrix.transpose(vect);
			this.x = vect[0];
			this.y = vect[1];
			this.z = vect[2];
		}
	};
	
	this.motion 	= function(time) {
		/* 	This algorithm doesn't take account of the changes in the above elements through time
			Function needed for that.
		*/
		
		this.angle 	= set_true_anomaly(time);
		function set_true_anomaly(time) {
		/* Mean anomaly is computed from time ; then, eccentric anomaly is estimated with the Newton-Raphson method (function newton_raphson() in 'loader.js'). We can then find the true anomaly.
		This is acceptable as long as the eccentricity doesn't reach 0.95.
		REF : ASEN 5050, Spaceflight Dynamics, Jeffrey S. Parker, University of Colorado - Boulder*/
		// First we compute the mean anomaly of the current true anomaly
		let mean_anomaly = true_to_mean(self.angle);
		function true_to_mean(u) {
			u = deg_to_rad(u);
			let E = 2 * Math.atan(Math.tan(u/2) * Math.sqrt((1-self.e)/(1+self.e)));
			M = E - self.e * Math.sin(E);
			return rad_to_deg(M);
		}
		
		// Then we compute the delta mean anomaly as with the time in input :
		let delta_M = (self.meanMotion * (time)) % 360;
		// We then consider the resulting mean anomaly and deduce the true anomaly in output :
		mean_anomaly = (mean_anomaly + delta_M) % 360;
		mean_anomaly = deg_to_rad(mean_anomaly);
		let eccentric_anomaly = newton_raphson(0, F, dF);
		function F(x) {
			return x - self.e * Math.sin(x) - mean_anomaly;
		}
		function dF(x) {
			return 1 - self.e * Math.cos(x);
		}
		
		let true_anomaly = 2 * Math.atan(Math.sqrt((1+self.e) / (1 - self.e)) * Math.tan(eccentric_anomaly / 2));
		true_anomaly = rad_to_deg(true_anomaly);
		if (true_anomaly < 0) {true_anomaly += 360;}
		return true_anomaly;
	}
		
		// Perifocal frame :
		let true_anomaly 	= this.angle;
		true_anomaly 		= deg_to_rad(true_anomaly);
		let VEC_r 			= [ Math.cos(true_anomaly),
						 		Math.sin(true_anomaly),
						 		0];
		let VEC_v 			= [ -Math.sin(true_anomaly),
					 			this.e + Math.cos(true_anomaly),
					 			0];
		let SCAL_r 			= square(this.h) / (this.mu * (1 + this.e * Math.cos(true_anomaly)));
		let SCAL_v 			= this.mu / this.h;
		let r_perifocal 	= vector.scalar(SCAL_r, VEC_r);
		let v_perifocal 	= vector.scalar(SCAL_v, VEC_v);
		r_perifocal = matrix.transpose(r_perifocal);
		v_perifocal = matrix.transpose(v_perifocal);
		
		// Rotation matrix and body-centered state vectors :
		let NA = deg_to_rad(this.W);
		let AR = deg_to_rad(this.w);
		let IN = deg_to_rad(this.i);
		let DCM = 	[
						[-Math.sin(NA) * Math.cos(IN) * Math.sin(AR) + Math.cos(NA) * Math.cos(AR),
						Math.cos(NA) * Math.cos(IN) * Math.sin(AR) + Math.sin(NA) * Math.cos(AR),
						Math.sin(IN) * Math.sin(AR)
						],
						[-Math.sin(NA) * Math.cos(IN) * Math.cos(AR) - Math.cos(NA) * Math.sin(AR),
						 Math.cos(NA) * Math.cos(IN) * Math.cos(AR) - Math.sin(NA) * Math.sin(AR),
						 Math.sin(IN) * Math.cos(AR)
						],
						[Math.sin(NA) * Math.sin(IN),
						 - Math.cos(NA) * Math.sin(IN),
						 Math.cos(IN)
						]
					];
		let r_centered = matrix.product(DCM, r_perifocal);
		let v_centered = matrix.product(DCM, v_perifocal);
		this.position.fill(r_centered);
		this.velocity.fill(v_centered);
	}
	this.motion(0);
	// Write down the function to make the planet MOOVE along its orbit => X, Y, Z as with the ANGLE
	// TIME set in main.js
	// Then with the function call, angle is mooved AND coordinates aswell
	// The draw function for planets will then reach the coordinates stored in orbit
}
