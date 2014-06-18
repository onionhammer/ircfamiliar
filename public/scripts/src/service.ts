/// <reference path="library/ajax.ts" />
/// <reference path="eventrelay.ts" />
/// <reference path="channelview.ts" />

class MessageKind {
    static subscribed = "Subscribed";
}

class service {

    //#region Fields

    private static TRY_WAIT = 30000; // 30 seconds
    private static ws: WebSocket;
    private static reconnect: () => void;
    private static reconnecting = false;

    //#endregion

    //#region Initialization

    static initialize() {
        var url = "ws://" + window.location.hostname + ":" + settings["servicePort"];

        if (service.reconnecting)
            console.log("Attempting reconnect...");
        else {
            //Set up throttled reconnect
            service.reconnect = service.throttle(
                service.initialize, service.TRY_WAIT
            );
        }

        //Open callbacks
        var ws = new WebSocket(url);

        //Bind websocket callbacks
        ws.onopen    = service.onOpened;
        ws.onmessage = service.onMessage;
        ws.onclose   = service.onClose;
        ws.onerror   = service.onError;

        service.ws = ws;

        //Bind channelview callback
        channelview.setMessageCallback(
            service.onLocalMessageSent
        );
    }

    //#endregion

    //#region Events

    private static onLocalMessageSent(message: string, server: string, target = "") {
        service.sendMessage({
            message: message,
            server: server,
            target: target
        });
    }

    private static sendMessage(message: any) {
        //Transmit message to websocket
        var data = JSON.stringify(message)
        service.ws.send(data);
    }

    private static onMessage(e: any) {
        var msg = JSON.parse(e.data);

        switch (msg.cmd) {
            case "MPrivMsg":
            case "MJoin":
            case "MTopic":
            case "MPart":
            case "MQuit":
            case "MNick":
                eventrelay[msg.cmd](<TIRCEvent>msg);
                break;

            case "MNumeric":
                switch (msg.numeric | 0) {
                    case 372: eventrelay.MOTD(<TIRCEvent>msg); break;
                    case 353: eventrelay.NAMES(<TIRCEvent>msg); break;
                }
                break;
        }
    }

    private static onOpened(e: any) {
        //Clear out timeout
        if (service.reconnecting) {

            //Request list of channels and their users
            ajax("/state", null, eventrelay.SUBSCRIBED);

            //Cancel throttle
            service.reconnecting = false;
        }

        console.log("Websocket connected.");
        channelview.setWebsocketConnected(true);
    }

    private static onClose(e: any) {

        if (service.reconnecting === false) {
            //Append 'Disconnected" to all logs
            console.log("Websocket disconnected.");
            logview.appendAll(null, "Client disconnected", "part");
        }

        //Attempt to re-establish connection
        service.reconnect();
        service.reconnecting = true;
        channelview.setWebsocketConnected(false);
    }

    private static onError(e: any) {
        //console.error(e);
    }

    //#endregion

    //#region Methods

    private static throttle(fn: () => void, timeout: number, ctx?: any): () => void {
        var timer, args, needInvoke;

        return function () {
            args       = arguments;
            needInvoke = true;
            ctx        = ctx || this;

            if (!timer) {
                (function () {
                    if (needInvoke) {
                        fn.apply(ctx, args);
                        needInvoke = false;
                        timer = setTimeout(arguments.callee, timeout);
                    }
                    else timer = null;
                })();
            }

        };
    }

    //#endregion

}