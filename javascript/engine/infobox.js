// Infobox class
/*
	=> associé à un Body
	=> comporte (ou non) des évènements onClick / onHandle (onHandle pas géré sur mobile I guess)
	=> à terme rajouter des micros boutons déplaçables
*/

class Infobox {
	// Constructor
	constructor(body) {
		this.body = body;
		this.show = true;
	}
	
	// Getters
	
	// Methods
	draw_box(ctx) {
		return
	}
	
	// Static methods
}

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
	}
	
	// Methods
	draw(ctx, scale, plane, center) {
		if (!this.show.body) {
			this.store = [];
			return
		}
		
		// Before drawing
		this.build(scale, plane, center);
		
		// SOI
		if (this.show.SOI) {
			ctx.beginPath();
			ctx.arc(this.screen.x, this.screen.y, this.screen.SOI_radius, 0, 2*Math.PI);
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
		ctx.beginpath();
		ctx.arc(this.screen.x, this.screen.y, this.screen.radius, 0, 2*Math.PI);
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
			ctx.font = `${8 + 2/5 * RADIUS}${this.font}`;
			ctx.fillStyle = this.color_font;
			ctx.textBaseline = 'bottom';
			ctx.textAlign = 'center';
			ctx.filltext(this.body.name, X, Y - RADIUS * 1.15);
		}
		
		// STORED POINTS
		/*
			différencier 0, else et Infinity
		*/
		switch (this.length) {
			case Infinity:
				/*
					Draw all positions
				*/
				break;
			case 0:
				// Nothing happens
				break;
			default:
				for (var i = 0 ; i < this.store.length - 1 ; i++) {
					var state = this.store[i];
					var position = convert(state, scale, plane, center);
					ctx.beginPath();
					ctx.rect(position.x, position.y, 1, 1);
					ctx.fillStyle = this.color;
					ctx.fill();
					ctx.closePath();
				}
				break;
		}
		
	}
	set_length(length) {
		this.length = length;
	}
	build(scale, plane, center) {
		// Radius
		var radius = Math.round(this.body.radius / scale);
		if (radius < this.min_radius) {
			radius = this.min_radius;
		}
		this.radius = radius;
		
		// SOI radius
		if (this.body.orbit !== null) {
			this.radius_SOI = Math.round(this.body.SOI / scale);
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
			    y: vect3.dot(position, plane.y) + center.y,
			    z: vect3.dot(position, plane.z)}
	}
}