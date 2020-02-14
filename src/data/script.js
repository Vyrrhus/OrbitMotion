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
		this.list_bodies 	= [];
		this.bodyByDepth 	= [];
		this.bodyByRadius	= [];
		
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
	sort_script() {
		// Sort by mass
		let sortedList = this.list_bodies.sort(function(a,b) {
			return (b.mass - a.mass)
		});
		this.bodyByRadius.push(sortedList[0]);
		console.log(`${this.name} - central body : ${sortedList[0].name}`);
		
		// Define the arborescence of orbits
		for (let i = 1 ; i < sortedList.length ; i++) {
			console.log(`${this.name} - add ${sortedList[i].name}`);
			let reference = this.list_bodies[0];
			for (let j = i - 1; j > 0 ; j--) {
				let distance = Body.get_distance(sortedList[i], sortedList[j]);
				let SOI = sortedList[j].SOI;
				if (distance < SOI) {
					// Reference found
					reference = sortedList[j];
					j = 0;
				}
			}
			
			// Add child to body-reference
			reference.child.push(sortedList[i]);
			
			// Set relative state vectors
			let relative_state = State.relative(sortedList[i].state, reference.state);
			sortedList[i].state = relative_state;
			sortedList[i].get_orbit(sortedList[i].state.reference);
		}
		
		// Define the DOM arborescence
		document.getElementById('tree').remove();
		document.getElementById('focusOrigin').remove();
		let rootDOM 	= document.getElementById('treeOrigin');
		let focusRoot 	= document.createElement('i');
		let treeDOM 	= document.createElement('ul');
		rootDOM.getElementsByTagName('span')[0].innerHTML = sortedList[0].name;
		focusRoot.setAttribute('class', 'fas fa-eye unlockedFocus')
		focusRoot.setAttribute('onclick', 'setFocusOn(this)');
		focusRoot.id 	= 'focusOrigin';
		treeDOM.id		= 'tree';

		rootDOM.appendChild(focusRoot);
		rootDOM.appendChild(treeDOM);
		
		let lastParent = [sortedList[0]];
		
		while (lastParent.length !== 0) {
			let nextParent = []
			
			// Iterate through parent-body (ie: Kerbol)
			for (let i = 0 ; i < lastParent.length ; i++) {
				let parent = lastParent[i];
				let childSorted = parent.child.sort(function(a,b) {
					return (a.orbit.a - b.orbit.a)
				});
				
				// Iterate through parent's childs (ie: Moho, Eve, Kerbin...)
				for (let j = 0 ; j < childSorted.length ; j++) {
					let child = childSorted[j];
					
					// Declare DOM li element and fill it with span & ul if necessary
					let bodyDOM 		= document.createElement('li');
					let titleDOM		= document.createElement('span');
					let focusDOM		= document.createElement('i');
					bodyDOM.id			= 'body-' + child.name;
					titleDOM.innerHTML 	= child.name;
					focusDOM.setAttribute('class', 'fas fa-eye unlockedFocus');
					focusDOM.setAttribute('onclick', 'setFocusOn(this)');
					
					bodyDOM.appendChild(titleDOM);
					bodyDOM.appendChild(focusDOM);
					
					if (child.child.length !== 0) {
						bodyDOM.appendChild(document.createElement('ul'));
						bodyDOM.classList.toggle('rolled');
						bodyDOM.setAttribute('onclick', 'toggleRoll(this)');
						nextParent.push(child);
					}
					
					// Put DOM element in the right place
					if (child.orbit.parent === sortedList[0]) {
						// Case 1 : Parent is the System main attractor
						treeDOM.appendChild(bodyDOM);
						this.bodyByRadius.push(child);
					} 
					else {
						// Case 2 : Parent is another sub-body
						let parentDOM_name = 'body-' + parent.name;
						let parentDOM = document.getElementById(parentDOM_name);
						parentDOM.getElementsByTagName('ul')[0].appendChild(bodyDOM);
						
						let parentIndex = this.bodyByRadius.indexOf(parent);
						this.bodyByRadius.splice(parentIndex+1+j,0,child);
					}
				}
			}
			lastParent = nextParent;
		}
	}
	init() {
		this.sort_script();
		if (!this.list_bodies.includes(this.focus)) {
			this.focus = this.list_bodies[0];
		}
		for (var i = 0 ; i < this.list_bodies.length ; i++) {
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