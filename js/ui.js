// DOM ELEMENTS
const helpMod   = document.getElementById("helpMod");

// CONST & VARIABLES
const helpMarginLeft    = 150;
const helpSlideDelay    = 50;
const helpSlideLag      = 150;
const helpSlideTime     = 250;
var lockedScenario	= document.getElementById('sat_demo');

// FUNCTIONS
function clamp(a,b,c){ 
    return ( (a<b) ? b : ( (a>c) ? c : a) ) 
}

function fadeIn(el, t0, dT) {
    el.style.visibility = 'visible';
    t0 += +new Date();
    let fade = function() {
        el.style.opacity = clamp((+new Date() - t0) / dT, 0, 0.8);
        if (el.style.opacity < 1) {
            (window.requestAnimationFrame && requestAnimationFrame(fade)) || setTimeout(fade,16);
        }
    }
    
    fade();
}
    
function fadeOut(el, t0, dT) {
    t0 += +new Date()
    let fade = function() {
        el.style.opacity = clamp(1 - (+new Date() - t0) / dT, 0, 1);
        if (el.style.opacity > 0) {
            (window.requestAnimationFrame && requestAnimationFrame(fade)) || setTimeout(fade,16);
        } else {
            el.style.visibility = "hidden";
        }
    }
    
    fade();
}

function slideLeft(el, t0, dT, margin_0, margin_1) {
    t0 += +new Date();
    let slide = function() {
        let marginLeft      = clamp(Math.round((margin_1 - margin_0) / dT * (+new Date() - t0) + margin_0), Math.min(margin_0, margin_1), Math.max(margin_0,margin_1));
        el.style.marginLeft = marginLeft.toString() + "px";
        if (el.style.marginLeft !== margin_1) {
            (window.requestAnimationFrame && requestAnimationFrame(slide)) || setTimeout(slide,16);
        }
    }
    
    slide();
}

function showHelp() {
    fadeIn(helpMod,  0,  500);
    fadeIn(helpMod.previousElementSibling, 0,  200);
    let title = helpMod.querySelectorAll("h1,h2,h3,h4,h5");
    for (let i=0 ; i < title.length ; i++) {
        title[i].style.marginLeft = helpMarginLeft.toString() + "px";
        slideLeft(title[i], helpSlideDelay + helpSlideLag * i, helpSlideTime, helpMarginLeft, 0);
    }
}

function hideHelp() {
    fadeOut(helpMod,     0,  200);
    fadeOut(helpMod.previousElementSibling,    0,  500);
}

function toggleRoll(el) {
	el.classList.toggle('rolled');
	el.classList.toggle('unrolled');
}

function setFocusOn(el) {
	FOCUS.setFocusByName(el.previousElementSibling.innerHTML);
}

function loadScenario(el) {
	// LOCK BUTT
	if (lockedScenario instanceof Element) {
		lockedScenario.classList.toggle('butt-locked');
	}
	el.classList.toggle('butt-locked');
	lockedScenario = el;
	
	// RESET ANIMATION WITH NEW SCENARIO
    cancelAnimationFrame(ANIMATION_REQUEST);
    _SCENARIO = el.id;
    Script.load(_SCENARIO, start);
}