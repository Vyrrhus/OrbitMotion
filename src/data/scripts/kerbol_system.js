// KERBOL SYSTEM
var _SCRIPT = new Script('Kerbol System', {UA: 13599840.256, dT: 86400/60, scale: 2e5, epoch: new Date(2019,0,1), plane: {x: I, y: J}});
_SCRIPT.add_body(KERBAL.KERBOL, 	{x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0});
_SCRIPT.add_body(KERBAL.MOHO, 	{i: 7, 		W: 70, 		e: 0.2, 	a: 5263138.304, 	w: 15,	v: 3.14,	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.EVE, 	{i: 2.1, 	W: 15, 		e: 0.01, 	a: 9832684.544, 	w: 0,	v: 3.14,	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.GILLY, 	{i: 12, 	W: 80, 		e: 0.55, 	a: 31500, 			w: 10,	v: 0.9, 	body: KERBAL.EVE});
_SCRIPT.add_body(KERBAL.KERBIN, {i: 0, 		W: 0, 		e: 0,		a: 13599840.256, 	w: 0,	v: 3.14,	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.MUN, 	{i: 0, 		W: 0, 		e: 0, 		a: 12000, 			w: 0,	v: 1.7, 	body: KERBAL.KERBIN});
_SCRIPT.add_body(KERBAL.MINMUS, {i: 6, 		W: 78, 		e: 0, 		a: 47000, 			w: 38,	v: 0.9, 	body: KERBAL.KERBIN});
_SCRIPT.add_body(KERBAL.DUNA, 	{i: 0.06, 	W: 135.5, 	e: 0.051, 	a: 20726155.264, 	w: 0,	v: 3.14,	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.IKE, 	{i: 0.2, 	W: 0, 		e: 0.03, 	a: 3200, 			w: 0,	v: 1.7, 	body: KERBAL.DUNA});
_SCRIPT.add_body(KERBAL.DRES, 	{i: 5, 		W: 280, 	e: 0.145, 	a: 40839348.203, 	w: 90,	v: 3.14,	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.JOOL, 	{i: 1.304, 	W: 52, 		e: 0.05, 	a: 68773560.320, 	w: 0,	v: 0.1, 	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.LAYTHE, {i: 0,		W: 0, 		e: 0, 		a: 27184, 			w: 0,	v: 3.14,	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.VALL, 	{i: 0, 		W: 0, 		e: 0, 		a: 43152, 			w: 0,	v: 0.9, 	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.TYLO, 	{i: 0.025, 	W: 0, 		e: 0, 		a: 68500, 			w: 0,	v: 3.14,	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.BOP, 	{i: 15, 	W: 10, 		e: 0.235, 	a: 128500, 			w: 25,	v: 0.9, 	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.POL, 	{i: 4.25, 	W: 2, 		e: 0.171, 	a: 179890, 			w: 15,	v: 0.9, 	body: KERBAL.JOOL});
_SCRIPT.add_body(KERBAL.SARNUS, {i: 2.02, 	W: 184, 	e: 0.053, 	a: 125798522.368, 	w: 0,	M: 2.881, 	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.HALE, 	{i: 1, 		W: 55, 		e: 0, 		a: 10488.231, 		w: 0,	M: 0, 		body: KERBAL.SARNUS});
_SCRIPT.add_body(KERBAL.OVOK, 	{i: 1.5, 	W: 55, 		e: 0.01, 	a: 12169.413, 		w: 0,	M: 1.72, 	body: KERBAL.SARNUS});
_SCRIPT.add_body(KERBAL.EELOO, 	{i: 2.3, 	W: 55, 		e: 0.003, 	a: 19105.978, 		w: 260,	M: 3.14, 	body: KERBAL.SARNUS});
_SCRIPT.add_body(KERBAL.SLATE, 	{i: 2.3, 	W: 55, 		e: 0.04, 	a: 42592.946, 		w: 0,	M: 1.1, 	body: KERBAL.SARNUS});
_SCRIPT.add_body(KERBAL.TEKTO, 	{i: 9.4, 	W: 55, 		e: 0.028, 	a: 97355.304, 		w: 0,	M: 2.1, 	body: KERBAL.SARNUS});
_SCRIPT.add_body(KERBAL.URLUM, 	{i: 0.64, 	W: 61, 		e: 0.045, 	a: 254317012.787, 	w: 0,	M: 5.596, 	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.POLTA, 	{i: 2.45, 	W: 40, 		e: 0.002, 	a: 11727.895, 		w: 60,	M: 1.521, 	body: KERBAL.URLUM});
_SCRIPT.add_body(KERBAL.PRIAX, 	{i: 2.5, 	W: 40, 		e: 0.002, 	a: 11727.895, 		w: 0,	M: 1.521, 	body: KERBAL.URLUM});
_SCRIPT.add_body(KERBAL.WAL, 	{i: 1.9, 	W: 40, 		e: 0.023, 	a: 67553.668, 		w: 0,	M: 2.962, 	body: KERBAL.URLUM});
_SCRIPT.add_body(KERBAL.TAL, 	{i: 1.9, 	W: 40, 		e: 0, 		a: 3109.163, 		w: 0,	M: 0, 		body: KERBAL.WAL});
_SCRIPT.add_body(KERBAL.NEIDON, {i: 1.27, 	W: 259, 	e: 0.013, 	a: 409355191.706, 	w: 0,	M: 2.272, 	body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.THATMO, {i: 161.1, 	W: 66, 		e: 0, 		a: 32300.895, 		w: 0,	M: 2.047, 	body: KERBAL.NEIDON});
_SCRIPT.add_body(KERBAL.NISSEE, {i: 29.56, 	W: 66, 		e: 0.72, 	a: 487743.514, 		w: 0,	M: 2.047, 	body: KERBAL.NEIDON});
_SCRIPT.add_body(KERBAL.PLOCK, 	{i: 6.15, 	W: 260, 	e: 0.26, 	a: 535833706.086, 	w: 50,	M: 0, 		body: KERBAL.KERBOL});
_SCRIPT.add_body(KERBAL.KAREN, 	{i: 0, 		W: 260, 	e: 0, 		a: 2457.8, 			w: 50,	M: 0, 		body: KERBAL.PLOCK});