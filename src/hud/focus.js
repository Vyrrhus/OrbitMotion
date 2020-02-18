// FOCUS
var FOCUS = {
	body: null,
	num: 0,
	lock: false,
	focusDOM: null,
	init: function() {
		
	},
	setFocusByName: function(body_name) {
		for (let i = 0 ; i < _SCENARIO.bodyByRadius.length ; i++) {
			let body = _SCENARIO.bodyByRadius[i];
			if (body.name === body_name) {
				this.body 	= body;
				this.num	= _SCENARIO.bodyByRadius.indexOf(body);
				break
			}
		}
		this.setFocusOnTree();
		for (let i = 0 ; i < _SCENARIO.bodyByRadius.length ; i++) {
			_SCENARIO.bodyByRadius[i].sketch.focus = this.body;
		}
		console.log(`FOCUS set on : ${this.body.name}`)
	},
	setFocusByNum: function(body_num) {
		let body = _SCENARIO.bodyByRadius[body_num];
		this.setFocusByName(body.name);
	},
	setFocusOnTree: function() {
		if (this.focusDOM !== null) {
			this.focusDOM.classList.toggle('unlockedFocus');
			this.focusDOM.classList.toggle('lockedFocus');
		}
		if (this.num === 0) {
			this.focusDOM = document.getElementById('focusOrigin');
		} else {
			let title = 'body-' + this.body.name;
			this.focusDOM = document.getElementById(title).getElementsByTagName('i')[0];
		}
		this.focusDOM.classList.toggle('unlockedFocus');
		this.focusDOM.classList.toggle('lockedFocus');
	}
};