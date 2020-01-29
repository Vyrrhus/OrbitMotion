// SCALE
var SCALE = {
	value: 2e6,
	unit: 'km',
	lock: false,
	draw: function(ctx) {
		/*
			Draw simulation scale
			To redraw only on change /!\
		*/
		// Scale
		var length = WIDTH * 1/10;
		var padding = length / 10;
		var height = length / 20;
		var value = (this.value * length);
		ctx.clearRect(WIDTH-length*1.2, 
					  HEIGHT-length/2,
					  length*1.2,
					  length/2);
		ctx.beginPath();
		ctx.rect(WIDTH-padding-length, HEIGHT-padding-height,1,height);
		ctx.rect(WIDTH-padding, HEIGHT-padding-height,1,height);
		ctx.rect(WIDTH-padding-length, HEIGHT-padding-height/2, length, 1);
		ctx.fillStyle = '#BBB';
		ctx.fill();
		ctx.closePath();
		
		// Text
		ctx.font = '13px Arial';
		var text = value.toExponential(3) + ' ' + this.unit;
		ctx.textBaseline = "bottom";
		ctx.textAlign = "center";
		ctx.fillText(text, WIDTH-padding-length/2,HEIGHT-padding-height);
	}
};