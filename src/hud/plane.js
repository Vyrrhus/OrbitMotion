// PLANE
var PLANE = {
	x: I, 
	y: J,
	z: K,
	lock: false,
	draw: function(ctx) {
		ctx.clearRect(0,HEIGHT-230,230,230);
		I.draw(ctx, this, {type: 'vec', text: 'I', center: {x: 100, y: HEIGHT-100}});
		J.draw(ctx, this, {type: 'vec', text: 'J', center: {x: 100, y: HEIGHT-100}});
		K.draw(ctx, this, {type: 'vec', text: 'K', center: {x: 100, y: HEIGHT-100}});
//		X.draw(ctx, this, {type: 'vec', text: 'X', center: {x: 100, y: HEIGHT-100}});
//		Y.draw(ctx, this, {type: 'vec', text: 'Y', center: {x: 100, y: HEIGHT-100}});
//		U.draw(ctx, this, {type: 'vec', text: 'U', center: {x: 100, y: HEIGHT-100}});
//		V.draw(ctx, this, {type: 'vec', text: 'V', center: {x: 100, y: HEIGHT-100}});
	}
};