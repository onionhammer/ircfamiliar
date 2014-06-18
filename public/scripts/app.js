function ajax(path, data, callback, method) {
    if (typeof method === "undefined") { method = "POST"; }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState !== 4)
            return;

        callback({
            code: xhr.status,
            data: xhr.responseText
        });
    };

    xhr.open(method, path, true);
    xhr.send(data);
}
function detectLinks(inElement) {
    var urlRegex = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, text = inElement.innerHTML;

    inElement.innerHTML = text.replace(urlRegex, function (url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });

    return inElement;
}
//ref: https://github.com/bndr/fasterDOM.js/blob/master/fasterDOM.js
//Create basic $('pattern') finder
function $(selector) {
    return document.querySelectorAll(selector);
}

function _new(tag) {
    return document.createElement(tag);
}

var _dom;
(function (_dom) {
    //#region Helpers
    ///Check if node matches pattern
    function _findUp(parent, list, item) {
        for (var i = 0, ii = list.length; i < ii; ++i) {
            if (list[i] === item)
                return item;
        }

        var immediate = item.parentElement;

        if (immediate === parent)
            return null;
        if (immediate !== null)
            return _findUp(parent, list, immediate);

        return null;
    }

    //#endregion
    //#region DOM Events
    ///Bind event to element
    Object.prototype.bind = function (eventName, callback) {
        if (this.length !== undefined) {
            for (var i = 0, ii = this.length; i < ii; ++i) {
                this[i].addEventListener(eventName, function (e) {
                    e["eventTarget"] = this;
                    callback.call(this, e);
                });
            }
        } else {
            this.addEventListener(eventName, function (e) {
                e["eventTarget"] = this;
                callback.call(this, e);
            });
        }

        return this;
    };

    ///Bind event to element's children
    Object.prototype.on = function (pattern, eventName, callback) {
        for (var i = 0, ii = this.length; i < ii; ++i) {
            var element = this[i];

            element.addEventListener(eventName, function (e) {
                //Check if this element matches pattern
                var matched = _findUp(element, $(pattern), e.srcElement);

                if (matched !== null) {
                    e["eventTarget"] = matched;
                    callback.call(matched, e);
                }
            });
        }
    };

    //#endregion
    //#region DOM Manipulation
    ///Get or set attribute on object
    Object.prototype.attr = function (name, value) {
        if (this.length === undefined) {
            if (value === undefined)
                return this.getAttribute(name);
else {
                if (value === null)
                    this.removeAttribute(name);
else
                    this.setAttribute(name, value);
            }
        } else {
            for (var i = 0, ii = this.length; i < ii; ++i) {
                if (value === undefined)
                    return this[i].getAttribute(name);
else {
                    if (value === null)
                        this[i].removeAttribute(name);
else
                        this[i].setAttribute(name, value);
                }
            }
        }

        return this;
    };

    ///Get or set css on object
    Object.prototype.css = function () {
        var obj = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            obj[_i] = arguments[_i + 0];
        }
        for (var i = 0, ii = this.length; i < ii; ++i) {
            var element = this[i];

            if (obj.length > 1)
                element.style[obj[0]] = obj[1];
else if (typeof obj[0] === "string")
                return element.style[obj[0]];
else {
                for (var key in obj[0])
                    element.style[key] = obj[0][key];
            }
        }

        return this;
    };

    ///Remove class from elements
    Object.prototype.removeClass = function (className) {
        for (var i = 0, ii = this.length; i < ii; ++i)
            this[i].classList.remove(className);
        return this;
    };

    ///Add class to elements
    Object.prototype.addClass = function (className) {
        for (var i = 0, ii = this.length; i < ii; ++i)
            this[i].classList.add(className);
        return this;
    };

    ///Insert element(s) after node
    Object.prototype.insertAfter = function (node) {
        if (this.length !== undefined)
            for (var i = 0, ii = this.length; i < ii; ++i)
                node.parentElement.insertBefore(this[i], node.nextSibling);
else
            node.parentElement.insertBefore(this, node.nextSibling);
    };

    ///Append element(s) to bottom of node
    Object.prototype.append = function (node) {
        if (node.length !== undefined)
            for (var i = 0, ii = node.length; i < ii; ++i)
                this.appendChild(node[i]);
else
            this.appendChild(node);

        return this;
    };

    ///Prepend element(s) to top of node
    Object.prototype.prepend = function (node) {
        if (node.item !== undefined) {
            while (node.length)
                this.insertBefore(node[0], this.firstChild);
        } else if (node.length !== undefined)
            for (var i = 0, ii = node.length; i < ii; ++i)
                this.insertBefore(node[i], this.firstChild);
else
            this.insertBefore(node, this.firstChild);

        return this;
    };

    ///Remove element(s)
    Object.prototype.remove = function () {
        if (this.length !== undefined)
            for (var i = 0, ii = this.length; i < ii; ++i)
                this[i].parentNode.removeChild(this[i]);
else
            this.parentNode.removeChild(this);
    };

    ///Get node inner text
    Object.prototype.nodeText = function (text) {
        if (text === undefined)
            return this.innerText;

        this.innerText = text;
        return this;
    };

    Object.prototype.empty = function () {
        if (this.length !== undefined) {
            for (var i = 0, ii = this.length; i < ii; ++i)
                this[i].innerHTML = "";
        } else
            this.innerHTML = "";

        return this;
    };
})(_dom || (_dom = {}));
/// <reference path="library/detectlinks.ts" />
/// <reference path="library/dom.ts" />
var logview = (function () {
    function logview() {
    }
    logview.appendMessage = //#endregion
    //#region Methods
    function (toChannel, server, sender, message) {
        //Find corresponding channel & check if message mentions user
        var isAction = message.charCodeAt(0) === 1 && message.substr(1).indexOf("ACTION") === 0, channel = logview.findChannel(toChannel, server)[0];

        if (isAction) {
            message = sender + message.substr("ACTION".length + 1);
            sender = null;
        }

        if (channel == null)
            console.error("Could not find channel", arguments);
else {
            var nick = settings["nick"], isMentioned = new RegExp(nick, "i").test(message);

            //Append message to logview
            var altClass = null;

            if (isAction)
                altClass = "action";
else if (isMentioned)
                altClass = "mention";

            var showAlert = logview.appendLog(channel, sender, message, altClass);

            if (showAlert) {
                //highlight menu item indicating new message
                var alertClass = isMentioned ? "alert" : "new", menuItem = channelview.findChannelMenu(toChannel, server);

                menuItem.classList.add(alertClass);
            }

            channelview.checkInactive(channel, toChannel, isMentioned, sender, message);
        }
    };

    logview.appendAll = function (sender, message, type) {
        var channels = $('.channel-display');

        for (var i = 0, ii = channels.length; i < ii; ++i)
            logview.appendLog(channels[i], sender, message, type);
    };

    logview.appendLog = function (channel, sender, message, type) {
        var logView = channel.getElementsByClassName("logview")[0], showAlert = false;

        var now = new Date();
        var newMessage = _new("li").attr("data-timestamp", now.toJSON()).attr("title", logview.formatDate(now));

        if (sender != null)
            newMessage.append(_new("a").attr("class", "user").nodeText(sender));

        if (type != null) {
            var types = type.split(" ");
            for (var i = 0; i < types.length; ++i)
                newMessage.classList.add(types[i]);
        } else
            logview.updateJoinPartVisibility(logView);

        newMessage.append(detectLinks(_new("div").attr("class", "message").nodeText(message)));

        if (channel.classList.contains("active")) {
            var nearBottom = logview.nearBottom(logView);
            logView.append(newMessage);

            if (channelview.is_mobile)
                logview.pruneLog(logView);

            if (nearBottom)
                logview.scrollToBottom(logView);
else
                showAlert = true;
        } else {
            logView.append(newMessage);
            showAlert = true;

            if (channelview.is_mobile)
                logview.pruneLog(logView);
        }

        return showAlert;
    };

    logview.switchChannel = function (channel, server, hashSwitch) {
        if (typeof hashSwitch === "undefined") { hashSwitch = false; }
        var activeChannel = logview.findActiveChannel(), channelMenu = $("#channels li a"), nextChannel = logview.findChannel(channel, server);

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

        for (var i = 0, ii = channelMenu.length; i < ii; ++i) {
            var elem = channelMenu[i];

            if (elem.innerText === channel)
                elem.classList.add("active");
else
                elem.classList.remove("active");
        }

        if (hashSwitch === false)
            window.location.hash = channel;

        channelview.evaluateActive(nextChannel[0]);

        return nextChannel[0];
    };

    logview.restoreChannel = function (channel) {
        if (channel == "")
            return null;

        //Switch channel
        logview.switchChannel(channel, null, true);
    };

    logview.becomeActive = function (channel) {
        var channels;

        if (channel != null)
            channels = [channel];
else
            channels = logview.findActiveChannel();

        //Clear alerts on menu
        var menu = channelview.findChannelMenu(channels.attr("data-channel"), channels.attr("data-server"));

        menu.classList.remove("new");
        menu.classList.remove("alert");

        //Switch icon
        var icon = $("link[rel=icon]")[0];
        icon.href = "/favicon.ico";
    };

    logview.becomeInactive = function (date, channel) {
        var channels;

        if (channel != null)
            channels = [channel];
else
            channels = $(".channel-display");

        for (var i = 0, ii = channels.length; i < ii; ++i) {
            var channel = channels[i], logview = channel.getElementsByClassName("logview")[0], messages = logview.getElementsByTagName("li"), lastItem;

            for (var j = 0, jj = messages.length; j < jj; ++j) {
                var timestamp = messages[j].attr("data-timestamp"), pastDate = new Date(timestamp) < date;

                if (pastDate) {
                    lastItem = messages[j];
                    lastItem.classList.remove("last-read");
                    continue;
                }

                break;
            }

            if (lastItem != null)
                lastItem.classList.add("last-read");
        }
    };

    logview.updateJoinPartVisibility = function (logview) {
        //Find all joins & parts in the logview with class 'show'.
        var elements = logview.querySelectorAll(".join.show, .part.show");

        for (var i = 0, ii = elements.length; i < ii; ++i)
            (elements[i]).classList.remove("show");
    };

    logview.pruneLog = //#endregion
    //#region Utilities
    function (log) {
        var length = log.children.length;

        while (length > logview.MAX_MOBILE_LOG) {
            //Remove first child
            log.removeChild(log.children[0]);
            --length;
        }
    };

    logview.removeAfter = function (items, seconds) {
        //Remove input elements after input seconds
        setTimeout(function () {
            items.remove();
        }, seconds * 1000);
    };

    logview.nearBottom = function (logView) {
        var height = logView.clientHeight, scollTop = logView.scrollTop, scrollHeight = logView.scrollHeight, scrollBottom = scrollHeight - (scollTop + height);

        //Distance to bottom is < 150
        return scrollBottom < 150;
    };

    logview.scrollToBottom = function (logView) {
        if (logView === undefined)
            logView = logview.findActiveChannel(".logview")[0];

        if (logView)
            logView.scrollTop = logView.scrollHeight;
    };

    logview.findChannels = function (server, subselect) {
        if (typeof subselect === "undefined") { subselect = null; }
        var selector = ".channel-display";

        if (server != null)
            selector += "[data-server='" + server + "']";

        if (subselect)
            selector += " " + subselect;

        return $(selector);
    };

    logview.findChannel = function (channel, server, subselect) {
        if (typeof server === "undefined") { server = null; }
        if (typeof subselect === "undefined") { subselect = null; }
        var selector = ".channel-display[data-channel='" + channel.toLowerCase() + "']";

        if (server != null)
            selector += "[data-server='" + server + "']";

        if (subselect)
            selector += " " + subselect;

        return $(selector);
    };

    logview.findActiveChannel = function (subselect) {
        if (typeof subselect === "undefined") { subselect = null; }
        if (subselect)
            return $(".channel-display.active " + subselect);
        return $(".channel-display.active");
    };

    logview.formatDate = function (date) {
        return date.toLocaleTimeString() + " on " + date.toLocaleDateString();
    };
    logview.MAX_MOBILE_LOG = 100;
    return logview;
})();
var messagehistory = (function () {
    function messagehistory(maxLength) {
        if (typeof maxLength === "undefined") { maxLength = 100; }
        this.maxLength = maxLength;
        this.items = [];
    }
    ///Add item to the end of the history
    messagehistory.prototype.add = function (item) {
        this.items.push(item);

        if (this.items.length > this.maxLength)
            this.items.shift();

        return this.reset();
    };

    ///Move up
    messagehistory.prototype.up = function () {
        if (this.index == 0)
            this.index = 1;

        return this.items[--this.index];
    };

    ///Move down
    messagehistory.prototype.down = function () {
        if (this.index == this.items.length)
            return;

        return this.items[++this.index];
    };

    ///Reset index
    messagehistory.prototype.reset = function () {
        this.index = this.items.length;
        return this;
    };
    return messagehistory;
})();
/// <reference path="dom.ts" />
var timer = (function () {
    function timer() {
    }
    timer.initialize = ///Calls idle/active callbacks. inactiveLimit in seconds
    function (inactiveLimit, onUserIdle, onUserActive) {
        //Bind fields
        timer.inactiveLimit = inactiveLimit * 1000;

        //Bind callbacks
        timer.onUserIdle = onUserIdle;
        timer.onUserActive = onUserActive;

        //Detect events
        document.body.bind("mousemove", timer.userNowActive).bind("keypress", timer.userNowActive);

        //Spin idle timer
        setInterval(function () {
            timer.idleTime += 10000;

            if (timer.idleTime >= timer.inactiveLimit && timer.isUserActive === true) {
                timer.isUserActive = false;
                timer.onUserIdle(timer.lastMove);
            }
        }, 10000);
    };

    timer.userNowActive = function () {
        if (timer.isUserActive === false) {
            timer.isUserActive = true;
            timer.onUserActive();
        }

        timer.lastMove = new Date();
        timer.idleTime = 0;
    };
    timer.lastMove = new Date();
    timer.idleTime = 0;
    timer.isUserActive = true;
    return timer;
})();
/// <reference path="logview.ts" />
/// <reference path="types.d.ts" />
/// <reference path="library/messagehistory.ts" />
/// <reference path="library/dom.ts" />
/// <reference path="library/idletimer.ts" />
/// <reference path="library/notifications.d.ts" />
//#endregion
var channelview = (function () {
    function channelview() {
    }
    channelview.initialize = //#endregion
    //#region Initialization
    function () {
        //Check for mobile/touch support
        channelview.supports_touch = "ontouchstart" in window;
        channelview.is_mobile = document.getElementById("content").classList.contains("mobile");

        //Restore hashed channel
        logview.restoreChannel(window.location.hash);

        if (channelview.focusChat(false) === false)
            return;

        //Scroll active channel to bottom
        logview.scrollToBottom();

        //Detect user click on channel menu
        $("#channels").on("li a", "click", function (e) {
            return channelview.onChangeChannel(e);
        });

        //Detect 'return' on chatbox
        $("#chatbox").bind("keypress", function (e) {
            return channelview.onReturn(e);
        }).bind("keydown", function (e) {
            return channelview.onChatBoxKey(e);
        });

        //Double clicks on users
        $("#content").on("li a.user", "dblclick", function (e) {
            return channelview.onUserClicked(e);
        });

        //Detect keypresses
        document.body.bind("keydown", function (e) {
            return channelview.onArrows(e);
        });

        //Detect window size change
        window.addEventListener("resize", function (e) {
            return channelview.onWindowResized(e);
        });

        //Detect window pop history
        window.addEventListener("popstate", function (e) {
            return channelview.onHistoryChanged(e);
        });

        //Spin up idle timer
        timer.initialize(channelview.IDLE_TIME, logview.becomeInactive, logview.becomeActive);

        //Initialize history
        channelview.history = new messagehistory();
    };

    channelview.setMessageCallback = function (onSendMessage) {
        //Bind callback(s)
        channelview.sendMessage = onSendMessage;
    };

    channelview.onChangeChannel = //#endregion
    //#region Events
    function (e) {
        var target = e.eventTarget, channel = target.innerText, server = target.attr("data-server");

        //Switch active channel
        logview.switchChannel(channel, server);
    };

    channelview.onReturn = function (e) {
        if (e.keyCode !== 13)
            return;

        var message = e.eventTarget.value, active = logview.findActiveChannel()[0];

        if (message !== "" && active) {
            var channel = active.attr("data-channel"), server = active.attr("data-server");

            channelview.sendMessage(message, server, channel);
            e.eventTarget.value = "";

            //Record message
            channelview.history.add(message);
        }
    };

    channelview.onArrows = function (e) {
        //Navigate left/right channel
        var direction = 0;
        var other = false;
        var chatBox = document.getElementById("chatbox");

        switch (e.keyCode) {
            case 37:
                direction = -1;
                break;
            case 39:
                direction = +1;
                break;
            default:
                //Check for other keys
                other = true;
                break;
        }

        if (direction === 0) {
            if (other && document.activeElement !== chatBox)
                chatBox.focus();

            return;
        }

        var hasInput = chatBox.value !== "";

        if (e.ctrlKey === false || hasInput === true)
            return;

        var items = $("#channels li"), nextChannel = 0;

        for (var i = 0, ii = items.length; i < ii; ++i) {
            var item = items[i], a = item.getElementsByTagName("a")[0];

            if (a.classList.contains("active")) {
                nextChannel = i + direction;

                if (nextChannel >= 0 && nextChannel <= items.length - 1) {
                    var channelElem = items[nextChannel].getElementsByTagName("a")[0], channel = channelElem.nodeText().trim(), server = channelElem.attr("data-server");

                    logview.switchChannel(channel, server);
                    $("#chatbox")[0].focus();
                }

                return;
            }
        }
    };

    channelview.onChatBoxKey = function (e) {
        switch (e.keyCode) {
            case 38:
                //Retrieve last message
                var text = channelview.history.up();
                if (text)
                    e.eventTarget.value = text;
                e.preventDefault();
                break;

            case 40:
                //Retrieve next message
                e.eventTarget.value = channelview.history.down() || "";
                e.preventDefault();
                break;
        }
    };

    channelview.onUserClicked = function (e) {
        var target = e.eventTarget, name = target.innerText;

        //Inject name into chatbox
        var chatBox = document.getElementById("chatbox");

        if (chatBox.value.length !== 0)
            chatBox.value += " ";

        chatBox.value += name + " ";
        chatBox.focus();
        e.preventDefault();
    };

    channelview.onWindowResized = function (e) {
        //Scroll to bottom of active view
        var activeChannel = logview.findActiveChannel(".logview")[0];

        if (activeChannel != null)
            logview.scrollToBottom(activeChannel);
    };

    channelview.onHistoryChanged = function (e) {
        if (!channelview.popped && !channelview.popped++)
            return;

        var channel = window.location.hash;

        if (channel === "") {
            //Retrieve first channel
            var first = $("#channels li a")[0];

            if (first != null)
                channel = first.innerText.trim();
        }

        logview.restoreChannel(channel);
    };

    channelview.evaluateActive = //#endregion
    //#region Methods
    function (nextChannel) {
        //Check if there are active users
        var chatbox = $("#chatbox")[0], userList = nextChannel.getElementsByClassName("userlist")[0], users = userList.getElementsByTagName("li");

        if (users.length !== 0) {
            channelview.toggleConnected(true);

            if (channelview.supports_touch === false || channelview.guessKeyboardUp())
                chatbox.focus();
        } else
            channelview.toggleConnected(false);
    };

    channelview.joinChannel = function (channelName, server) {
        //Try to find channel
        var channelDisplay = logview.findChannel(channelName, server)[0];

        //Put channel name in lower-case
        channelName = channelName.toLowerCase();

        if (channelDisplay != null || channelName[0] !== "#")
            return;

        //Channel does not exist, create it
        channelDisplay = _new("div").attr("class", "channel-display").attr("data-channel", channelName).attr("data-server", server).append(_new("ul").attr("class", "logview")).append(_new("ul").attr("class", "userlist"));

        $("#content")[0].prepend(channelDisplay);

        //Add channel to menu
        $("#channels")[0].append(_new("li").append(_new("a").attr("data-server", server).nodeText(channelName)));

        //Switch to channel
        logview.switchChannel(channelName, server);

        return channelDisplay;
    };

    channelview.leaveChannel = function (channelName, server) {
        //Try to find channel
        var channelDisplay = logview.findChannel(channelName, server)[0];

        if (channelDisplay == null || channelName[0] !== "#")
            return;

        //Switch to prev channel in menu (if one exists)
        var prevChannel = channelDisplay.previousElementSibling;

        if (channelDisplay.classList.contains("active")) {
            var otherNodes = channelDisplay.parentElement.childNodes;
            for (var i = 0, ii = otherNodes.length; i < ii; ++i) {
                var node = otherNodes[i];
                if (node.nodeType === 1 && node.classList.contains("channel-display") && node.classList.contains("active") === false) {
                    //Other channel found, switch to it
                    logview.switchChannel(node.attr("data-channel"), node.attr("data-server"));

                    break;
                }
            }
        }

        //Remove channel's parent
        channelDisplay.remove();

        //Remove channel from menu
        channelview.findChannelMenu(channelName, server).parentElement.remove();
    };

    channelview.updateUserNick = function (onServer, curNick, newNick) {
        var users = logview.findChannels(onServer, ".userlist li"), channels = logview.findChannels(onServer);

        for (var i = 0, ii = users.length; i < ii; ++i) {
            var userElem = users[i];

            if (userElem.nodeText().trim() === curNick)
                userElem.empty().append(channelview.makeUserLI(newNick));
        }

        var message;

        if (settings["nick"] === curNick) {
            message = "Nickname changed to " + newNick;
            settings["nick"] = newNick;
        } else
            message = curNick + " is now known as " + newNick;

        for (var i = 0, ii = channels.length; i < ii; ++i)
            logview.appendLog(channels[i], null, message, "join show");
    };

    channelview.quitUser = function (fromServer, nick) {
        var channels = logview.findChannels(fromServer);

        for (var i = 0, ii = channels.length; i < ii; ++i)
            channelview.removeUser(null, fromServer, nick, channels[i], true);
    };

    channelview.removeUser = function (fromChannel, server, nick, channel, quit) {
        if (typeof channel === "undefined") { channel = null; }
        if (typeof quit === "undefined") { quit = false; }
        if (nick === settings["nick"]) {
            channelview.leaveChannel(fromChannel, server);
            return;
        }

        if (channel == null)
            channel = logview.findChannel(fromChannel, server)[0];

        var userList = channel.getElementsByClassName("userlist")[0], users = userList.getElementsByTagName("li");

        for (var i = 0, ii = users.length; i < ii; ++i) {
            var userElement = users[i];

            if (userElement.nodeText().trim() === nick) {
                userElement.remove();

                //Log the user leaving
                logview.appendLog(channel, null, nick + " has " + (quit ? "quit" : "left"), "part show");
                break;
            }
        }
    };

    channelview.updateUsers = function (toChannel, server, nicks) {
        var channel = logview.findChannel(toChannel, server)[0], userList = channel.getElementsByClassName("userlist")[0];

        //Clear out current users
        userList.empty();

        //Sort nicks
        nicks.sort(channelview.sortStrings);

        for (var i = 0, ii = nicks.length; i < ii; ++i) {
            userList.append(channelview.makeUserLI(nicks[i]));
        }

        if (channel.classList.contains("active"))
            channelview.toggleConnected(nicks.length !== 0);
    };

    channelview.addUser = function (toChannel, server, nick) {
        var channel = logview.findChannel(toChannel, server)[0];

        if (channel == null)
            channel = channelview.joinChannel(toChannel, server);

        var userList = channel.getElementsByClassName("userlist")[0], users = userList.getElementsByTagName("li"), newLI = channelview.makeUserLI(nick), userAdded = false, lowerNick = nick.toLowerCase();

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

        if (userAdded === false)
            userList.append(newLI);

        if (settings["nick"] === nick) {
            channelview.focusChat(true);
            logview.appendLog(channel, null, "Connected", "join show");

            //Remove MOTD after 2 seconds
            var motd = $('.logview .motd');
            logview.removeAfter(motd, 2);
        } else
            logview.appendLog(channel, null, nick + " has joined", "join show");
    };

    channelview.setWebsocketConnected = function (connected) {
        var wasConnected = channelview.websocket_connected;
        channelview.websocket_connected = connected;

        if (wasConnected == true && connected == false) {
            $(".userlist").empty();
            channelview.toggleConnected(false);
        } else if (connected == true) {
            var activeChannel = logview.findActiveChannel();

            if (activeChannel.length !== 0)
                channelview.evaluateActive(activeChannel[0]);
        }
    };

    channelview.toggleConnected = function (connectedIRC) {
        var enable = connectedIRC && channelview.websocket_connected;

        //Enable or disable the form based on the input connected state
        $("#chatbox").attr("disabled", enable ? null : "disabled");
    };

    channelview.swapChannelView = function (newChannelViewHTML) {
        //Build up new document fragment
        var tmp = document.createElement("body"), container = $("#content")[0], active = logview.findActiveChannel()[0], channel, server;

        if (active) {
            channel = active.attr("data-channel");
            server = active.attr("data-server");
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

        if ($(".channel-display.active .userlist li").length > 0)
            channelview.toggleConnected(true);

        //Re-build menu
        channelview.rebuildMenu();

        delete tmp;
    };

    channelview.rebuildMenu = function () {
        var channelsList = $("#channels")[0];

        if (channelsList == null)
            return;

        //Clear out existing
        channelsList.empty();

        var allChannels = logview.findChannels(null);

        for (var i = 0, ii = allChannels.length; i < ii; ++i) {
            var channelPane = allChannels[i], channel = channelPane.attr("data-channel"), server = channelPane.attr("data-server"), isActive = channelPane.classList.contains("active");

            var a = _new("a").attr("data-server", server).nodeText(channel);

            if (isActive)
                a.attr("class", "active");

            channelsList.prepend(_new("li").append(a));
        }
    };

    channelview.checkInactive = //#region Helpers
    function (channel, channelName, wasMentioned, sender, message) {
        if (wasMentioned && timer.isUserActive === false) {
            //If the user has not been active, try to get their attention
            //Change or flash favicon?
            var icon = $("link[rel=icon]")[0];
            icon.href = "/favicon_on.ico";

            if (channelview.show_notifications) {
                //Create a notification
                var msgInfo = sender ? sender + " on " : "";

                var notification = window.webkitNotifications.createNotification("/favicon_on.png", msgInfo + channelName, message);

                notification.onclick = function () {
                    //Focus window & switch channel
                    window.focus();
                    logview.switchChannel(channelName, channel.attr("data-server"), true);

                    //Cancel notification
                    notification.cancel();
                };

                //Show notification, then hide after 5 seconds
                notification.show();
                setTimeout(function () {
                    return notification.cancel();
                }, 5000);
            }
        }
    };

    channelview.makeUserLI = function (nick) {
        var mod = false;

        switch (nick[0]) {
            case '~':
            case '&':
            case '@':
            case '%':
            case '+':
                nick = nick.substr(1);
                mod = true;
                break;
        }

        return _new("li").append(_new("a").attr("class", "user" + (mod ? " mod" : "")).nodeText(nick));
    };

    channelview.findChannelMenu = function (channel, server) {
        var matches = $("#channels a[data-server='" + server + "']");

        for (var i = 0, ii = matches.length; i < ii; ++i) {
            if (matches[i].innerText === channel.toLowerCase())
                return matches[i];
        }

        throw "Channel not found";
    };

    channelview.focusChat = function (unlock) {
        var chatBox = $('#chatbox')[0];
        if (chatBox != null) {
            chatBox.focus();

            if (unlock)
                channelview.toggleConnected(true);

            return true;
        }

        return false;
    };

    channelview.guessKeyboardUp = function () {
        return window.innerHeight < window.innerWidth;
    };

    channelview.sortStrings = function (a, b) {
        var aL = a.toLowerCase(), bL = b.toLowerCase();

        if (aL < bL)
            return -1;
        if (aL > bL)
            return 1;
        return 0;
    };
    channelview.IDLE_TIME = 30;

    channelview.popped = 0;
    channelview.supports_touch = false;
    channelview.is_mobile = false;
    channelview.show_notifications = false;
    channelview.websocket_connected = false;
    return channelview;
})();
/// <reference path="types.d.ts" />
/// <reference path="channelview.ts" />
var eventrelay = (function () {
    function eventrelay() {
    }
    eventrelay.MPrivMsg = //#region Handle messages sent from server
    function (e) {
        logview.appendMessage(e.origin, e.servername, e.nick, e.params[1]);
    };

    eventrelay.MTopic = function (e) {
        var channel = logview.findChannel(e.origin, e.servername)[0];

        logview.appendLog(channel, null, e.nick + " changed the topic to: " + e.params[1], "topic");
    };

    eventrelay.MJoin = function (e) {
        channelview.addUser(e.origin, e.servername, e.nick);
    };

    eventrelay.MPart = function (e) {
        channelview.removeUser(e.origin, e.servername, e.nick);
    };

    eventrelay.MQuit = function (e) {
        channelview.quitUser(e.servername, e.nick);
    };

    eventrelay.MNick = function (e) {
        channelview.updateUserNick(e.servername, e.nick, e.origin);
    };

    eventrelay.MOTD = function (e) {
        //Parse MOTD
        var channels = logview.findChannels(e.servername);

        for (var i = 0, ii = channels.length; i < ii; ++i) {
            var channel = channels[i];

            if (e.params && e.params[1])
                logview.appendLog(channel, null, e.params[1], "motd");
        }
    };

    eventrelay.NAMES = function (e) {
        //Parse names
        var channel;

        for (var i = 0, ii = e.params.length; i < ii; ++i) {
            var param = e.params[i];

            if (param.indexOf("#") === 0)
                channel = param;
else if (channel) {
                channelview.updateUsers(channel, e.servername, param.split(" "));

                return;
            }
        }
    };

    eventrelay.SUBSCRIBED = function (e) {
        //Swap channel
        channelview.swapChannelView(e.data);
        logview.appendAll(null, "Client reconnected", "part");

        //Scroll to bottom
        logview.scrollToBottom();
    };
    return eventrelay;
})();
/// <reference path="library/ajax.ts" />
/// <reference path="eventrelay.ts" />
/// <reference path="channelview.ts" />
var MessageKind = (function () {
    function MessageKind() {
    }
    MessageKind.subscribed = "Subscribed";
    return MessageKind;
})();

var service = (function () {
    function service() {
    }
    service.initialize = //#endregion
    //#region Initialization
    function () {
        var url = "ws://" + window.location.hostname + ":" + settings["servicePort"];

        if (service.reconnecting)
            console.log("Attempting reconnect...");
else {
            //Set up throttled reconnect
            service.reconnect = service.throttle(service.initialize, service.TRY_WAIT);
        }

        //Open callbacks
        var ws = new WebSocket(url);

        //Bind websocket callbacks
        ws.onopen = service.onOpened;
        ws.onmessage = service.onMessage;
        ws.onclose = service.onClose;
        ws.onerror = service.onError;

        service.ws = ws;

        //Bind channelview callback
        channelview.setMessageCallback(service.onLocalMessageSent);
    };

    service.onLocalMessageSent = //#endregion
    //#region Events
    function (message, server, target) {
        if (typeof target === "undefined") { target = ""; }
        service.sendMessage({
            message: message,
            server: server,
            target: target
        });
    };

    service.sendMessage = function (message) {
        //Transmit message to websocket
        var data = JSON.stringify(message);
        service.ws.send(data);
    };

    service.onMessage = function (e) {
        var msg = JSON.parse(e.data);

        switch (msg.cmd) {
            case "MPrivMsg":
            case "MJoin":
            case "MTopic":
            case "MPart":
            case "MQuit":
            case "MNick":
                eventrelay[msg.cmd](msg);
                break;

            case "MNumeric":
                switch (msg.numeric | 0) {
                    case 372:
                        eventrelay.MOTD(msg);
                        break;
                    case 353:
                        eventrelay.NAMES(msg);
                        break;
                }
                break;
        }
    };

    service.onOpened = function (e) {
        if (service.reconnecting) {
            //Request list of channels and their users
            ajax("/state", null, eventrelay.SUBSCRIBED);

            //Cancel throttle
            service.reconnecting = false;
        }

        console.log("Websocket connected.");
        channelview.setWebsocketConnected(true);
    };

    service.onClose = function (e) {
        if (service.reconnecting === false) {
            //Append 'Disconnected" to all logs
            console.log("Websocket disconnected.");
            logview.appendAll(null, "Client disconnected", "part");
        }

        //Attempt to re-establish connection
        service.reconnect();
        service.reconnecting = true;
        channelview.setWebsocketConnected(false);
    };

    service.onError = function (e) {
        //console.error(e);
    };

    service.throttle = //#endregion
    //#region Methods
    function (fn, timeout, ctx) {
        var timer, args, needInvoke;

        return function () {
            args = arguments;
            needInvoke = true;
            ctx = ctx || this;

            if (!timer) {
                (function () {
                    if (needInvoke) {
                        fn.apply(ctx, args);
                        needInvoke = false;
                        timer = setTimeout(arguments.callee, timeout);
                    } else
                        timer = null;
                })();
            }
        };
    };
    service.TRY_WAIT = 30000;

    service.reconnecting = false;
    return service;
})();
/// <reference path="logview.ts" />
/// <reference path="library/dom.ts" />
var touch = (function () {
    function touch() {
    }
    touch.initialize = //#region Initialization
    function () {
        //Find content, check mobile
        touch.content = $("#content.mobile")[0];

        if (!touch.content)
            return;

        var body = $("body");

        //Bind userlist events
        var ul_pattern = "#content:not(.shut) .userlist";
        body.on(ul_pattern, "touchstart", touch.onTouchStart);
        body.on(ul_pattern, "touchmove", touch.onTouchMove);
        body.on(ul_pattern, "touchend", function (e) {
            return touch.onTouchEnd(e, false);
        });

        //Bind logview events
        var lv_pattern = "#content.shut .logview";
        body.on(lv_pattern, "touchstart", touch.onTouchStart);
        body.on(lv_pattern, "touchmove", touch.onTouchMove);
        body.on(lv_pattern, "touchend", function (e) {
            return touch.onTouchEnd(e, true);
        });
    };

    touch.onTouchStart = //#endregion
    //#region Events
    function (e) {
        touch.startX = e.touches[0].clientX;
        touch.startY = e.touches[0].clientY;
        touch.moved = false;
    };

    touch.onTouchMove = function (e) {
        var userList = touch.activeList();
        var deltaX = touch.startX - e.touches[0].clientX;
        var deltaXA = Math.abs(deltaX);
        var deltaY = Math.abs(touch.startY - e.touches[0].clientY);
        var allow = deltaXA > deltaY && (deltaXA + deltaY) > touch.MIN_MOVE;

        touch.moved = allow && (deltaXA > touch.MIN_SNAP);

        if (userList && allow) {
            if (touch.opened == false) {
                var width = userList.clientWidth;
                deltaX -= width;
            }

            if (deltaX > 0)
                deltaX = 0;

            touch.content.classList.add("slide");
            userList.style.marginRight = deltaX + "px";
            e.preventDefault();
        } else
            userList.style.marginRight = null;
    };

    touch.onTouchEnd = function (e, open) {
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
    };

    touch.activeList = //#endregion
    //#region Methods
    function () {
        return $(".active .userlist")[0];
    };
    touch.MIN_MOVE = 5;
    touch.MIN_SNAP = 15;

    touch.opened = true;
    touch.moved = false;
    touch.startX = 0;
    touch.startY = 0;
    return touch;
})();
/// <reference path="channelview.ts" />
/// <reference path="library/dom.ts" />
var menu = (function () {
    function menu() {
    }
    menu.initialize = //#endregion
    //#region Initialization
    function () {
        $("#settings").bind("click", function (e) {
            return menu.onSettingsToggled(e);
        });

        if ("webkitNotifications" in window)
            menu.initializeNotifications();

        //Bind theme button
        menu.initializeTheme();

        //Bind toggle statuses button
        menu.initializeShowStatus();
    };

    menu.onSettingsToggled = //#endregion
    //#region Events
    function (e) {
        //Toggle setting buttons
        menu.visible = !menu.visible;

        var show = menu.visible, settings = $("#settings")[0], menuItems = $("header a.menu-item");

        if (show)
            settings.classList.add("on");
else
            settings.classList.remove("on");

        for (var i = 0, ii = menuItems.length; i < ii; ++i) {
            var item = menuItems[i];

            if (item.classList.contains("disabled"))
                item.attr("style", "display: none");
else
                item.attr("style", "display: " + (show ? "inline" : "none"));
        }
    };

    menu.onNotificationToggled = function (e) {
        var button = e.eventTarget;
        if (channelview.show_notifications === true) {
            //Disable notifications
            channelview.show_notifications = false;
            button.nodeText("show notifications");
            button.classList.remove("on");
            localStorage["show-notifications"] = false;
        } else {
            //Request notifications
            window.webkitNotifications.requestPermission(function () {
            });
            channelview.show_notifications = window.webkitNotifications.checkPermission() === 0;

            if (channelview.show_notifications === true) {
                button.nodeText("hide notifications");
                button.classList.add("on");
                localStorage["show-notifications"] = true;
            }
        }
    };

    menu.onThemeToggled = function (e) {
        var button = e.eventTarget;
        var isDark = button.classList.contains("on");

        if (isDark) {
            document.body.classList.remove("dark");
            button.classList.remove("on");
            button.nodeText("night mode");
        } else {
            document.body.classList.add("dark");
            button.classList.add("on");
            button.nodeText("day mode");
        }

        //Store preference
        localStorage["night-mode"] = !isDark;
    };

    menu.onShowStatusToggled = function (e) {
        var button = e.eventTarget;
        var hideStatuses = button.classList.contains("on");

        if (hideStatuses) {
            document.body.classList.remove("hide-statuses");
            button.classList.remove("on");
            button.nodeText("hide joins/parts");
        } else {
            document.body.classList.add("hide-statuses");
            button.classList.add("on");
            button.nodeText("show joins/parts");
        }

        //Store preference
        localStorage["hide-statuses"] = !hideStatuses;
    };

    menu.initializeNotifications = //#endregion
    //#region Methods
    function () {
        //Check if notifications are allowed
        channelview.show_notifications = window.webkitNotifications.checkPermission() === 0 && (localStorage["show-notifications"] || "true") === "true";

        var button = $("#notifications")[0];

        button.classList.remove("disabled");

        if (channelview.show_notifications === true) {
            button.nodeText("hide notifications");
            button.classList.add("on");
        }

        button.bind("click", function (e) {
            return menu.onNotificationToggled(e);
        });
    };

    menu.initializeTheme = function () {
        var button = $("#theme")[0];
        button.bind("click", function (e) {
            return menu.onThemeToggled(e);
        });

        if (localStorage["night-mode"] == "true")
            menu.onThemeToggled({ eventTarget: button });
    };

    menu.initializeShowStatus = function () {
        var button = $("#toggle-statuses")[0];
        button.bind("click", function (e) {
            return menu.onShowStatusToggled(e);
        });

        if (localStorage["hide-statuses"] == "true")
            menu.onShowStatusToggled({ eventTarget: button });
    };
    menu.visible = false;
    return menu;
})();
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
