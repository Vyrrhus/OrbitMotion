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
        compassWidth: 0.3,
        compassHeight: 0.3,
        compassX: 0.3,
        compassY: 0.3,
        timeWidth: 0.2,
        timeHeight: 0.05,
        timeX: 0,
        timeY: 0.95
    },
    drawScale: function(ctx) {
        let ratio = Math.min(WIDTH, HEIGHT);
        let x0 = WIDTH  - ratio * this.dimensions.compassX;
        let y0 = HEIGHT - ratio * this.dimensions.compassY;
        let w0 = ratio * this.dimensions.compassWidth;
        let h0 = ratio * this.dimensions.compassHeight;
        SCALE.draw(ctx, x0, y0, w0, h0);
    },
    drawPlane: function(ctx) {
        let ratio = Math.min(WIDTH, HEIGHT);
        let x0 = WIDTH  - ratio * this.dimensions.compassX;
        let y0 = HEIGHT - ratio * this.dimensions.compassY;
        let w0 = ratio * this.dimensions.compassWidth;
        let h0 = ratio * this.dimensions.compassHeight;
        PLANE.draw(ctx, x0, y0, w0, h0);
    },
    drawTime: function(ctx) {
		let x0 = WIDTH * this.dimensions.timeX;
		let y0 = HEIGHT * this.dimensions.timeY;
		let w0 = WIDTH * this.dimensions.timeWidth;
		let h0 = HEIGHT * this.dimensions.timeHeight;
        TIME.draw_date(ctx,x0,y0,w0,h0);
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
	}
}