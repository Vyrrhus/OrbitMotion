// TIME
var TIME = {
	dT: 86400/60, //[s]
	devMode: true,
	LAST_TICK: 0,
	FPS: 0,
	delta: 0,
	date: new Date(2019,0,1),
    dimensions: {
        margin: 0.3,
        height: 0.025,
        bottom: 0.02
    },
    showBox: false,
	tick: function() {
		var time = new Date().getTime();
		if (this.LAST_TICK === 0) {
			this.FPS = 60;
		} else {
			var delta = (time - this.LAST_TICK) / 1000;
			this.delta += delta;
			if (delta > 0 && delta < 0.5) {
				this.FPS = 1 / delta;
			} else {
				this.FPS = 0;
			}
			if (this.delta > 0.25) {
				this.delta = 0;
				this.draw_FPS(CONTEXT.CONTROL);
			}
		}
		this.LAST_TICK = time;
	},
	draw_FPS: function(ctx) {
		var txt = `${Math.round(this.FPS)} | FPS`;
		ctx.font = "15px Arial";
		var width = ctx.measureText(txt).width;
		
		// Box
		ctx.clearRect(WIDTH-1.2*width, 0, 1.2*width,15);
		if (!this.devMode) {
			return
		}
		ctx.fillStyle = 'rgba(80,80,80,0.5)'
		ctx.fillRect(WIDTH - width, 0, width, 15);
		
		// Text
		ctx.fillStyle = 'rgb(35,115,77)';
		ctx.textAlign = "right";
		ctx.textBaseline = "top";
		ctx.fillText(txt, WIDTH, 0);
	},
	set_date: function() {
		this.date = new Date(this.date.getTime() + this.dT*1000);
	},
	draw_date: function(ctx, x0, y0, w0, h0) {
        /* DRAW TIMELINE */
        // TEXT
        let text  = this.date.str()
        
        // DRAW
        ctx.clearRect(x0,y0,w0+10,h0);
        
        if (this.showBox) {
            ctx.beginPath();
            ctx.rect(x0,y0,w0,h0);
            ctx.fillStyle = "rgba(0,255,255,0.4)";
            ctx.fill();
            ctx.closePath();
        }
        ctx.font            = '15px Arial';
        ctx.textBaseline    = 'middle';
        ctx.textAlign       = 'center'
        ctx.fillStyle        = "#BBB";
        ctx.fillText(text, x0 + w0 / 2 + 5, y0 + h0 / 2);
	},
	toggle_devMode: function() {
		this.devMode = !this.devMode;
	}
};