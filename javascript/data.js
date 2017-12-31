// Rank 0
var SUN = new _planet('SUN', 
				  1.9891e30,
				  6.957e5,
				  'yellow',
				  null);

// Rank 1
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

var MERCURY = new _planet('MERCURY',
					  0.330104e24,
					  2439.7,
					  'orange',
					  ORBIT_MERCURY);
var VENUS = new _planet('VENUS', 
				    4.86732e24,
				    6051.8,
				    'green',
				    ORBIT_VENUS);
var EARTH = new _planet('EARTH',
				    5.97219e24,
				    6371.009,
				    'blue',
				    ORBIT_EARTH);
var MARS = new _planet('MARS',
				   0.641693e24,
				   3389.5,
				   'red',
				   ORBIT_MARS);
