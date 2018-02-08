var SUN = new _planet('SUN', 
				  1.9891e30,
				  6.957e5,
				  'yellow',
				  null);

var ORBIT_EARTH 	= new _orbit(SUN,
						     2.424881950463322E-03,
							 1.745821013440429E+02,
							 9.999791846872171E-01,
							 1.666762299093219E-02,
							 2.883066104747550E+02,
							 3.518421606392852E+01);

var ORBIT_MARS 		= new _orbit(SUN,
							 1.848300227683533E+00,
							 4.950844242868963E+01,
							 1.523774374026261E+00,
							 9.338946729255337E-02,
							 2.865998173451791E+02,
							 2.348113473250590E+02);

var ORBIT_TESLA 	= new _orbit(SUN,
							 2.186320814061417E+00,
							 3.179032358582468E+02,
							 1.753135307284016E+00,
							 4.381216282719690E-01,
							 1.151526601226522E+02,
							 5.366123650344590E+00);

var EARTH 	= new _planet(	'EARTH',
				    		5.97219e24,
				    		6371.009,
				    		'#5880b8',
				    		ORBIT_EARTH);

var MARS 	= new _planet(	'MARS',
				   			0.641693e24,
				   			3389.5,
				   			'#d8b059',
				   			ORBIT_MARS);

var TESLA 	= new _planet( 	'TESLA',
						 	null,
						 	null,
						 	'#e00',
						  	ORBIT_TESLA);


var DATA = [SUN, EARTH, MARS, TESLA];