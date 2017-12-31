// Rank 0
var SUN = new _planet('SUN', 
				  1.9891e30,
				  6.957e5,
				  'yellow',
				  null);

// Orbit Rank 1
var ORBIT_MERCURY 	= new _orbit(SUN, 
						   	7.003938621978453, 
						   	4.830840964417403E+01, 
						   	3.870978660388905E-01, 
						   	2.056385802768018E-01, 
						   	2.917450639154915E+01, 
						   	1.034534549156763E+02);
var ORBIT_VENUS 	= new _orbit(SUN,
							 3.394490723804590E+00, 
							 7.662845580893872E+01, 
							 7.233304294142561E-01, 
							 6.801883435239245E-03, 
							 5.476413547432202E+01, 
							 1.442517569276391E+02);
var ORBIT_EARTH 	= new _orbit(SUN,
							 1.442517569276391E-02, 
							 2.109010444915891E+02, 
							 9.990472190345268E-01, 
							 1.578453256417450E-02, 
							 2.525270024725202E+02, 
							 3.568366379975838E+02);
var ORBIT_MARS 		= new _orbit(SUN,
							 1.848339620191774E+00, 
							 4.950783226093129E+01, 
							 1.523746511931863E+00, 
							 9.341780050323115E-02, 
							 2.866026779027202E+02,	
							 2.176767558580171E+02);

var ORBIT_JUPITER	= new _orbit(SUN,
							1.303637966856463E+00, 
							1.005213157189207E+02, 
							5.202542422947007E+00, 
							4.885927439345982E-02, 
							2.736042883561856E+02, 
							2.041846436041122E+02);

var ORBIT_SATURNE	= new _orbit(SUN,
							2.487689401889006E+00, 
							1.136052151676273E+02, 
							9.572140096816266E+00, 
							5.155881895496966E-02, 
							3.399985499049498E+02, 
							1.766618534596307E+02);

var ORBIT_URANUS	= new _orbit(SUN,
							7.700798753715145E-01,
							7.412911928059437E+01,
							1.913232112250847E+01,
							4.929510554854896E-02,
							9.930241211616277E+01,
							2.136359804981328E+02);

var ORBIT_NEPTUNE	= new _orbit(SUN,
							1.777597703201860E+00, 
							1.319250489390328E+02,
							3.004852847210088E+01,
							6.477639267230120E-03,
							2.694963452560274E+02,
							3.019029128867259E+02);


// Planets Rank 1
var MERCURY = new _planet(	'MERCURY',
					  		0.330104e24,
					  		2439.7,
					  		'#929292',
					  		ORBIT_MERCURY);
var VENUS 	= new _planet(	'VENUS', 
				    		4.86732e24,
				    		6051.8,
				    		'#dabeac',
				    		ORBIT_VENUS);
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

var JUPITER = new _planet(	'JUPITER',
				   			1898.13e24,
				   			69911,
				   			'#a98723',
				   			ORBIT_JUPITER);
var SATURNE = new _planet(	'SATURNE',
				   			568.319e24,
				  		 	58232,
				   			'#f7e4c8',
				   			ORBIT_SATURNE);
var URANUS 	= new _planet(	'URANUS',
				   			86.8103e24,
				   			25362,
				   			'#b0b2c8',
				   			ORBIT_URANUS);
var NEPTUNE = new _planet(	'NEPTUNE',
				   			102.410e24,
				   			24622,
				   			'#004e73',
				   			ORBIT_NEPTUNE);
