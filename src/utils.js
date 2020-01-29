// Toolbox for conversion or maths
tool = {
	km_to_UA: 		function(value) {
		return value / UA;
	},
	UA_to_km: 		function(value) {
		return value * UA;
	},
	
	rad_to_deg: 	function(value) {
		return value / Math.PI * 180;
	},
	deg_to_rad: 	function(value) {
		return value / 180 * Math.PI;
	},
	quadrant: 		function(cos, sin) {
		if (sin > 0) {
			return Math.acos(cos)
		} else {
			return 2 * Math.PI - Math.acos(cos)
		}
	},
	newton_raphson: function(guess, f, df, epsilon) {
		if (df(guess) == 0) {
			// This ain't right as it's not guaranteed to be close enough to the exact solution.
			return tool.newton_raphson(guess+1, f, df);
		}
		let i = guess;
		let j = guess;
		do {
			i = j;
			j = i - f(i) / df(i);
		} while (Math.abs((j-i) / i) > epsilon)
		return j
	},
	getRGBA: 		function(color) {
		if (!color)
			return;
		if (color.toLowerCase() === 'transparent')
			return [0, 0, 0, 0];
		if (color[0] === '#') {
			if (color.length < 7) {
				// convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
				color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + 	(color.length > 4 ? color[4] + color[4] : '');
			}
			return [parseInt(color.substr(1, 2), 16),
					parseInt(color.substr(3, 2), 16),
					parseInt(color.substr(5, 2), 16),
					color.length > 7 ? parseInt(color.substr(7, 2), 16)/255 : 1];
		}	
		if (color.indexOf('rgb') === -1) {
			// convert named colors
			var temp_elem = document.body.appendChild(document.createElement('fictum')); // intentionally use unknown tag to lower chances of css rule override with !important
			var flag = 'rgb(1, 2, 3)'; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
			temp_elem.style.color = flag;
			if (temp_elem.style.color !== flag)
				return; // color set failed - some monstrous css rule is probably taking over the color of our object
			temp_elem.style.color = color;
			if (temp_elem.style.color === flag || temp_elem.style.color === '')
				return; // color parse failed
			color = getComputedStyle(temp_elem).color;
			document.body.removeChild(temp_elem);
		}
		if (color.indexOf('rgb') === 0) {
			if (color.indexOf('rgba') === -1)
				color += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
				return color.match(/[\.\d]+/g).map(function (a) { return +a });
		}
	},
	setOpacity: 	function(color, opacity) {
		return `rgba(${this.getRGBA(color).toString()})`.replace(/[^,]+(?=\))/, opacity.toString())
	}
};

// Math functions
Math.square = function(value) {
	return value * value;
};
Math.cube 	= function(value) {
	return Math.pow(value, 3);
};

// Objects functions
Number.prototype.pad 	= function() {
	return ('0' + this).slice(-2);
};
Date.prototype.strDate	= function() {
	let year = this.getFullYear().toString();
	if (this.getFullYear() < 0) {year += " BC"}
	return year + "-" + (1+ this.getMonth()).pad() + "-" + this.getDate().pad()
};
Date.prototype.strTime 	= function() {
	return this.getHours().pad() + ":" + this.getMinutes().pad() + ":" + this.getSeconds().pad()
};
Date.prototype.str 		= function() {
	return this.strDate() + " " + this.strTime()
};

