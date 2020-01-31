class Sketch {
	// Constructor
	constructor(body) {
		// Properties
		this.body 		= body;
		this.color		= body.color;
		this.focus 		= null;
		this.font		= 'px Arial';
		this.color_font	= '#BBB';
		this.size		= {
			radius:		5,
			min_radius:	5,
			max_orbit:	10,
			SOI:		0
		};
		
		// HUD
		this.mode		= 'comet';
		this.modes 		= ['comet', 'default'];
		this.show		= {
			body:		true,
			label:		true,
			SOI:		true,
            anomaly:    false
		};
		this.toggle		= {
			self: this,
			body: function() {
				this.self.show.body = !this.self.show.body;
			},
			label: function() {
				this.self.show.label = !this.self.show.label;
			},
			SOI: function() {
				this.self.show.SOI = !this.self.show.SOI;
			}
		};
		
		// Points
		this.current			= new State(body, this.focus, body.state);
		this.previous			= [];
		this.nb_points_saved 	= 500;
		
		// Running
		this.run = true;
	}
	
	// Drawing methods
	compute_state(scale, plane, center) {
		// Check if visible
		this.run = true;
		if (!this.show.body) {
			this.run = false;
		} else if (this.body.orbit !== null && this.body.orbit.shape == 'ellipse') {
			var major_axis_px = Math.round(this.body.orbit.a * 2 / scale);
			if (major_axis_px <= this.size.max_orbit) {
				this.run = false;
			} 
		}
		
		// Compute position
		var current = this.body.state;
		switch (this.mode) {
			case 'comet':
				this.previous.push(current.absolute);
				while (this.previous.length > this.nb_points_saved) {
					this.previous.shift();
				}
				break;
		}
		this.current = current.on_screen(this.focus.state, scale, plane, center);
	}
	draw_SOI(ctx, scale) {
		if (!this.run) {return}
		if (this.show.SOI && this.body.orbit !== null) {
			this.size.SOI = Math.round(this.body.SOI / scale);
			ctx.beginPath();
			ctx.arc(this.current.position.x, this.current.position.y, this.size.SOI, 0, 2*Math.PI);
			ctx.fillStyle = 'rgba(205,92,92,0.5)';
			ctx.fill();
			ctx.closePath();
		}
	}
	draw_body(ctx, scale, options) {
		if (!this.run) {return}
		this.size.radius = Math.round(this.body.radius / scale);
		if (this.size.radius < this.size.min_radius) {
			this.size.radius = this.size.min_radius;
		}
		ctx.beginPath();
		ctx.arc(this.current.position.x, this.current.position.y, this.size.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
		
		if (this.show.label) {
			ctx.font = `${8+this.size.radius*2/5}${this.font}`;
			ctx.fillStyle = this.color_font;
			ctx.textBaseline = 'bottom';
			ctx.textAlign = 'center';
			ctx.fillText(this.body.name, this.current.position.x, this.current.position.y - this.size.radius * 1.15);
            
            if (this.show.anomaly) {
                ctx.fillText(this.body.orbit.kepler.v.toFixed(3), this.current.position.x, this.current.position.y - 3 * this.size.radius * 1.15)
            }
		}
	}
	draw_trajectory(ctx, scale, plane, center, options) {
		if (this.body === this.focus) {
			this.run = false;
		}
		if (!this.run) {return}
		switch (this.mode) {
			case 'comet':
                var focus_previous = this.focus.sketch.previous;
                var state_0 = this.previous[this.previous.length-1].on_screen(focus_previous[this.previous.length - 1], scale, plane, center);
				for (var i = 2 ; i < this.previous.length ; i++) {
					var index = this.previous.length - i;
					var state = this.previous[index].on_screen(focus_previous[index], scale, plane, center);
					
					// Draw
                    if (Math.hypot((state_0.position.x - state.position.x), (state_0.position.y - state.position.y)) > 10) {
                        state_0 = state;
					   ctx.beginPath();
					   ctx.rect(state.position.x, state.position.y, 1, 1);
					   ctx.fillStyle = tool.setOpacity(this.color, 1-i/this.nb_points_saved);
					   ctx.fill();
					   ctx.closePath();
                    }
				}
				break;
			case 'default':
				if (options.ctx === undefined) {return}
				options.ctx.beginPath();
				options.ctx.rect(this.current.position.x, this.current.position.y,1,1);
				options.ctx.fillStyle = this.color;
				options.ctx.fill();
				options.ctx.closePath();
				break;
		}
	}
	
	// Sketch methods
	switch_mode(options) {
		if (options === undefined) {
			var index = this.modes.indexOf(this.mode);
			if (index+1 >= this.modes.length) {
				this.mode = this.modes[0];
			} else {
				this.mode = this.modes[index+1];
			}
		} else {
			this.mode = options.mode;
		}
		
		if (this.mode === 'default') {
			HUD.lock();
		} else {
			HUD.unlock();
		}
		this.previous = [];
	}
	
	// Events
	onclick(x,y) {
		if (!this.show.body || (!this.run && this.body !== this.focus)) {
			return
		}
		if (x < this.current.position.x - this.size.radius || x > this.current.position.x + this.size.radius) {
			return
		}
		if (y < this.current.position.y - this.size.radius || y > this.current.position.y + this.size.radius) {
			return
		}
		console.log(`CLICKED ON ${this.body.name}`)
	}
}