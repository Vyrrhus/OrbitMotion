function draw() {
	CONTEXT.ANIMATION.clearRect(0,0,WIDTH,HEIGHT);
	
	planet_animation(DATA);
	TIME.value += TIME.dT;
	TIME.draw();
	FOCUS.planet.setFocus();
	planet_draw(DATA);
	
	if (RUNNING) {requestAnimationFrame(draw);}
}


function planet_animation() {
	DATA.forEach(function(element) {
		if (element.orbit != null) {
			element.orbit.motion(TIME.dT);
		}
	});
}

function planet_draw() {
	DATA.forEach(function(element) {
		element.draw();
	});
}


FOCUS.change(SUN);
draw();
