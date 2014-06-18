/// <reference path="library/detectlinks.ts" />
/// <reference path="library/dom.ts" />

class logview {

    //#region Fields

    private static MAX_MOBILE_LOG = 100; //Per channel

    //#endregion

    //#region Methods

    static appendMessage(toChannel: string, server: string, sender: string, message: string) {
        //Find corresponding channel & check if message mentions user
        var isAction = message.charCodeAt(0) === 1 && message.substr(1).indexOf("ACTION") === 0,
            channel  = <HTMLElement>logview.findChannel(toChannel, server)[0];

        //If this is an /ME action, alter the message
        if (isAction) {
            message = sender + message.substr("ACTION".length + 1);
            sender  = null;
        }

        if (channel == null)
            console.error("Could not find channel", arguments);
        else {
            var nick        = settings["nick"],
                isMentioned = new RegExp(nick, "i").test(message);

            //Append message to logview
            var altClass = null;

            if (isAction)         altClass = "action";
            else if (isMentioned) altClass = "mention";

            var showAlert = logview.appendLog(channel, sender, message, altClass);

            if (showAlert) {
                //highlight menu item indicating new message
                var alertClass = isMentioned ? "alert" : "new",
                    menuItem   = channelview.findChannelMenu(toChannel, server);

                menuItem.classList.add(alertClass);
            }

            channelview.checkInactive(channel, toChannel, isMentioned, sender, message);
        }
    }

    static appendAll(sender: string, message: string, type?: string) {
        var channels = $('.channel-display');

        for (var i = 0, ii = channels.length; i < ii; ++i)
            logview.appendLog(<HTMLElement>channels[i], sender, message, type);
    }

    static appendLog(channel: HTMLElement, sender: string, message: string, type?: string): boolean {
        var logView   = <HTMLElement>channel.getElementsByClassName("logview")[0],
            showAlert = false;

        var now = new Date();
        var newMessage = _new("li")
            .attr("data-timestamp", now.toJSON())
            .attr("title", logview.formatDate(now));

        if (sender != null)
            newMessage.append(_new("a").attr("class", "user").nodeText(sender));

        if (type != null) {
            var types = type.split(" ");
            for (var i = 0; i < types.length; ++i)
                newMessage.classList.add(types[i]);
        }
        else
            logview.updateJoinPartVisibility(logView);


        newMessage.append(
            detectLinks(_new("div").attr("class", "message").nodeText(message))
        );

        //If this is the active channel
        if (channel.classList.contains("active")) {
            var nearBottom = logview.nearBottom(logView);
            logView.append(newMessage);

            //Prune log, if this is on mobile
            if (channelview.is_mobile)
                logview.pruneLog(logView);

            //scroll down if near the bottom
            if (nearBottom)
                logview.scrollToBottom(logView);
            else
                showAlert = true;
        }

        //Otherwise (not active channel)
        else {
            logView.append(newMessage);
            showAlert = true;

            //Prune log, if this is on mobile
            if (channelview.is_mobile)
                logview.pruneLog(logView);
        }

        return showAlert;
    }

    static switchChannel(channel: string, server: string, hashSwitch = false): HTMLElement {
        var activeChannel = logview.findActiveChannel(),
            channelMenu   = $("#channels li a"),
            nextChannel   = logview.findChannel(channel, server);

        //Do nothing
        if (nextChannel.length === 0)
            return;

        //Set active channel inactive, and next channel as active
        activeChannel.removeClass("active");
        nextChannel.addClass("active");

        logview.becomeActive(activeChannel[0]);
        logview.becomeInactive(new Date(), activeChannel[0]);
        logview.becomeActive(nextChannel[0]);

        //Scroll down
        logview.scrollToBottom();

        //Reset the channel menu
        for (var i = 0, ii = channelMenu.length; i < ii; ++i) {
            var elem = <HTMLElement>channelMenu[i];

            if (elem.innerText === channel)
                elem.classList.add("active");
            else
                elem.classList.remove("active");
        }

        //Store channel name in hash
        if (hashSwitch === false)
            window.location.hash = channel;

        channelview.evaluateActive(nextChannel[0]);

        return nextChannel[0];
    }

    static restoreChannel(channel: string) {
        if (channel == "")
            return null;

        //Switch channel
        logview.switchChannel(channel, null, true);
    }

    static becomeActive(channel?: HTMLElement) {
        var channels;

        if (channel != null)
            channels = [channel];
        else
            channels = logview.findActiveChannel();

        //Clear alerts on menu
        var menu = channelview.findChannelMenu(
            channels.attr("data-channel"),
            channels.attr("data-server")
        );

        menu.classList.remove("new");
        menu.classList.remove("alert");

        //Switch icon
        var icon  = <HTMLAnchorElement>$("link[rel=icon]")[0];
        icon.href = "/favicon.ico";
    }

    static becomeInactive(date: Date, channel?: HTMLElement) {
        var channels;

        if (channel != null)
            channels = [channel];
        else
            channels = $(".channel-display");

        //Clear 'last-read' for channels & record new last-read
        for (var i = 0, ii = channels.length; i < ii; ++i) {
            var channel  = <HTMLElement>channels[i],
                logview  = <HTMLElement>channel.getElementsByClassName("logview")[0],
                messages = logview.getElementsByTagName("li"),
                lastItem: HTMLElement;

            for (var j = 0, jj = messages.length; j < jj; ++j) {
                var timestamp = messages[j].attr("data-timestamp"),
                    pastDate = new Date(timestamp) < date;

                //Remove last-read
                if (pastDate) {
                    lastItem = <HTMLElement>messages[j];
                    lastItem.classList.remove("last-read");
                    continue;
                }

                break;
            }

            if (lastItem != null)
                lastItem.classList.add("last-read");
        }
    }

    static updateJoinPartVisibility(logview: HTMLElement) {
        //Find all joins & parts in the logview with class 'show'.
        var elements = logview.querySelectorAll(".join.show, .part.show");

        //Remove 'show' class from all join/parts
        for (var i = 0, ii = elements.length; i < ii; ++i)
            (<HTMLElement>elements[i]).classList.remove("show");
    }

    //#endregion

    //#region Utilities

    static pruneLog(log: HTMLElement) {
        var length = log.children.length;

        while (length > logview.MAX_MOBILE_LOG) {
            //Remove first child
            log.removeChild(log.children[0]);
            --length;
        }
    }

    static removeAfter(items: NodeListOf<HTMLElement>, seconds: number) {
        //Remove input elements after input seconds
        setTimeout(() => {
            items.remove();
        }, seconds * 1000);
    }

    static nearBottom(logView: HTMLElement) {
        var height       = logView.clientHeight,
            scollTop     = logView.scrollTop,
            scrollHeight = logView.scrollHeight,
            scrollBottom = scrollHeight - (scollTop + height);

        //Distance to bottom is < 150
        return scrollBottom < 150;
    }

    static scrollToBottom(logView?: HTMLElement) {
        if (logView === undefined)
            logView = <HTMLElement>logview.findActiveChannel(".logview")[0];

        //Scroll to bottom
        if (logView)
            logView.scrollTop = logView.scrollHeight;
    }

    static findChannels(server: string, subselect: string = null): NodeListOf<HTMLElement> {
        var selector = ".channel-display";

        if (server != null)
            selector += "[data-server='" + server + "']";

        if (subselect)
            selector += " " + subselect;

        return $(selector);
    }

    static findChannel(channel: string, server: string = null, subselect: string = null): NodeListOf<HTMLElement> {
        var selector = ".channel-display[data-channel='" + channel.toLowerCase() + "']";

        if (server != null)
            selector += "[data-server='" + server + "']"

        if (subselect)
            selector += " " + subselect;

        return $(selector);
    }

    static findActiveChannel(subselect: string = null) {
        if (subselect)
            return $(".channel-display.active " + subselect);
        return $(".channel-display.active");
    }

    static formatDate(date: Date) {
        return date.toLocaleTimeString() + " on "
             + date.toLocaleDateString();
    }

    //#endregion
}