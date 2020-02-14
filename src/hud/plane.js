// PLANE
var PLANE = {
	x: I, 
	y: J,
	z: K,
	lock: false,
    dimensions: {
        paddingBottom: 0.15,
        marginHeight: 0.05,
    },
    showBox: false,
    draw: function(ctx, x0, y0, w0, h0) {
        /* DRAW ORIENTATION VECTORS */
        // DIMENSIONS
        let height = h0 * (1 - this.dimensions.paddingBottom) / 2;
        let planeX = x0 + w0 / 2;
        let planeY = y0 + height;
        let length = Math.min(w0 / 2, height);
        
        ctx.clearRect(planeX - length, planeY - length, 2*length, 2*length);
        
        // SHOW PLANE BOX
        if (this.showBox) {
            ctx.beginPath();
            ctx.rect(planeX - length, planeY - length, 2*length, 2*length);
            ctx.fillStyle = "rgba(0,0,255,0.4)";
            ctx.fill();
            ctx.closePath();
        }
        
        // DRAW VECTORS
        I.draw(ctx, this, {type: 'vec', text: 'I', length: length*0.75, center: {x: planeX, y: planeY}});
        J.draw(ctx, this, {type: 'vec', text: 'J', length: length*0.75, center: {x: planeX, y: planeY}});
        K.draw(ctx, this, {type: 'vec', text: 'K', length: length*0.75, center: {x: planeX, y: planeY}});
    }
};