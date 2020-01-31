// DOM ELEMENTS
const helpOut   = document.getElementById("helpBackground");
const helpIn    = document.getElementById("helpInner");
const scenButt  = document.getElementById("scenarioButt");
const scenList  = document.getElementById("list");

// VARIABLES
const helpMarginLeft    = 150;
const helpSlideDelay    = 50;
const helpSlideLag      = 150;
const helpSlideTime     = 250;

// FUNCTIONS

function fadeIn(el, time) {
    el.style.opacity = 0;
    el.style.display = "block";
    
    let title = el.querySelectorAll("h1,h2,h3,h4,h5");
    for (let i=0 ; i < title.length ; i++) {
        title[i].style.marginLeft = helpMarginLeft.toString() + "px";
    }
    
    let last = +new Date();
    let fade = function() {
        el.style.opacity = +el.style.opacity + (new Date() - last) / time;
        last = +new Date();
        
        if (el.style.opacity < 1) {
            (window.requestAnimationFrame && requestAnimationFrame(fade)) || setTimeout(fade,16);
        }
    };
    let slide = function(el, delay, time, margin) {
        
        let begin = +new Date();
        let tick = function() {
            if (new Date() - begin > delay) {
                let value = Math.round(margin * (1 - (new Date() - begin - delay) / time))
                el.style.marginLeft = value.toString() + "px";
                
                if (value > 0) {
                    (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick,16);
                }
            } else {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick,16);
            }
        }
        tick();
    }
    
    fade();
    for (let i=0 ; i < title.length ; i++) {
        slide(title[i], helpSlideDelay + i * helpSlideLag, helpSlideTime, helpMarginLeft);
    }
}

function fadeOut(el, time) {
    let last = +new Date();
    let fade = function() {
        el.style.opacity = +el.style.opacity - (new Date() - last) / time;
        last = +new Date();
        
        if (el.style.opacity > 0) {
            (window.requestAnimationFrame && requestAnimationFrame(fade)) || setTimeout(fade,16);
        } else {
            let title = el.querySelectorAll("h1,h2,h3,h4,h5");
            el.style.display = "none";
        }
    }
    
    fade();
}

function showHelp() {
    fadeIn(helpIn,      500);
    fadeIn(helpOut,     200);
}

function hideHelp() {
    fadeOut(helpIn,     200);
    fadeOut(helpOut,    500);
}

function loadScenario(name) {
    cancelAnimationFrame(ANIMATION_REQUEST);
    _SCENARIO = name;
    Script.load(_SCENARIO, start);
}

// EVENTS
scenButt.addEventListener('mouseenter', function(event){
    fadeIn(scenList, 200);
});
scenButt.addEventListener('mouseleave', function(event) {
    fadeOut(scenList, 150);
});