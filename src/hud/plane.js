// PLANE
var PLANE = {
	x: I, 
	y: J,
	z: K,
	lock: false,
    dimensions: {
		lengthRatio: 1
    },
    showBox: false,
	draw_hud: function(ctx, x0, y0) {
		/* DRAW HUD ELEMENTS */
		let length	= this.dimensions.lengthRatio * clamp(SCALE.dimensions.scaleLengthRatio * WIDTH, SCALE.dimensions.scaleMinLength, SCALE.dimensions.scaleMaxLength) / 2;
		let centerX = x0 - length;
		let centerY = y0 - length;
		
		// Clear
		ctx.clearRect(centerX - length, centerY - length, 2 * length, 2 * length);
		
		// Box
//		ctx.fillStyle = 'rgba(136,204,136,0.5)';
//		ctx.fillRect(centerX - length, centerY - length, 2 * length, 2 * length);
		
		// Plane
		I.draw(ctx, this, {type: 'vec', text:'I', length: length, center: {x: centerX, y: centerY}, base:[K,J]});
		J.draw(ctx, this, {type: 'vec', text:'J', length: length, center: {x: centerX, y: centerY}, base:[I,K]});
		K.draw(ctx, this, {type: 'vec', text:'K', length: length, center: {x: centerX, y: centerY}, base:[I,J]});
	}
};