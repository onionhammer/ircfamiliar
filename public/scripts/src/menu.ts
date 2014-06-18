/// <reference path="channelview.ts" />
/// <reference path="library/dom.ts" />

class menu {

    //#region Fields

    static visible = false;

    //#endregion

    //#region Initialization

    static initialize() {
        $("#settings").bind("click", e => menu.onSettingsToggled(e));

        //Bind notification button
        if ("webkitNotifications" in window)
            menu.initializeNotifications();

        //Bind theme button
        menu.initializeTheme();

        //Bind toggle statuses button
        menu.initializeShowStatus();
    }

    //#endregion

    //#region Events

    private static onSettingsToggled(e: any) {
        //Toggle setting buttons
        menu.visible = !menu.visible;

        var show      = menu.visible,
            settings  = <HTMLElement>$("#settings")[0],
            menuItems = $("header a.menu-item");

        if (show)
            settings.classList.add("on");
        else
            settings.classList.remove("on");

        for (var i = 0, ii = menuItems.length; i < ii; ++i) {
            var item = <HTMLElement>menuItems[i];

            if (item.classList.contains("disabled"))
                item.attr("style", "display: none");
            else
                item.attr("style", "display: " + (show ? "inline":"none"));
        }
    }

    private static onNotificationToggled(e: any) {
        var button = <HTMLElement>e.eventTarget;
        if (channelview.show_notifications === true) {
            //Disable notifications
            channelview.show_notifications = false;
            button.nodeText("show notifications");
            button.classList.remove("on");
            localStorage["show-notifications"] = false;
        }
        else {
            //Request notifications
            window.webkitNotifications.requestPermission(function () { });
            channelview.show_notifications = window.webkitNotifications.checkPermission() === 0;

            if (channelview.show_notifications === true) {
                button.nodeText("hide notifications");
                button.classList.add("on");
                localStorage["show-notifications"] = true;
            }
        }
    }

    private static onThemeToggled(e: any) {
        var button = <HTMLElement>e.eventTarget;
        var isDark = button.classList.contains("on");

        if (isDark) {
            document.body.classList.remove("dark");
            button.classList.remove("on");
            button.nodeText("night mode");
        }
        else {
            document.body.classList.add("dark");
            button.classList.add("on");
            button.nodeText("day mode");
        }

        //Store preference
        localStorage["night-mode"] = !isDark;
    }

    private static onShowStatusToggled(e: any) {
        var button = <HTMLElement>e.eventTarget;
        var hideStatuses = button.classList.contains("on");

        if (hideStatuses) {
            document.body.classList.remove("hide-statuses");
            button.classList.remove("on");
            button.nodeText("hide joins/parts");
        }
        else {
            document.body.classList.add("hide-statuses");
            button.classList.add("on");
            button.nodeText("show joins/parts");
        }

        //Store preference
        localStorage["hide-statuses"] = !hideStatuses;
    }

    //#endregion

    //#region Methods

    private static initializeNotifications() {
        //Check if notifications are allowed
        channelview.show_notifications = window.webkitNotifications.checkPermission() === 0
        && (localStorage["show-notifications"] || "true") === "true";

        var button = <HTMLElement>$("#notifications")[0];

        button.classList.remove("disabled");

        if (channelview.show_notifications === true) {
            button.nodeText("hide notifications");
            button.classList.add("on");
        }

        button.bind("click", e => menu.onNotificationToggled(e));
    }

    private static initializeTheme() {
        var button = <HTMLElement>$("#theme")[0];
        button.bind("click", e => menu.onThemeToggled(e));

        //Check local storage settings to get theme preference
        if (localStorage["night-mode"] == "true")
            menu.onThemeToggled({ eventTarget: button });
    }

    private static initializeShowStatus() {
        var button = <HTMLElement>$("#toggle-statuses")[0];
        button.bind("click", e => menu.onShowStatusToggled(e));

        //Check local storage settings to get show-status preference
        if (localStorage["hide-statuses"] == "true")
            menu.onShowStatusToggled({ eventTarget: button });
    }

    //#endregion
}