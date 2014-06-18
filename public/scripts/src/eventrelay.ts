/// <reference path="types.d.ts" />
/// <reference path="channelview.ts" />

class eventrelay {

    //#region Handle messages sent from server

    static MPrivMsg(e: TIRCEvent) {
        logview.appendMessage(
            e.origin,
            e.servername,
            e.nick,
            e.params[1]
        );
    }

    static MTopic(e: TIRCEvent) {
        var channel = logview.findChannel(e.origin, e.servername)[0];

        logview.appendLog(
            channel,
            null,
            e.nick + " changed the topic to: " + e.params[1],
            "topic"
        );
    }

    static MJoin(e: TIRCEvent) {
        channelview.addUser(e.origin, e.servername, e.nick);
    }

    static MPart(e: TIRCEvent) {
        channelview.removeUser(e.origin, e.servername, e.nick);
    }

    static MQuit(e: TIRCEvent) {
        channelview.quitUser(e.servername, e.nick);
    }

    static MNick(e: TIRCEvent) {
        channelview.updateUserNick(e.servername, e.nick, e.origin);
    }

    static MOTD(e: TIRCEvent) {
        //Parse MOTD
        var channels = logview.findChannels(e.servername);

        for (var i = 0, ii = channels.length; i < ii; ++i) {
            var channel = <HTMLElement>channels[i];

            if (e.params && e.params[1])
                logview.appendLog(channel, null, e.params[1], "motd");
        }
    }

    static NAMES(e: TIRCEvent) {
        //Parse names
        var channel: string;

        for (var i = 0, ii = e.params.length; i < ii; ++i) {
            var param = e.params[i];

            if (param.indexOf("#") === 0)
                channel = param;
            else if (channel) {
                channelview.updateUsers(
                    channel,
                    e.servername,
                    param.split(" ")
                );

                return;
            }
        }
    }

    static SUBSCRIBED(e: any) {
        //Swap channel
        channelview.swapChannelView(<string>e.data);
        logview.appendAll(null, "Client reconnected", "part");

        //Scroll to bottom
        logview.scrollToBottom();
    }

    //#endregion
}