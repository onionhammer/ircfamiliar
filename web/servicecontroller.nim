# Imports
import websockets, cookies, marshal, strutils
import ../ircclient/manager, ../ircclient/log
import utilities, settings

from times import getTime
from logincontroller import is_authenticated


# Types
type TClientMessage = object
    target: string
    server: string
    message: string


# Fields
var service*: TWebSocketServer


# Procedures
proc onBeforeConnect(ws: TWebSocketServer, client: TWebSocket, headers: PStringTable): bool =
    # Retrieve request's cookies
    let c    = cookies.parseCookies(headers["Cookie"])
    let auth = c["AUTH"]

    # Validate user is logged in
    return auth != "" and
           logincontroller.is_authenticated(auth)


proc onMessage(ws: TWebSocketServer, client: TWebSocket, message: TWebSocketMessage) =
    # Save client message & send to IRC manager
    var e       = to[TClientMessage](message.data)
    var message = e.message

    if message.toLower.startsWith("/me "):
        message = message.encodeAction()

    manager.sendMessage(message, e.server, e.target)

    # Log message if it is not a command
    if message.find('/') != 0:
        log.append TIRCEvent(
            typ:        EvMsg,
            cmd:        MPrivMsg,
            nick:       settings.ircNick,
            servername: e.server,
            origin:     e.target,
            params:     @[e.target, message],
            timestamp:  getTime()
        )


proc onConnected(ws: TWebSocketServer, client: TWebSocket, message: TWebSocketMessage) = nil


proc onDisconnected(ws: TWebSocketServer, client: TWebSocket, message: TWebSocketMessage) = nil


proc initialize*(ws: var TWebSocketServer) =
    # Bind websocket server events
    ws.onBeforeConnect = onBeforeConnect
    ws.onConnected     = onConnected
    ws.onMessage       = onMessage
    ws.onDisconnected  = onDisconnected

    service = ws

    # Bind websocket to IRC log
    log.setIRCEventCallback(proc (e: string) =
        for client in service.clients:
            service.send(client, e)
    )