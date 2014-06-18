/// <reference path="service.ts" />
/// <reference path="channelview.ts"/>
/// <reference path="touch.ts" />
/// <reference path="menu.ts" />

declare var settings;

//Wait til DOM load
function onLoad() {
    //Initialize channel view
    channelview.initialize();

    //Initialize touch events
    touch.initialize();

    //Retrieve service port & initialize service
    service.initialize();

    //Initialize settings menu
    menu.initialize();

    //remove listener, no longer needed
    window.removeEventListener("load", onLoad, false);
}

window.addEventListener("load", onLoad, false);