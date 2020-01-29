class State {
	// Constructor
	constructor(self, reference, options) {
		// Check options
		if (options.position === undefined) {
			options.position = {x: options.x, 	y: options.y, 	z: options.z};
		}
		if (options.velocity === undefined) {
			options.velocity = {x: options.vx, 	y: options.vy, 	z: options.vz};
		}
		
		// Properties
		this.self = self;
		this.position = new vect3(options.position.x, options.position.y, options.position.z);
		this.velocity = new vect3(options.velocity.x, options.velocity.y, options.velocity.z);
		this.reference = reference;
	}
	
	// Getters
	get absolute() {
		if (this.reference === null) {
			return this
		}
		var ref = this.reference;
		var position = this.position;
		var velocity = this.velocity;
		
		// Iteration through all references
		while (ref !== null) {
			position = vect3.add(position, ref.state.position);
			velocity = vect3.add(velocity, ref.state.velocity);
			ref = ref.state.reference;
		}
		return new State(this.self, ref, {position: position, velocity: velocity})
	}
	
	// Methods
	on_screen(stateFocus, scale, plane, center) {
		var relState = State.relative(this, stateFocus);
		relState.position = vect3.scale(1/scale, relState.position);
		return new State(relState.self, 
						 relState.reference,
						 {x: vect3.dot(relState.position, plane.x) + center.x,
						  y: - vect3.dot(relState.position, plane.y) + center.y,
						  z: vect3.dot(relState.position, plane.z),
						  velocity : relState.velocity})
	}
	
	// Static methods
	static relative(stateA, stateB) {
		// Get A state relative to B
		
		/*
			Next lines cause issues (return the arg instead of a copy)
		*/
//		if (stateA.reference === stateB.self) {
//			return stateA
//		}
		var absoluteA = stateA.absolute;
		var absoluteB = stateB.absolute;
		return new State(stateA.self, 
						 stateB.self, 
						 {position: vect3.diff(absoluteA.position, absoluteB.position),
						  velocity: vect3.diff(absoluteA.velocity, absoluteB.velocity)})
	}
}