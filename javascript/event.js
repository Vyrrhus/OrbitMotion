document.addEventListener('keypress', function(event) {
	if (event.key === '+' || event.key === '-') {
		if (event.key === '+') {
			TIME.dT*=1.25;
		}
		else {
			TIME.dT*=0.8;
		}
		if (Math.abs(TIME.dT) < 1) {TIME.dT = 1 * Math.sign(TIME.dT);}
		if (TIME.dT > 365.25*86400) {TIME.dT = 365.25*86400;}
	}
	if (event.key === '1') {FOCUS.change(SUN);}
	if (event.key === '2') {FOCUS.change(MERCURY);}
	if (event.key === '3') {FOCUS.change(VENUS);}
	if (event.key === '4') {FOCUS.change(EARTH);}
	if (event.key === '5') {FOCUS.change(MARS);}
	if (event.key === '6') {FOCUS.change(JUPITER);}
	if (event.key === '7') {FOCUS.change(SATURN);}
	if (event.key === '8') {FOCUS.change(URANUS);}
	if (event.key === '9') {FOCUS.change(NEPTUNE);}
	if (event.key === 'a') {
		BUTTON.draw_ORBIT.switch();
	}
	if (event.keyCode === 32 || event.key === 'q') {
		BUTTON.draw_TIMELINE.play_pause.switch();
	}
	if (event.keyCode === 47) {TIME.dT *= -1;}
	if (event.key === '0') {
		RUNNING = false;
		TIME.dT = - TIME.value;
		context_ORBIT.clearRect(0,0,WIDTH,HEIGHT);
		draw();
		TIME.dT = 3600;
		RUNNING = true;
		draw();
	}
});

document.addEventListener('wheel', function(event) {
	ZOOM.num += event.deltaY/100;
	if (ZOOM.num < 0 || ZOOM.num > 92) {
		ZOOM.num -= event.deltaY/100;
	}
	if (ZOOM.num < 55) {ZOOM.unit = 1;ZOOM.unit_name = ' km';}
	else {ZOOM.unit = UA;ZOOM.unit_name = ' UA';}
	
	ZOOM.value = ZOOM.b(ZOOM.num) * Math.pow(10,ZOOM.a(ZOOM.num)) * ZOOM.unit;
	PX.set();
	PX.scale(20,30);
	context_ORBIT.clearRect(0,0,WIDTH,HEIGHT);
});

document.addEventListener('click', function(event) {
	let mouseX = event.clientX;
	let mouseY = event.clientY;
	function button_frame(x0,y0,dx,dy) {
		if (mouseX >= x0 && mouseX <= (x0+dx) && mouseY >= y0 && mouseY <= (y0+dy)) {return true;}
		else {return false;}
	}
	
	// Button draw orbit
	if (button_frame(15,70,15,20)) {BUTTON.draw_ORBIT.switch();}
	
	// Button draw informations
	if (button_frame(15,95,15,20)) {BUTTON.draw_INFO.switch();}
	if (button_frame(35,115,15,20)) {
		BUTTON.draw_INFO.characteristics = !BUTTON.draw_INFO.characteristics;
		BUTTON.draw_INFO.draw();
	}
	if (button_frame(35,135,15,20)) {
		BUTTON.draw_INFO.elements = !BUTTON.draw_INFO.elements;
		BUTTON.draw_INFO.draw();
	}
	if (button_frame(35,155,15,20)) {
		BUTTON.draw_INFO.vector = !BUTTON.draw_INFO.vector;
		BUTTON.draw_INFO.draw();
	}
	
	// Legend for each planet
	check_coordinates(DATA);
	function check_coordinates() {
		DATA.forEach(function(element) {
			if (Math.abs(mouseX - element.x) < element.px_radius && Math.abs(mouseY - element.y) < element.px_radius) {
				element.legend = !element.legend;
			}
		});
	}
});

document.addEventListener('mousedown', function(event) {
	let mouseX = event.clientX;
	let mouseY = event.clientY;
	function button_frame(x0,y0,dx,dy) {
		if (mouseX >= x0 && mouseX <= (x0+dx) && mouseY >= y0 && mouseY <= (y0+dy)) {return true;}
		else {return false;}
	}
	
	// Rewind
	if (button_frame(BUTTON.draw_TIMELINE.rewind.X,BUTTON.draw_TIMELINE.rewind.Y,60,60)) {
		BUTTON.draw_TIMELINE.rewind.state = true;
		BUTTON.draw_TIMELINE.rewind.draw();
	}
	
	// Play && Pause
	if (button_frame(BUTTON.draw_TIMELINE.play_pause.X, BUTTON.draw_TIMELINE.play_pause.Y, 60, 60)) {
			BUTTON.draw_TIMELINE.play_pause.state = true;
			BUTTON.draw_TIMELINE.play_pause.draw();
		}
	
	// Stop
	if (button_frame(BUTTON.draw_TIMELINE.stop.X,BUTTON.draw_TIMELINE.stop.Y,60,60)) {
		BUTTON.draw_TIMELINE.stop.state = true;
		BUTTON.draw_TIMELINE.stop.draw();
	}
	
	// Fast forward
	if (button_frame(BUTTON.draw_TIMELINE.fast_forward.X,BUTTON.draw_TIMELINE.fast_forward.Y,60,60)) {
		BUTTON.draw_TIMELINE.fast_forward.state = true;
		BUTTON.draw_TIMELINE.fast_forward.draw();
	}
	
});

document.addEventListener('mouseup', function(event) {
	let mouseX = event.clientX;
	let mouseY = event.clientY;
	function button_frame(x0,y0,dx,dy) {
		if (mouseX >= x0 && mouseX <= (x0+dx) && mouseY >= y0 && mouseY <= (y0+dy)) {return true;}
		else {return false;}
	}
	
	// Rewind
	if (button_frame(BUTTON.draw_TIMELINE.rewind.X,BUTTON.draw_TIMELINE.rewind.Y,60,60)) {
		BUTTON.draw_TIMELINE.rewind.state = false;
		BUTTON.draw_TIMELINE.rewind.draw();
		if (TIME.dT == 0) {TIME.dT_memory *= 0.8;}
		else {TIME.dT *= 0.8;}
		
	}
	
	// Play && Pause
	if (button_frame(BUTTON.draw_TIMELINE.play_pause.X, BUTTON.draw_TIMELINE.play_pause.Y, 60, 60)) {
		BUTTON.draw_TIMELINE.play_pause.state = false;
		BUTTON.draw_TIMELINE.play_pause.switch();
		BUTTON.draw_TIMELINE.play_pause.draw();
		
	}
	
	// Stop
	if (button_frame(BUTTON.draw_TIMELINE.stop.X,BUTTON.draw_TIMELINE.stop.Y,60,60)) {
		BUTTON.draw_TIMELINE.stop.state = false;
		BUTTON.draw_TIMELINE.stop.draw();
		RUNNING = false;
		context_ORBIT.clearRect(0,0,WIDTH,HEIGHT);
		TIME.dT = - TIME.value;
		draw();
		RUNNING = true;
		TIME.dT = 0;
		draw();
		if (BUTTON.draw_TIMELINE.play_pause.pause) {
			BUTTON.draw_TIMELINE.play_pause.switch();
			BUTTON.draw_TIMELINE.play_pause.draw();
		}
		TIME.dT_memory = 3600;
	}
	
	// Fast forward
	if (button_frame(BUTTON.draw_TIMELINE.fast_forward.X,BUTTON.draw_TIMELINE.fast_forward.Y,60,60)) {
		BUTTON.draw_TIMELINE.fast_forward.state = false;
		BUTTON.draw_TIMELINE.fast_forward.draw();
		if (TIME.dT == 0) {TIME.dT_memory *= 1.25;}
		else {TIME.dT *= 1.25;}
	}
});
