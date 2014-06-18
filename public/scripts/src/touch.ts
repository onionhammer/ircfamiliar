/// <reference path="logview.ts" />
/// <reference path="library/dom.ts" />

class touch {

    static content: HTMLElement;

    static MIN_MOVE = 5;
    static MIN_SNAP = 15;

    static opened = true;
    static moved  = false;
    static startX = 0;
    static startY = 0;

    //#region Initialization

    static initialize() {
        //Find content, check mobile
        touch.content = $("#content.mobile")[0];

        if (!touch.content)
            return;

        var body = $("body");

        //Bind userlist events
        var ul_pattern = "#content:not(.shut) .userlist";
        body.on(ul_pattern, "touchstart", touch.onTouchStart);
        body.on(ul_pattern, "touchmove",  touch.onTouchMove);
        body.on(ul_pattern, "touchend",   e => touch.onTouchEnd(e, false));

        //Bind logview events
        var lv_pattern = "#content.shut .logview";
        body.on(lv_pattern, "touchstart", touch.onTouchStart);
        body.on(lv_pattern, "touchmove",  touch.onTouchMove);
        body.on(lv_pattern, "touchend",   e => touch.onTouchEnd(e, true));
    }

    //#endregion

    //#region Events

    static onTouchStart(e) {
        touch.startX = e.touches[0].clientX;
        touch.startY = e.touches[0].clientY;
        touch.moved  = false;
    }

    static onTouchMove(e) {
        var userList = touch.activeList();
        var deltaX   = touch.startX - e.touches[0].clientX;
        var deltaXA  = Math.abs(deltaX);
        var deltaY   = Math.abs(touch.startY - e.touches[0].clientY);
        var allow    = deltaXA > deltaY
                    && (deltaXA + deltaY) > touch.MIN_MOVE;

        touch.moved = allow && (deltaXA > touch.MIN_SNAP);

        if (userList && allow) {
            if (touch.opened == false) {
                var width = userList.clientWidth;
                deltaX -= width;
            }

            if (deltaX > 0) deltaX = 0;

            touch.content.classList.add("slide");
            userList.style.marginRight = deltaX + "px";
            e.preventDefault();
        }
        else
            userList.style.marginRight = null;
    }

    static onTouchEnd(e, open: boolean) {
        var userList = touch.activeList();
        userList.style.marginRight = null;
        touch.content.classList.remove("slide");

        if (touch.moved) {
            if (open)
                touch.content.classList.remove("shut");
            else
                touch.content.classList.add("shut");

            touch.opened = open;
            logview.scrollToBottom();
        }
    }

    //#endregion

    //#region Methods

    static activeList(): HTMLElement {
        return $(".active .userlist")[0];
    }

    //#endregion

}