const HUD = {
	/*
        *-----------------------*
        |SCEN | SETS | HELP     |
        |                       |
        |                       |
        |                       |
        |                       |
        |                       |
        |                       |
        |                       |
		|                       |
		|                   ^   |
		|                   |   |
		|*--4--*          3 |-->| 
		|                       |
		|*---1---*     *---2---*| bottomLine (15px)
		|                       |
        *-----------------------*
		1: TIME (YYYY-MM-DD hh:mm:ss)
		2: SCALE
		3: PLANE
		4: TREE VIEW
	*/
	zoom: true,
	move: true,
	focus: true,
    dimensions: {
		bottomLine: 15,
		widthMargin: 10
    },
    drawScale: function(ctx) {
		let x0 = WIDTH - this.dimensions.widthMargin;
		let y0 = HEIGHT - this.dimensions.bottomLine;
		SCALE.draw_hud(ctx, x0, y0);
    },
    drawPlane: function(ctx) {
		let x0 = WIDTH - this.dimensions.widthMargin;
		let y0 = HEIGHT - this.dimensions.bottomLine - SCALE.dimensions.textHeight;
		PLANE.draw_hud(ctx, x0, y0);
    },
    drawTime: function(ctx) {
		let x0 = this.dimensions.widthMargin;
		let y0 = HEIGHT - this.dimensions.bottomLine;
		TIME.draw_hud(ctx, x0, y0)
    },
	lock: function() {
		this.zoom = false;
		this.move = false;
		this.focus = false;
	},
	unlock: function() {
		this.zoom = true;
		this.move = true;
		this.focus = true;
	},
	zoom: function(ctx,delta) {
		if (this.zoom) {
			SCALE.zoom(delta);
			if (PAUSE) {
				draw_body();
			}
			this.drawScale(ctx);
		}
	}
}