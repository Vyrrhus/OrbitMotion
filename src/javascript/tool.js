// CONSTANTS
var UA 	= 149597870.7; 							// km
var G 	= 6.67408e-20; 							// m3/kg/s2

// Inertial coordinate frame
var I = [1,0,0];
var J = [0,1,0];
var K = [0,0,1];

// SI Units functions
function km_to_UA(value) {
	return value / UA;
}
function UA_to_km(value) {
	return value * UA;
}
function rad_to_deg(value) {
	return value / Math.PI * 180;
}
function deg_to_rad(value) {
	return value * Math.PI / 180;
}
function km_to_px(value) {
	return value / PX.value;
}

// Math functions
function square(value) {
	return Math.pow(value, 2);
}
function cube(value) {
	return Math.pow(value, 3);
}
function newton_raphson(guess, f, df) {
	if (df(guess) == 0) {return newton_raphson(guess+1, f, df);}
	let value_i = guess;
	let value_j = guess;
	let epsilon = 1e-8;
	do {
		value_i = value_j;
		value_j = value_i - f(value_i) / df(value_i);
	} while (Math.abs((value_j - value_i) / value_i) > epsilon)
	return value_j;
}
var matrix = {
	transpose: function(M) {
		/* Input checking first */
		let size_i = M.length;
		if (size_i == undefined) {return M;}
		let size_j = M[0].length;
		if (size_j == 1 && size_i == 1) {return M;}
		if (size_j == 0 || size_i == 0) {return null;}
		
		/* Transposition */
		let result = [];
		if (size_j > 0) {
			for (let j = 0 ; j < size_j ; j++) {
				let line = [];
				for (let i = 0 ; i < size_i ; i++) {
					line.push(M[i][j]);
				}
				result.push(line);
			}
		}
		else {
			for (let k = 0 ; k < size_i ; k++) {
				result.push([M[k]]);
			}
		}
		if (size_j == 1) {
			return result[0];
		}
		return result;
	},
	product: function(A, B) {
		// Input checking
		let size_A = A.length;
		let size_B = B.length;
		for (let k = 1 ; k < size_A ; k++) {
			if (A[k].length != A[0].length) {return null;}
		}
		for (let k = 1 ; k < size_B ; k++) {
			if (B[k].length != B[0].length) {return null;}
		}
		if (A[0].length != B.length) {
			console.log('Dimension error, check your input');
			return null;
		}
		
		// Initialization
		let result = [];
		for (i=0 ; i < A.length ; i++) {
			let line = [];
			for (j=0 ; j < B[0].length ; j++) {
				line.push(0);
			}
			result.push(line);
		}
		
		// Product
		for (let j = 0 ; j < B[0].length ; j++) {
			for (let i = 0 ; i < A.length ; i++) {
				let inner_sum = 0;
				for (let k = 0 ; k < B.length ; k++) {
					inner_sum += A[i][k] * B[k][j];
				}
				result[i][j] = inner_sum;
			}
		}
		return result;
	}
};
var vector = {
	module: function(v) {
		let result = 0;
		for (let k = 0, c = v.length ; k < c ; k++) {
			result += square(v[k]);
		}
		return Math.sqrt(result);
	},
	dot: function(u,v) {
		if (u.length != v.length && u.length != undefined) {
			console.log('Dimension error, check your inputs');
			return null;
		}
		let result = 0;
		for (let k = 0, c = u.length ; k < c ; k++) {
			result += u[k] * v[k];
		}
		return result;
	},
	cross: function(u,v) {
		if (u.length != v.length || u.length != 3) {
			console.log('Dimension error, check your inputs'); 
			return null;
		}
		else {
			let x = u[1]*v[2] - u[2]*v[1];
			let y = u[2]*v[0] - u[0]*v[2];
			let z = u[0]*v[1] - u[1]*v[0];
			return [x,y,z];
		}
		
	},
	scalar: function(a,u) {
		if (a.length > 1) {
			console.log('Dimension error, check your input'); 
			return null;
		}
		else {
			let result = u;
			for (let k = 0, c = u.length ; k < c ; k++) {
				result[k] *= a;
			}
			return result;
		}
	}
};

// Body func
function get_distance(body1, body2) {
	var position1 = {x: 0, y: 0, z: 0};
	var position2 = {x: 0, y: 0, z: 0};
	if (body1.orbit !== null) {
		position1.x = body1.orbit.position.x;
		position1.y = body1.orbit.position.y;
		position1.z =  body1.orbit.position.z;
	}
	if (body2.orbit !== null) {
		position2.x = body2.orbit.position.x;
		position2.y = body2.orbit.position.y;
		position2.z =  body2.orbit.position.z;
	}
	return {x: position2.x - position1.x,
		    y: position2.y - position1.y,
		    z: position2.z - position1.z}
}

function get_force(body1, body2) {
	var dist_1_to_2 = get_distance(body1, body2); // vecteur de 1 vers 2
	var dist_2_to_1 = {x: - dist_1_to_2.x,
					   y: - dist_1_to_2.y,
					   z: - dist_1_to_2.z};
	var distance = Math.sqrt(square(dist_1_to_2.x) + square(dist_1_to_2.y) + square(dist_1_to_2.z))
	var force = G * body1.mass * body2.mass / square(distance);
	
	if (body1.orbit !== null) {
		body1.orbit.force.x += dist_1_to_2.x * force / distance;
		body1.orbit.force.y += dist_1_to_2.y * force / distance;
		body1.orbit.force.z += dist_1_to_2.z * force / distance;
		console.log(body1.orbit.force);
	}
	if (body2.orbit !== null) {
		body2.orbit.force.x += dist_2_to_1.x * force / distance;
		body2.orbit.force.y += dist_2_to_1.y * force / distance;
		body2.orbit.force.z += dist_2_to_1.z * force / distance;
		console.log(body2.orbit.force);
	}
}