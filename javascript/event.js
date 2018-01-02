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
	if (event.key === '7') {FOCUS.change(SATURNE);}
	if (event.key === '8') {FOCUS.change(URANUS);}
	if (event.key === '9') {FOCUS.change(NEPTUNE);}
	if (event.key === 'a') {
		BUTTON.draw_ORBIT.switch();
	}
	if (event.keyCode === 32 || event.key === 'q') {
		BUTTON.draw_TIMELINE.switch();
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
	if (ZOOM.num < 0 || ZOOM.num > 85) {
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
	
	// Legend for each planet
	check_coordinates(DATA);
	function check_coordinates() {
		DATA.forEach(function(element) {
			if (Math.abs(mouseX - element.x) < element.px_radius && Math.abs(mouseY - element.y) < element.px_radius) {
				element.legend = !element.legend;
			}
		});
	}
	
	// Timeline buttons
	if (button_frame(WIDTH/2-160,HEIGHT-100,80,80)) {TIME.dT*=0.8;}
	if (button_frame(WIDTH/2-80,HEIGHT-100,80,80)) {BUTTON.draw_TIMELINE.switch();}
	if (button_frame(WIDTH/2,HEIGHT-100,80,80)) {
		RUNNING = false;
		TIME.dT = - TIME.value;
		context_ORBIT.clearRect(0,0,WIDTH,HEIGHT);
		draw();
		TIME.dT = 3600;
		RUNNING = true;
		draw();
		BUTTON.draw_TIMELINE.switch();
	}
	if (button_frame(WIDTH/2+80,HEIGHT-100,80,80)) {TIME.dT*=1.25;}
	if (button_frame(WIDTH/2-120,HEIGHT-140,40,40)) {
		FOCUS.num -=1;
		if (FOCUS.num < 0) { FOCUS.num = DATA.length - 1;}
		FOCUS.change(DATA[FOCUS.num]);
	}
	if (button_frame(WIDTH/2+80,HEIGHT-140,40,40)) {
		FOCUS.num +=1;
		if (FOCUS.num == DATA.length) { FOCUS.num = 0;}
		FOCUS.change(DATA[FOCUS.num]);
	}
});
