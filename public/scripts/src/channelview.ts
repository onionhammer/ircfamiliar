/// <reference path="logview.ts" />
/// <reference path="types.d.ts" />
/// <reference path="library/messagehistory.ts" />
/// <reference path="library/dom.ts" />
/// <reference path="library/idletimer.ts" />
/// <reference path="library/notifications.d.ts" />

//#region TCallback

interface TCallback {
    (message: string, server: string, channel: string);
}
//#endregion

class channelview {

    //#region Fields

    private static IDLE_TIME = 30;

    static popped              = 0;
    static supports_touch      = false;
    static is_mobile           = false;
    static show_notifications  = false;
    static websocket_connected = false;
    static history: messagehistory<string>;

    //#endregion

    //#region Callbacks

    private static sendMessage: TCallback;

    //#endregion

    //#region Initialization

    static initialize() {

        //Check for mobile/touch support
        channelview.supports_touch = "ontouchstart" in window;
        channelview.is_mobile = document.getElementById("content").classList.contains("mobile");

        //Restore hashed channel
        logview.restoreChannel(window.location.hash);

        //Set focus on chatbox
        if (channelview.focusChat(false) === false)
            return;

        //Scroll active channel to bottom
        logview.scrollToBottom();

        //Detect user click on channel menu
        $("#channels")
            .on("li a", "click", e => channelview.onChangeChannel(e));

        //Detect 'return' on chatbox
        $("#chatbox")
            .bind("keypress", e => channelview.onReturn(e))
            .bind("keydown", e => channelview.onChatBoxKey(e));

        //Double clicks on users
        $("#content")
            .on("li a.user", "dblclick", e => channelview.onUserClicked(e));

        //Detect keypresses
        document.body
            .bind("keydown", e => channelview.onArrows(e));

        //Detect window size change
        window.addEventListener("resize", e => channelview.onWindowResized(e));

        //Detect window pop history
        window.addEventListener("popstate", e => channelview.onHistoryChanged(e));

        //Spin up idle timer
        timer.initialize(
            channelview.IDLE_TIME,
            logview.becomeInactive, //User was idle
            logview.becomeActive    //User was active
        );

        //Initialize history
        channelview.history = new messagehistory<string>();
    }

    static setMessageCallback(onSendMessage: TCallback) {
        //Bind callback(s)
        channelview.sendMessage = onSendMessage;
    }

    //#endregion

    //#region Events

    private static onChangeChannel(e) {
        var target  = e.eventTarget,
            channel = <string>target.innerText,
            server  = target.attr("data-server");

        //Switch active channel
        logview.switchChannel(channel, server);
    }

    private static onReturn(e) {
        if (e.keyCode !== 13)
            return;

        var message = e.eventTarget.value,
            active  = logview.findActiveChannel()[0];

        if (message !== "" && active) {
            var channel = active.attr("data-channel"),
                server  = active.attr("data-server");

            channelview.sendMessage(message, server, channel);
            e.eventTarget.value = "";

            //Record message
            channelview.history.add(message);
        }
    }

    private static onArrows(e: KeyboardEvent) {
        
        //Navigate left/right channel
        var direction = 0;
        var other     = false;
        var chatBox   = <HTMLInputElement>document.getElementById("chatbox");

        switch (<number>e.keyCode) {
            case 37: direction = -1; break;
            case 39: direction = +1; break;
            default:
                //Check for other keys
                other = true;
                break;
        }

        if (direction === 0) {
            //If the chatbox is not focused and input is not an arrow key,
            //focus on the chatbox
            if (other && document.activeElement !== chatBox)
                chatBox.focus();

            return;
        }

        var hasInput = chatBox.value !== "";

        if (e.ctrlKey === false || hasInput === true)
            return;

        var items = $("#channels li"),
            nextChannel = 0;

        for (var i = 0, ii = items.length; i < ii; ++i) {

            var item = items[i],
                a = item.getElementsByTagName("a")[0];

            if (a.classList.contains("active")) {
                nextChannel = i + direction;

                //Switch channel
                if (nextChannel >= 0 && nextChannel <= items.length - 1) {

                    var channelElem = <HTMLElement>items[nextChannel].getElementsByTagName("a")[0],
                        channel     = channelElem.nodeText().trim(),
                        server      = channelElem.attr("data-server");

                    logview.switchChannel(channel, server);
                    $("#chatbox")[0].focus();
                }

                return;
            }
        }
    }

    private static onChatBoxKey(e) {
        switch (<number>e.keyCode) {
            case 38: //UP-ARROW
                //Retrieve last message
                var text = channelview.history.up();
                if (text) e.eventTarget.value = text;
                e.preventDefault();
                break;

            case 40: //DOWN-ARROW
                //Retrieve next message
                e.eventTarget.value = channelview.history.down() || "";
                e.preventDefault();
                break;
        }
    }

    private static onUserClicked(e) {
        var target = e.eventTarget,
            name = <string>target.innerText;

        //Inject name into chatbox
        var chatBox = <HTMLInputElement>document.getElementById("chatbox");

        if (chatBox.value.length !== 0)
            chatBox.value += " ";

        chatBox.value += name + " ";
        chatBox.focus();
        e.preventDefault();
    }

    private static onWindowResized(e) {
        //Scroll to bottom of active view
        var activeChannel = <HTMLElement>logview.findActiveChannel(".logview")[0];

        if (activeChannel != null)
            logview.scrollToBottom(activeChannel);
    }

    private static onHistoryChanged(e) {
        //Some browsers pop history when page loads
        if (!channelview.popped && !channelview.popped++) return;

        var channel = window.location.hash;

        if (channel === "") {
            //Retrieve first channel
            var first = $("#channels li a")[0];

            if (first != null)
                channel = first.innerText.trim();
        }

        logview.restoreChannel(channel);
    }

    //#endregion

    //#region Methods

    static evaluateActive(nextChannel: HTMLElement) {
        //Check if there are active users
        var chatbox  = <HTMLElement>$("#chatbox")[0],
            userList = <HTMLElement>nextChannel.getElementsByClassName("userlist")[0],
            users    = userList.getElementsByTagName("li");

        //Focus chatbox if there are any users
        if (users.length !== 0) {
            channelview.toggleConnected(true);

            //If this is a touch screen, only focus if chatbox was already focused
            if (channelview.supports_touch === false || channelview.guessKeyboardUp())
                chatbox.focus();
        }
        else
            channelview.toggleConnected(false);
    }

    static joinChannel(channelName: string, server: string): HTMLElement {
        //Try to find channel
        var channelDisplay = <HTMLElement>logview.findChannel(channelName, server)[0];

        //Put channel name in lower-case
        channelName = channelName.toLowerCase();

        if (channelDisplay != null || channelName[0] !== "#")
            return;

        //Channel does not exist, create it
        channelDisplay = _new("div")
            .attr("class", "channel-display")
            .attr("data-channel", channelName)
            .attr("data-server", server)
            .append(_new("ul").attr("class", "logview"))
            .append(_new("ul").attr("class", "userlist"));

        $("#content")[0].prepend(channelDisplay);

        //Add channel to menu
        $("#channels")[0].append(
            _new("li").append(
                _new("a").attr("data-server", server).nodeText(channelName)
            )
        );

        //Switch to channel
        logview.switchChannel(channelName, server);

        return channelDisplay;
    }

    static leaveChannel(channelName: string, server: string) {
        //Try to find channel
        var channelDisplay = <HTMLElement>logview.findChannel(channelName, server)[0];

        if (channelDisplay == null || channelName[0] !== "#")
            return;

        //Switch to prev channel in menu (if one exists)
        var prevChannel = <HTMLElement>channelDisplay.previousElementSibling;

        if (channelDisplay.classList.contains("active")) {
            var otherNodes = channelDisplay.parentElement.childNodes;
            for (var i = 0, ii = otherNodes.length; i < ii; ++i) {
                var node = <HTMLElement>otherNodes[i];
                if (   node.nodeType === 1
                    && node.classList.contains("channel-display")
                    && node.classList.contains("active") === false) {
                    //Other channel found, switch to it
                    logview.switchChannel(
                        node.attr("data-channel"),
                        node.attr("data-server"));

                    break;
                }
            }
        }

        //Remove channel's parent
        channelDisplay.remove();

        //Remove channel from menu
        channelview.findChannelMenu(channelName, server)
            .parentElement.remove();
    }

    static updateUserNick(onServer: string, curNick: string, newNick: string) {
        var users    = logview.findChannels(onServer, ".userlist li"),
            channels = logview.findChannels(onServer);

        //Iterate through users
        for (var i = 0, ii = users.length; i < ii; ++i) {
            var userElem = <HTMLElement>users[i];

            if (userElem.nodeText().trim() === curNick)
                userElem.empty().append(
                    channelview.makeUserLI(newNick)
                );
        }

        var message;

        if (settings["nick"] === curNick) {
            message = "Nickname changed to " + newNick;
            settings["nick"] = newNick;
        }
        else
            message = curNick + " is now known as " + newNick;

        //Iterate through channels
        for (var i = 0, ii = channels.length; i < ii; ++i)
            logview.appendLog(channels[i], null, message, "join show");
    }

    static quitUser(fromServer: string, nick: string) {
        var channels = logview.findChannels(fromServer);

        for (var i = 0, ii = channels.length; i < ii; ++i)
            channelview.removeUser(null, fromServer, nick, <HTMLElement>channels[i], true);
    }

    static removeUser(fromChannel: string, server: string, nick: string, channel: HTMLElement = null, quit = false) {
        if (nick === settings["nick"]) {
            channelview.leaveChannel(fromChannel, server);
            return;
        }

        if (channel == null)
            channel = <HTMLElement>logview.findChannel(fromChannel, server)[0];

        var userList = <HTMLElement>channel.getElementsByClassName("userlist")[0],
            users    = userList.getElementsByTagName("li");

        //Remove user
        for (var i = 0, ii = users.length; i < ii; ++i) {
            var userElement = users[i];

            if (userElement.nodeText().trim() === nick) {
                userElement.remove();

                //Log the user leaving
                logview.appendLog(channel, null,
                    nick + " has " + (quit ? "quit" : "left"), "part show"
                );
                break;
            }
        }
    }

    static updateUsers(toChannel: string, server: string, nicks: string[]) {
        var channel  = <HTMLElement>logview.findChannel(toChannel, server)[0],
            userList = <HTMLElement>channel.getElementsByClassName("userlist")[0];

        //Clear out current users
        userList.empty();

        //Sort nicks
        nicks.sort(channelview.sortStrings);

        //Add in new list of users
        for (var i = 0, ii = nicks.length; i < ii; ++i) {
            userList.append(
                channelview.makeUserLI(nicks[i])
            );
        }

        //Check toggle connected
        if (channel.classList.contains("active"))
            channelview.toggleConnected(nicks.length !== 0);
    }

    static addUser(toChannel: string, server: string, nick: string) {
        var channel = <HTMLElement>logview.findChannel(toChannel, server)[0];

        if (channel == null)
            channel = channelview.joinChannel(toChannel, server);

        var userList  = <HTMLElement>channel.getElementsByClassName("userlist")[0],
            users     = userList.getElementsByTagName("li"),
            newLI     = channelview.makeUserLI(nick),
            userAdded = false,
            lowerNick = nick.toLowerCase();

        //Insert new LI
        for (var i = 0, ii = users.length; i < ii; ++i) {
            var itemNick = users[i].nodeText().trim().toLowerCase();

            if (lowerNick === itemNick)
                return;

            if (lowerNick < itemNick) {
                //Insert before & notify of user joined
                userList.insertBefore(newLI, users[i]);
                userAdded = true;
                break;
            }
        }

        //Add to end
        if (userAdded === false)
            userList.append(newLI);

        //If the user being added is the current user, unlock chat
        if (settings["nick"] === nick) {
            channelview.focusChat(true);
            logview.appendLog(channel, null, "Connected", "join show");

            //Remove MOTD after 2 seconds
            var motd = $('.logview .motd');
            logview.removeAfter(motd, 2);
        }
        else //Notify of user joined
            logview.appendLog(channel, null, nick + " has joined", "join show");
    }

    static setWebsocketConnected(connected: boolean) {
        var wasConnected = channelview.websocket_connected;
        channelview.websocket_connected = connected;

        //Clear userlists
        if (wasConnected == true && connected == false) {
            $(".userlist").empty();
            channelview.toggleConnected(false);
        }
        else if (connected == true) {
            var activeChannel = logview.findActiveChannel();

            if (activeChannel.length !== 0)
                channelview.evaluateActive(activeChannel[0]);
        }
    }

    static toggleConnected(connectedIRC: boolean) {
        var enable = connectedIRC && channelview.websocket_connected;

        //Enable or disable the form based on the input connected state
        $("#chatbox").attr("disabled", enable ? null : "disabled");
    }

    static swapChannelView(newChannelViewHTML: string) {
        //Build up new document fragment
        var tmp       = document.createElement("body"),
            container = <HTMLElement>$("#content")[0],
            active    = <HTMLElement>logview.findActiveChannel()[0],
            channel, server;

        if (active) {
            channel = active.attr("data-channel");
            server  = active.attr("data-server");
        }

        //Put new HTML into temporary node
        tmp.innerHTML = newChannelViewHTML;

        //Update settings
        var settingsElem = tmp.getElementsByTagName("script")[0];
        settings = JSON.parse(settingsElem.nodeText());
        settingsElem.remove();

        //Remove old channels
        $('.channel-display').remove();

        //Add new channels
        container.prepend(tmp.children);

        if (channel && server)
            logview.switchChannel(channel, server, true);

        //Unlock chat if there are any users
        if ($(".channel-display.active .userlist li").length > 0)
            channelview.toggleConnected(true);

        //Re-build menu
        channelview.rebuildMenu();

        delete tmp;
    }

    private static rebuildMenu() {
        var channelsList = $("#channels")[0];

        if (channelsList == null)
            return;

        //Clear out existing
        channelsList.empty();

        var allChannels = logview.findChannels(null);

        for (var i = 0, ii = allChannels.length; i < ii; ++i) {
            var channelPane = <HTMLElement>allChannels[i],
                channel     = channelPane.attr("data-channel"),
                server      = channelPane.attr("data-server"),
                isActive    = channelPane.classList.contains("active");

            var a = _new("a")
                .attr("data-server", server)
                .nodeText(channel);

            if (isActive)
                a.attr("class", "active");

            channelsList.prepend(_new("li").append(a));
        }
    }

    //#region Helpers

    static checkInactive(channel: HTMLElement, channelName: string,
        wasMentioned: boolean, sender: string, message: string) {
        //If user is active, do nothing
        if (wasMentioned && timer.isUserActive === false) {
            //If the user has not been active, try to get their attention

            //Change or flash favicon?
            var icon = <HTMLAnchorElement>$("link[rel=icon]")[0];
            icon.href = "/favicon_on.ico";

            //Send a notification
            if (channelview.show_notifications) {
                //Create a notification
                var msgInfo = sender ? sender + " on " : "";

                var notification = window.webkitNotifications.createNotification(
                    "/favicon_on.png", msgInfo + channelName, message
                );

                notification.onclick = () => {
                    //Focus window & switch channel
                    window.focus();
                    logview.switchChannel(channelName, channel.attr("data-server"), true);

                    //Cancel notification
                    notification.cancel();
                };

                //Show notification, then hide after 5 seconds
                notification.show();
                setTimeout(() => notification.cancel(), 5000);
            }
        }
    }

    static makeUserLI(nick: string): HTMLElement {

        var mod = false;

        switch (nick[0]) {
            case '~': case '&': case '@': case '%': case '+':
                nick = nick.substr(1);
                mod = true;
                break;
        }

        return _new("li").append(
            _new("a").attr("class", "user" + (mod ? " mod" : "")).nodeText(nick)
        );
    }

    static findChannelMenu(channel: string, server: string): HTMLElement {
        var matches = $(
            "#channels a[data-server='" + server + "']"
        );

        for (var i = 0, ii = matches.length; i < ii; ++i) {
            if (matches[i].innerText === channel.toLowerCase())
                return matches[i];
        }

        throw "Channel not found";
    }

    private static focusChat(unlock: boolean) : boolean {
        var chatBox = $('#chatbox')[0];
        if (chatBox != null) {
            chatBox.focus();

            if (unlock)
                channelview.toggleConnected(true);

            return true;
        }

        return false;
    }

    private static guessKeyboardUp(): boolean {
        return window.innerHeight < window.innerWidth;
    }

    private static sortStrings(a: string, b: string): number {
        var aL = a.toLowerCase(),
            bL = b.toLowerCase();

        if (aL < bL) return -1;
        if (aL > bL) return 1;
        return 0;
    }

    //#endregion

    //#endregion
}