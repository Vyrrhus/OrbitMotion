// KERBOL SYSTEM
var _SCRIPT = new Script('Kerbol System', {UA: 13599840.256, dT: 86400/60, scale: 2e5, epoch: new Date(2019,0,1), plane: {x: I, y: J}});
_SCRIPT.add_body(KERBAL.KERBOL, 	{x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0});
_SCRIPT.add_body(KERBAL.MOHO, 	{i: 7, 		W: 70, 		e: 0.2, 	a: 5263138.304, 	w: 15,	v: 3.14,	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.EVE, 	{i: 2.1, 	W: 15, 		e: 0.01, 	a: 9832684.544, 	w: 0,	v: 3.14,	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.GILLY, 	{i: 12, 	W: 80, 		e: 0.55, 	a: 31500, 			w: 10,	v: 0.9, 	body: KERBAL.EVE});
_SCRIPT.add_body(KERBAL.KERBIN, 	{i: 0, 		W: 0, 		e: 0,		a: 13599840.256, 	w: 0,	v: 3.14,	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.MUN, 	{i: 0, 		W: 0, 		e: 0, 		a: 12000, 			w: 0,	v: 1.7, 	body: KERBAL.KERBIN});
_SCRIPT.add_body(KERBAL.MINMUS, 	{i: 6, 		W: 78, 		e: 0, 		a: 47000, 			w: 38,	v: 0.9, 	body: KERBAL.KERBIN});
_SCRIPT.add_body(KERBAL.DUNA, 	{i: 0.06, 	W: 135.5, 	e: 0.051, 	a: 20726155.264, 	w: 0,	v: 3.14,	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.IKE, 	{i: 0.2, 	W: 0, 		e: 0.03, 	a: 3200, 			w: 0,	v: 1.7, 	body: KERBAL.DUNA});
_SCRIPT.add_body(KERBAL.DRES, 	{i: 5, 		W: 280, 	e: 0.145, 	a: 40839348203, 	w: 90,	v: 3.14,	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.JOOL, 	{i: 1.304, 	W: 52, 		e: 0.05, 	a: 68773560.320, 	w: 0,	v: 0.1, 	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.LAYTHE, 	{i: 0,		W: 0, 		e: 0, 		a: 27184, 			w: 0,	v: 3.14,	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.VALL, 	{i: 0, 		W: 0, 		e: 0, 		a: 43152, 			w: 0,	v: 0.9, 	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.TYLO, 	{i: 0.025, 	W: 0, 		e: 0, 		a: 68500, 			w: 0,	v: 3.14,	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.BOP, 	{i: 15, 	W: 10, 		e: 0.235, 	a: 128500, 			w: 25,	v: 0.9, 	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.POL, 	{i: 4.25, 	W: 2, 		e: 0.171, 	a: 179890, 			w: 15,	v: 0.9, 	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.EELOO, 	{i: 6.15, 	W: 50, 		e: 0.26, 	a: 90118820, 		w: 260,	v: 3.14,	body: KERBAL.KERBOL});