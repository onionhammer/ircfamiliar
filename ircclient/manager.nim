# Examples
# https://github.com/nimrod-code/nimbuild/blob/master/ircbot.nim
# http://nimrod-code.org/irc.html

# Imports
import irc, strutils, tables, sequtils, sockets, asyncio, marshal, json
export irc

import settings, utilities, log


# Types
type TIRCConnection* = ref object
    client*: PAsyncIRC
    channels*: seq[string]
    commandsSent*: bool


# Fields
var connections = initTable[string, TIRCConnection]()


# Procedures
proc close* {.noconv.}


proc sendMessage* (message: string, connection: TIRCConnection, target = "") =
    ## Send the input message to the server
    if message.startsWith("/"):
        connection.client.send(message.substr(1))
    else:
        connection.client.privmsg(target, message)


proc sendMessage* (message, server: string, target = "") =
    ## Send the input message to the server
    sendMessage(message, connections[server], target)


proc execServerCommands (server: string, connection: TIRCConnection) =
    ## Send commands when server connects
    connection.commandsSent = true

    # Check for onconnect settings for this server
    var commands = settings.readSeq("server.onconnect")

    for c in commands:

        if c.server == server:
            # Perform command
            connection.client.send(c.command)


proc handleMsg (connection: TIRCConnection, e: TIRCEvent) =
    ## Handle incoming IRC Message
    case e.cmd

    of MPrivMsg, MJoin, MPart, MMode,
       MTopic, MKick, MNick, MNotice, MQuit:

        template channelOp(channels, index: expr, body: stmt): stmt {.immediate.} =
            var channels = connections[e.servername].channels
            let index    = channels.find(e.origin.toLower)
            body; connections[e.servername].channels = channels

        if e.cmd == MJoin and e.nick == settings.ircNick:
            channelOp(channels, index): # Add channel
                if index < 0: channels.add(e.origin.toLower)

        elif e.cmd == MPart and e.nick == settings.ircNick:
            channelOp(channels, index): # Remove channel
                if index >= 0: system.delete(channels, index)

        elif e.cmd == MNick:
            log.updateNick(e)

            if e.nick == settings.ircNick:  # Nick changing is client's
                settings.ircNick = e.origin # Save new nick to model

        elif e.cmd == MMode and not connection.commandsSent:
            # Perform server commands
            execServerCommands(e.servername, connection)

        log.append(e)
        when defined(debug): echo e.cmd, " ", e.raw

    of MNumeric:
        if e.numeric in ["353", "372"]: # NAMES and MOTD
            log.send(e)

        when defined(debug): echo e.numeric, " ", e.raw

    of MPing, MPong: nil

    else:
        when defined(debug): echo e.cmd, " ", e.raw


proc handleEvent (server: string, connection: TIRCConnection, e: TIRCEvent) =
    ## Handle incoming IRC event
    case e.typ
    of EvConnected:
        # Notify clients of connect
        log.connect(server)
        connections[server] = connection

    of EvDisconnected:
        # Notify clients of disconnect
        log.disconnect(server)
        connections.del(server)

        # TODO - Attempt to re-establish connection
        try:
            connection.client.reconnect()
        except:
            echo "Failed to re-establish the connection"

    of EvMsg:
        var event = e
        event.servername = server
        handleMsg(connection, event)


iterator servers*: tuple[address: string, connection: TIRCConnection] =
    for address in connections.keys:
        yield (address, connections[address])


proc initialize* (dispatch: PDispatcher) =
    # Load settings
    let username = settings.read("username")
    let channels = settings.readSeq("channel")

    # Determine unique servers
    var servers = channels.map(
        proc (x: TSetting): tuple[name:string, port:int] = (x.server, x.port)
    ).distnct()

    for server in servers:
        # Retrieve all the channels for this server/port
        var joinChannels = channels.map(
            proc (x: TSetting): string =
                if x.server == server.name and x.port == server.port: x.channel
                else: ""
        ).filter(
            proc (x: string): bool = x != ""
        )

        # Create a new IRC client
        connection as(TIRCConnection)

        var address = server.name
        var client  = asyncIrc(
            address   = address,
            port      = TPort(server.port),
            nick      = settings.ircNick,
            user      = username.strVal,
            realName  = username.strVal,
            joinChans = joinChannels,
            ircEvent  = proc (irc: PAsyncIRC, event: TIRCEvent) =
                            handleEvent(address, connection, event)
        )

        # Connect
        client.connect()

        connection.client   = client
        connection.channels = joinChannels

        dispatch.register(client)

        # Register a quit procedure
        addQuitProc(close)


proc close* =
    ## Shut down IRC connection(s)
    for conn in connections.values:
        conn.client.close()