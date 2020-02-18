// SCALE
var SCALE = {
	value: 2e6,
	unit: 'km',
	lock: false,
    dimensions: {
        textLength: 0,
		textSize: 13,
		textFont: 'Arial',
		textHeight: 20,
		scaleLengthRatio: 0.25,
		scaleMinLength: 100,
		scaleMaxLength: 200,
		scaleHeightRatio: 0.05
    },
    draw_hud: function(ctx, x0, y0) {
        /*  DRAW HUD ELEMENT */
		let scaleWidth 	= clamp(this.dimensions.scaleLengthRatio * WIDTH,
								this.dimensions.scaleMinLength,
								this.dimensions.scaleMaxLength);
		let scaleHeight	= this.dimensions.scaleHeightRatio * scaleWidth;
		let value		= this.value * scaleWidth;
		let text		= value.toExponential(3) + ' ' + this.unit;
		
		// Clear
		ctx.clearRect(x0-scaleWidth,y0-this.dimensions.textHeight,scaleWidth,this.dimensions.textHeight);
		
		// Box
//		ctx.fillStyle = 'rgba(136,136,204,0.5)';
//		ctx.fillRect(x0-scaleWidth,y0-this.dimensions.textHeight,scaleWidth,this.dimensions.textHeight);
		
		// Scale & Text
		ctx.beginPath();
		ctx.rect(x0,y0,-scaleWidth,1);
		ctx.rect(x0,y0,-1,-scaleHeight);
		ctx.rect(x0-scaleWidth,y0,1,-scaleHeight);
		ctx.fillStyle = 'rgba(202,202,202,0.8)';
		ctx.fill();
		ctx.closePath();
		
		ctx.font 			= this.dimensions.textSize + 'px ' + this.dimensions.textFont;
		ctx.textBaseline 	= 'bottom';
		ctx.textAlign		= 'center';
		ctx.fillText(text, x0-scaleWidth/2,y0);
    }
};