// JOOL SYSTEM
var _SCRIPT = new Script('Kerbol System', {UA: 13599840.256, dT: 86400/360, scale: 466, epoch: new Date(2019,0,1), plane: {x: X, y: Y}, focus:KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.JOOL, 	{x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0});
_SCRIPT.add_body(KERBAL.LAYTHE,{i: 0,		W: 0, 		e: 0, 		a: 27184, 			w: 0,	v: 3.14,	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.VALL, 	{i: 0, 		W: 0, 		e: 0, 		a: 43152, 			w: 0,	v: 0.9, 	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.TYLO, 	{i: 0.025, 	W: 0, 		e: 0, 		a: 68500, 			w: 0,	v: 3.14,	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.BOP, 	{i: 15, 	W: 10, 		e: 0.235, 	a: 128500, 			w: 25,	v: 0.9, 	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.POL, 	{i: 4.25, 	W: 2, 		e: 0.171, 	a: 179890, 			w: 15,	v: 0.9, 	body: KERBAL.JOOL});
_SCRIPT.add_body(CONSTELLATION.SAT1, {i: 0, W: 0, e: 0, a: 2000, w: 0, v: 0, body: KERBAL.TYLO});