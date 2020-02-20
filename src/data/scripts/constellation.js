// CONSTELLATION
var _SCRIPT = new Script("Walker Delta", {dT: 10, scale: 50, epoch:new Date(2019,0,1), plane:{x: I, y: J}});
_SCRIPT.add_body(BODIES.EARTH, 		{x:-2.565776021787787E+07, 	y:1.459776792940268E+08, 	z:-1.550401880809665E+04, 	vx:-2.984330712865031E+01, 	vy:-5.272844547694333E+00, 	vz:9.257075114927904E-04});

var WALKER_DELTA = {
	/*	t:	number of satellites needed to satisfy the mission requirements.
		P:	number of orbital planes that provide maximum coverage.
		dW: ascending node W of p planes are equally distributed around the equator at intervals of dW = 360 / P.
		S:	number of satellites per plane, S = t / P.
		dv:	in each p plane, S satellites are equally distributed at interval dv = 360 / S
		f:	spacing angular between satellites in adjacent planes is df = 360*f/t with f an integer between 0 and (P - 1)
		i:	inclination of all P planes
	*/
	t: 150,
	P: 30,
	i: 60,
	f: 8,
	h: 550,
	pxRadius: 3,
	init: function(script) {
		// WALKER DELTA DESIGN
		this.dW = 360 / this.P;
		this.S	= this.t / this.P;
		this.dv	= 360 / this.S;
		this.df	= 360 * this.f / this.t;
		
		// ADD BODIES
		let k = 1;
		for (let i = 0 ; i < this.P ; i++) {
			for (let j = 0 ; j < this.S ; j++) {
				let color	= 'white';
				if (k === 1) {
					color = 'red';
				}
				let body	= new Body('SAT-' + k,color,5000,0);
				let options	= {i: this.i,
							   W: i * this.dW,
							   e: 0,
							   a: BODIES.EARTH.radius + this.h,
							   w: 0,
							   v: j * this.dv + i * this.df,
							   body: BODIES.EARTH,
							   minRadius: this.pxRadius};
				script.add_body(body, options)
				k += 1;
			}
		}
	},
}

WALKER_DELTA.init(_SCRIPT);