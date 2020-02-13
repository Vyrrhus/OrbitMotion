// Scenario class
/*
	Elements qui changent pour chaque scénario :
	- valeur UA	=> preset
	- valeur G	=> preset
	- liste des BODIES initialisés (ie avec position de départ)
	- FOCUS.body
	- SCALE.value	=> preset
	- TIME.value	=> preset
	- TIME.date (à noter que ce serait cool de récup automatiquement les vecteurs d'état de chaque corps pour toutes les époques)
	- PLANE.x && PLANE.y	=> preset
	
	Concernant les pb d'époque on va pour le moment considérer que tout est cohérent ; à l'avenir faudra distinguer "simulation epoch" et les différentes epoch, et initialiser la position des corps à la simulation epoch.
	Concernant les valeurs preset pour l'instant on les fixe, à l'avenir on pourrait s'en passer en automatisant leur génération
	Concernant l'ajout de bodies faudra pouvoir utiliser des éléments orbitaux directement plutôt que vecteur d'état (tous les angles par défaut à 0° si non renseignés)
*/

class Script {
	// Constructor
	constructor(name, options) {
		/*
			Arguments
			---------
			name:	Script name
			UA:		UA value (if not in Solar System)
			G:		G value (if not in Solar System)
			focus:	<body> set as the focus
			scale:	value [km] for 1px
			dT:		value [s] for a timestep
			epoch:	date
			plane:	{x, y} projection plane
		*/
		this.name = name;
		this.list_bodies = [];
		this.sort_list = [];
		this.bodyByDepth 	= [];
		
		// Options
		if (options === undefined) {
			options = {};
		}
		if (options.UA === undefined) {
			options.UA = 149597870.7;	// km
		}
		if (options.G === undefined) {
			options.G = 6.67408e-20; 	// km3/kg/s2
		}
		
		this.UA = options.UA;
		UA = this.UA;
		this.G 	= options.G;
		G = this.G;
		this.focus = options.focus;
		this.scale = options.scale;
		this.dT = options.dT;
		this.epoch = options.epoch;
		this.plane = options.plane; // On pourrait faire des trucs sympas avec plane (ecliptique, perifocal, etc.)
	}
	
	// Methods
	add_body(body, options) {
		/*
			Arguments
			---------
			body:				<body> to add
			
			> STATE DEF
			x,y,z || pos:		3 elements for position parameters or <vect3>
			vx,vy,vz || vel:	3 elements for velocity parameters or <vect3>
			reference:			<body> or null
			
			> KEPLER DEF
			i,W,e,a,w,v:		6 keplerian elements
			M:					with mean anomaly instead of true
			body:				<body> to orbit around
			
		*/
        // Reset the body
        body.init();
        
		// State definition
		if (options.position === undefined) {
			if (options.x !== undefined && options.y !== undefined && options.z !== undefined) {
				options.position = new vect3(options.x, options.y, options.z);
			}
		}
		if (options.velocity === undefined) {
			if (options.vx !== undefined && options.vy !== undefined && options.vz !== undefined) {
				options.velocity = new vect3(options.vx, options.vy, options.vz);
			}
		}
		if (options.position !== undefined && options.velocity !== undefined) {
			body.init_state({position: options.position, velocity: options.velocity}, options.reference);
			this.list_bodies.push(body);
			return
		}
		
		// Kepler definition
		if (options.body !== undefined) {
			var i = tool.deg_to_rad(options.i) || 0;
			var W = tool.deg_to_rad(options.W) || 0;
			var w = tool.deg_to_rad(options.w) || 0;
			var e = options.e || 0;
			var a = options.a || options.body.radius + 100;
            var v = tool.deg_to_rad(options.v) || 0;
			body.orbit = new Orbit(options.body, i, W, e, a, w, v, {h: Math.sqrt(a * options.body.G * (1-e*e)), w_true: W+w, u:v+w, l_true: v+w+W});
            
            if (options.M) {
                body.orbit.v = body.orbit.true_anomaly = body.orbit.mean_to_anomaly(options.M)
            }
			
			var state = body.orbit.get_state();
			body.state = new State(body, options.body, state);
			this.list_bodies.push(body);
			return
		}
		console.log(`Something wrong happened for ${body.name} while getting added to the script ${this.name}`);
	}
	set_kepler() {
		var list_bodies = this.list_bodies;
		
		// Sort by mass
		list_bodies.sort(function(a,b) {
			return (b.mass - a.mass)
		});
		console.log(`${this.name} - central body : ${list_bodies[0].name}`);
		
		// Iterate
		for (let i = 1 ; i < list_bodies.length ; i++) {
			console.log(`${this.name} - add ${list_bodies[i].name}`);
//            console.log(list_bodies[i].state)
			var reference = this.list_bodies[0];
			for (var j = i - 1; j > 0 ; j--) {
				var distance = Body.get_distance(list_bodies[i], list_bodies[j]);
				var SOI = list_bodies[j].SOI;
				if (distance < SOI) {
					// Reference found
					reference = list_bodies[j];
					j = 0;
				}
			}
			
			// Add child to reference
			reference.child.push(list_bodies[i]);
			
			// Set relative state vectors
//			var relative_state = list_bodies[i].state.get_relative(reference);
			var relative_state = State.relative(list_bodies[i].state, reference.state);
//			var relative_state = stateVector.get_relative(list_bodies[i].state, reference.state);
//			list_bodies[i].state = new stateVector(relative_state, reference);
			list_bodies[i].state = relative_state;
			list_bodies[i].get_orbit(list_bodies[i].state.reference);
		}
	}
	init() {
		this.set_kepler();
		if (!this.list_bodies.includes(this.focus)) {
			this.focus = this.list_bodies[0];
		}
		for (var i = 0 ; i < this.list_bodies.length ; i++) {
			this.sort_list.push(this.list_bodies[i]);
			this.bodyByDepth.push(this.list_bodies[i]);
		}
	}
	
	// Static methods
	static load(name, callback) {
		let scriptDOM = document.getElementById('scenario-script');
		if (scriptDOM instanceof Element) {
			scriptDOM.remove();
		}
		
		scriptDOM		= document.createElement('script');
		scriptDOM.id	= 'scenario-script';
		scriptDOM.type	= 'text/javascript';
		scriptDOM.src	= `src/data/scripts/${name}.js`;
		
		scriptDOM.onload = function() {
			_SCENARIO = _SCRIPT;
			callback();
		};
		scriptDOM.onerror = function() {
			console.log('Something wrong happened while loading script.');
		}
		document.head.appendChild(scriptDOM);
	}
}