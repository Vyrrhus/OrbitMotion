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
		CONTROL.draw_ORBIT.switch();
	}
	if (event.keyCode === 32 || event.key === 'q') {
		PAUSE = !PAUSE;
		if (PAUSE) {
			TIME.dT_memory = TIME.dT;
			TIME.dT = 0;
		}
		else {
			TIME.dT = TIME.dT_memory;
		}
	}
	if (event.keyCode === 47) {TIME.dT *= -1;}
	if (event.key === '0') {
		RUNNING = false;
		TIME.dT = - TIME.value;
		context_ORBIT.clearRect(0,0,WIDTH,HEIGHT);
		draw();
		TIME.dT = 3600;
	}
});

document.addEventListener('wheel', function(event) {
	ZOOM.num += event.deltaY/100;
	if (ZOOM.num < 0 || ZOOM.num > 82) {
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
	if (event.clientX >= 15 && event.clientX <= 30 && event.clientY >= 70 && event.clientY <= 90) {
		CONTROL.draw_ORBIT.switch();
	}
});
