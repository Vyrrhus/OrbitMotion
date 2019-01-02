var BODIES = {
	SUN: new Body('SUN', 'yellow', 1988500e24, 6.957e5),
	MERCURY: new Body('MERCURY', '#929292', 3.302e23, 2440),
	EARTH: new Body('EARTH', '#5880b8', 5.97219e24, 6371.009),
	VENUS: new Body('VENUS', '#dabeac', 48.685e23, 6051.893),
	MARS: new Body('MARS', '#d8b059', 6.4171e23, 3389.92),
	MOON: new Body('MOON', '#D8D8D8', 7.349e22, 1737.53),
	IO: new Body('IO', '#E8D76F', 8.933e22, 1821.3),
	JUPITER: new Body('JUPITER', '#a98723', 1898.13e24, 69911),
	PLUTO: new Body('PLUTO', '#d8d8d8', 1.307e22, 1188.3),
	SAT: new Body('SATELLITE', '#ffffff', 50, 0)
}
var VECTORS = {
	SUN: [-1.130770710405938E+05, 1.111341040984885E+06, -8.582688999394013E+03, -1.360829795261448E-02, 3.428136241289523E-03, 3.477659644068242E-04],
	MERCURY: [-4.726161342120799E+07, -4.671439022096695E+07, 4.087209407470208E+05, 2.476489744104856E+01, -3.197373462580866E+01, -4.885743761365100E+00],
	VENUS: [-8.238116306186400E+07, 7.005404821376544E+07, 5.684896309465516E+06, -2.263904817693262E+01, -2.701728801057535E+01, 9.352522844122291E-01],
	EARTH: [-2.565776021787787E+07, 1.459776792940268E+08, -1.550401880809665E+04, -2.984330712865031E+01, -5.272844547694333E+00, 9.257075114927904E-04],
	MARS: [ 1.629806212726895E+08, 1.449170333840721E+08, -9.972368219362050E+05, -1.511758798465740E+01, 2.024466077262084E+01, 7.950950455491554E-01],
	JUPITER: [-3.193986316705537E+08, -7.327080675278934E+08, 1.018341837851065E+07,  1.181967750862382E+01, -4.596934312858922E+00, -2.453097000998508E-01],
	MOON: [-2.594384028858606E+07, 1.457191985018245E+08, 1.877793847522885E+04, -2.920041610288576E+01, -6.056705066205493E+00, -1.966943187050774E-02],
	IO: [-3.197666284245768E+08, -7.329147542961717E+08, 1.017069501840085E+07,  2.036894434504372E+01, -1.965020107559456E+01, -6.702641921764574E-01],
	PLUTO: [1.612405510576705E+09, -4.740221572680201E+09, 4.082792987688375E+07, 5.247720955673930E+00, 5.933043038488106E-01, -1.592783598544555E+00],
	SAT: [29573.374234479124-2.565776021787787E+07, 15664.39184588871+1.459776792940268E+08, -3086.6101491273-1.550401880809665E+04, -2.161905766991942-2.984330712865031E+01, 4.083391009469171-5.272844547694333E+00, 0.009391702862444899+9.257075114927904E-04]
//	SAT: [-2.565776021787787E+07+6371.009+500, 1.459776792940268E+08, -1.550401880809665E+04, -2.984330712865031E+01, -5.272844547694333E+00+10.669+20, 9.257075114927904E-04+0.0001]
}

function init() {
	list_bodies = []
	for (var element in BODIES) {
		if (element in VECTORS) {
			e = VECTORS[element];
			BODIES[element].init_state(e[0], e[1], e[2], e[3], e[4], e[5]);
		}
		list_bodies.push(BODIES[element]);
	}
	return set_kepler(list_bodies);
}
function set_kepler(list_body) {
	// Sort by mass
	list_body.sort(function(a,b) {
		return (b.mass - a.mass)
	});
	
	// Iterate through bodies
	for (var i = 1 ; i < list_body.length ; i++) {
		console.log(`Body: ${list_body[i].name}`);
		var reference = list_body[0];
		for (var j = i-1 ; j > 0 ; j--) {
			var distance = Body.get_distance(list_body[i], list_body[j]);
			var SOI = list_body[j].SOI;
			if (distance < SOI) {
				// Reference found
				reference = list_body[j];
				j = 0;
			}
		}
		// Set children
		reference.child.push(list_body[i]);
		
		// Set state vectors
		list_body[i].reference = reference;
		while (reference !== 'inertial') {
			list_body[i].position = vect3.sum(1,list_body[i].position, -1, reference.position);
			list_body[i].velocity = vect3.sum(1, list_body[i].velocity, -1, reference.velocity);
			reference = reference.reference;
		}
		list_body[i].get_orbit(list_body[i].reference);
	}
	
	// Return FOCUS, 
	return list_body
}