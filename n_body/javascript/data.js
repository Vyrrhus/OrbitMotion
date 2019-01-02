var SUN = new _planet('SUN', 
				  1.9891e30,
				  6.957e5,
				  'yellow',
				  null);

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

var ORBIT_SATURN	= new _orbit(SUN,
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
	
var ORBIT_PLUTO 	= new _orbit(SUN,
							1.723730762109442E+01, 
							1.102860666329842E+02, 
							3.946862916026242E+01, 
							2.522778195718353E-01, 
							1.127647308059285E+02, 
							6.264626398677877E+01);

var ORBIT_HALLEY 	= new _orbit(SUN,
							162.262690579161,
							58.42008097656843,
							17.8341442925537,
							0.967142908462304,
							111.3324851045177,
							38.3842644764388);

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

var SATURN = new _planet(	'SATURNE',
				   			568.319e24,
				  		 	58232,
				   			'#f7e4c8',
				   			ORBIT_SATURN);

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

var PLUTO = new _planet(	'PLUTO',
					   		0.01309e24,
					   		1151,
					   		'#DEB48E',
					   		ORBIT_PLUTO);

var ORBIT_MOON 	= new _orbit(EARTH, 
						5.196960685321760E+00, 
						1.351208912106474E+02, 
						2.579309287237687E-03, 
						7.618173744911751E-02, 
						3.249459462415981E+02, 
						3.443568163820373E+02);

var ORBIT_IO 	= new _orbit(JUPITER,
						2.202703864911423E+00, 
						3.385425331807581E+02, 
						2.821039215496194E-03, 
						3.768236108797693E-03, 
						2.402957809630536E+02, 
						2.371258545024796E+02);
	
var ORBIT_EUROPA = new _orbit(JUPITER,
						2.683895950717743E+00, 
						3.364082945913950E+02, 
						4.486843999106538E-03, 
						9.700145315441250E-03, 
						6.569752966635679E+01, 
						2.978505344627345E+02);
	
var ORBIT_GANYMEDE = new _orbit(JUPITER,
						2.295592704652490E+00, 
						3.406626851721088E+02, 
						7.155930235487599E-03, 
						2.016085670322323E-03, 
						3.177399158899967E+02, 
						2.544874399432277E+02);
	
var ORBIT_ENCELADUS = new _orbit(SATURN,
						2.805649671811507E+01,
						1.695411966560971E+02, 
						1.593711800889939E-03, 
						6.417148409504786E-03, 
						1.926819986280434E+02, 
						2.280121924070831E-01);

var MOON 	 = new _planet(	'MOON',
					  		7.3477e22,
					  		1737.5,
					  		'#D8D8D8',
					  		ORBIT_MOON);
	
var IO 		= new _planet( 	'IO',
						 	8.9319e22,
						 	1821.6,
						 	'#E8D76F',
						 	ORBIT_IO);
	
var EUROPA 	= new _planet( 	'EUROPA',
						 	4.7998e22,
						 	1560.8,
						 	'#6D8792',
						 	ORBIT_EUROPA);
	
var GANYMEDE = new _planet( 'GANYMEDE',
						 	1.4819e23,
						 	2631.2,
						 	'#372E27',
						 	ORBIT_GANYMEDE);
	
var ENCELADUS = new _planet('ENCELADUS',
						   1.0794e20,
						   252.1,
						   '#EDEDED',
						   ORBIT_ENCELADUS);

var HALLEY  = new _planet(	'HALLEY',
						 	5,
						 	100,
						 	'#FFF',
						 	ORBIT_HALLEY);

var ENCKE 	= new _planet(	'ENCKE',
						 	5,
						 	100,
						 	'#CCC',
						 	new _orbit(SUN,
									   11.78183005207527,
									   334.5678392905074,
									   2.215134573264697,
									   0.8483251746071773,
									   186.5437009154704,
									   143.2720471022976));

var BIELA 	= new _planet(	'BIELA',
						 	5,
						 	100,
						 	'#AAA',
						 	new _orbit(SUN,
									   13.2164,
									   250.669,
									   3.53465808340135,
									   0.751299,
									   221.6588,
									   0.9469569963959761));

var FAYE 	= new _planet(	'FAYE',
						 	5,
						 	100,
						 	'#888',
						 	new _orbit(SUN,
									   9.070294510274881,
									   199.143982411512,
									   3.83815915788662,
									   0.5696175496849397,
									   205.1258177176394,
									   59.65629669645756));

var BRORSEN = new _planet(	'BRORSEN',
						 	5,
						 	100,
						 	'#555',
						 	new _orbit(SUN,
									   29.3821,
									   102.9676,
									   3.10112826228681,
									   0.809796,
									   14.9468,
									   0.1743237848212893));

var CHURYUMOV = new _planet('CHURYUMOV',
						 	5,
						 	100,
						 	'#333',
						 	new _orbit(SUN,
									   2.500194171253696,
									   109.5977615931609,
									   3.106510726920444,
									   0.1755262934192068,
									   314.4202377949332,
									   83.75840147746375));


var DATA = [SUN, MERCURY, VENUS, EARTH, MOON, MARS, JUPITER, IO, EUROPA, GANYMEDE, SATURN, ENCELADUS, URANUS, NEPTUNE, PLUTO, HALLEY, ENCKE, BIELA, FAYE, BRORSEN, CHURYUMOV];