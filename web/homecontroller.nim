# Imports
import re, times, json, sequtils, strutils, jester
import settings, utilities
import logincontroller
import ../ircclient/manager,
       ../ircclient/log,
       ../ircclient/usertracker

# Import views
import views.index, views.partials.channeldisplay


# Procedures
proc getIRCState(isMobile = false):
    tuple[servers: seq[TIRCServer], active: TIRCChannel] =

    var active: TIRCChannel
    var servers     = newSeq[TIRCServer]()
    let startAt     = if isMobile: log.events.len - log.MOBILE_LIMIT else: -1
    let maxMsgLen   = if isMobile: log.MOBILE_LIMIT else: log.MAX_LOG_LENGTH
    var firstActive = true
    var index       = 0

    # Retrieve connected servers
    for server in manager.servers():

        var channels = newSeq[TIRCChannel](server.connection.channels.len)
        var c        = 0

        # Retrieve server's channels
        for channel in server.connection.channels:

            # Retrieve messages & users from usertracker
            var users    = usertracker.get(channel, server.address)
            var messages = newSeq[TIRCMessage](maxMsgLen)
            var m        = 0

            # Retrieve channel's event log
            for e in log.events:

                # Determine if this is the right server/channel
                # for this event to be sent
                if e.servername == server.address and
                   (e.origin.toLower == channel or e.origin[0] != '#'):

                    if index > startAt:
                        # If this request is from a mobile device, we need
                        # to limit the number of events to send back
                        let text = if e.params.len > 1: e.params[1]
                                   else: ""

                        # Add this event to messages
                        messages[m] = TIRCMessage(
                            msgType:   e.cmd,
                            numeric:   e.numeric,
                            sender:    e.nick,
                            recipient: e.origin,
                            time:      e.timestamp,
                            text:      text
                        )

                        inc(m)

                    else: inc(index)

            # Resize messages to number of items added
            messages.setLen(m)

            # Add channel to channel list
            channels[c] = TIRCChannel(
                name:   channel,
                active: firstActive,
                users:  users,
                log:    messages
            )

            if firstActive:
                active      = channels[c]
                firstActive = false

            inc(c)

        servers.add TIRCServer(
            nick:     settings.ircNick,
            address:  server.address,
            channels: channels
        )

    return (servers, active)


proc getSettings(prefix = ""): string =
    ## Save some settings into the DOM
    var settingsJson = %{
        "servicePort": %settings.servicePort,
        "nick":        %settings.ircNick
    }

    return script(prefix & $settingsJson)


# Register actions
block index_action:

    template getState(isMobile, model, nimChannel) =
        var isMobile = request.headers["User-Agent"].isMobile
        let (model, nimChannel) = getIRCState(isMobile)

    get_authed "/":
        getState(isMobile, model, nimChannel)

        # Render output
        headers["Cache-Control"] = "no-cache"
        resp index.view(model, nimChannel, getSettings("settings="), isMobile)

    post_authed "/state":
        getState(isMobile, model, nimChannel)

        # Render output
        var result = ""
        result.add getSettings()
        result.add channeldisplay.view(model, nimChannel, channelsOnly = true)
        resp result