// SCALE
var SCALE = {
	value: 2e6,
	unit: 'km',
	lock: false,
    dimensions: {
        marginWidth: 0.05,
        paddingBottom: 0.05,
        scaleHeight: 0.03
    },
    showBox: false,
    draw: function(ctx, x0, y0, w0, h0) {
        /*  DRAW SIMULATION SCALE */
        // DIMENSIONS
        let scaleX = x0 + w0 * this.dimensions.marginWidth;
        let scaleY = y0 + h0 * (1 - this.dimensions.paddingBottom - 2 * this.dimensions.scaleHeight)
        
        let scaleW = w0 * (1 - 2 * this.dimensions.marginWidth)
        let scaleH = h0 * this.dimensions.scaleHeight * 2;
        
        ctx.clearRect(scaleX, scaleY - 10, scaleW, scaleH + 10);
        
        // SHOW SCALE BOX
        if (this.showBox) {
            ctx.beginPath();
            ctx.rect(x0,y0,w0,h0);
            ctx.fillStyle = "rgba(255,0,0,0.4)";
            ctx.fill();
            ctx.closePath();
            
            ctx.beginPath();
            ctx.rect(scaleX, scaleY, scaleW, scaleH);
            ctx.fillStyle = "rgba(0,255,0,0.4)";
            ctx.fill();
            ctx.closePath();
        }
        
        // DRAW SCALE
        ctx.beginPath();
        ctx.rect(scaleX, scaleY + scaleH / 2, scaleW, 1);
        ctx.rect(scaleX, scaleY, 1, scaleH);
        ctx.rect(scaleX + scaleW, scaleY, 1, scaleH);
        ctx.fillStyle = "#BBB";
        ctx.fill();
        ctx.closePath();
        
        // DRAW TEXT
        ctx.font = '13px Arial';
        let value = this.value * scaleW;
        let text = value.toExponential(3) + ' ' + this.unit;
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'center';
        ctx.fillText(text, scaleX + scaleW / 2, scaleY + scaleH / 2)
    }
};