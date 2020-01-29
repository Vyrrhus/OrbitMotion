// CONSTELLATION
var _SCRIPT = new Script("Constellation", {dT: 100, scale: 140, epoch:new Date(2019,0,1), plane:{x: CONST_I, y: CONST_J}});
_SCRIPT.add_body(BODIES.EARTH, 		{x:-2.565776021787787E+07, 	y:1.459776792940268E+08, 	z:-1.550401880809665E+04, 	vx:-2.984330712865031E+01, 	vy:-5.272844547694333E+00, 	vz:9.257075114927904E-04});
//_SCRIPT.add_body(SATELLITES.MOLNIYA, 	{x:4.552697954638234e-13, y:-410.27021572905585, z:-7423.792007086785, vx:9.602465253717867, vy:3.2444837841682955e-17, vz:5.870855806880708e-16, reference: BODIES.EARTH});
//_SCRIPT.add_body(SATELLITES.GEO, 		{x:38679.025673208154, y:0, z:16767.420218906234, vx:0, vy:3.0748760710235925, vz:0, reference: BODIES.EARTH});

var nb_plans = 32;
var nb_sat = 10;

for (var i = 0 ; i < nb_plans ; i++) {
	for (var j = 0 ; j < nb_sat ; j++) {
		_SCRIPT.add_body(new Body(`GEO${i+1}.${j+1}`, 'white', 5000, 0),
						 {i: 83, W: i/nb_plans * 360, e: 0, a: BODIES.EARTH.radius + 42000, w: 0, v: j/nb_sat*360, body: BODIES.EARTH});
	}
}

//var nb_plans = 15;
//var nb_sat   = 1;
//
//for (var i = 0 ; i < nb_plans ; i++) {
//	for (var j = 0 ; j < nb_sat ; j++) {
//		_SCRIPT.add_body(new Body(`POL${i+1}.${j+1}`, 'white', 5000, 0),
//						 {i: 80, W: i/nb_plans * 360, e: 0, a: BODIES.EARTH.radius + 22000, w: 0, v: 90+j/nb_sat*360, body: BODIES.EARTH});
//	}
//}