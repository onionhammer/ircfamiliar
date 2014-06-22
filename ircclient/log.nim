## The 'glue' between the IRC and web service and server
## Stores and retrieves messages by server and channel
## When new messages are logged, they are automatically
## transmitted to all connected clients.

# Imports
import irc, quicklog, marshal
import settings, utilities, usertracker


# Types
type TIRCEventCallback* = proc(e: string)


# Fields
const MAX_LOG_LENGTH* = 100#600           # Total messages in log
const PRESERVE_LENGTH = 50#400           # Preserve the last `n` messages when log rolls over
const MOBILE_LIMIT*   = 50#150           # Max log to retrive for mobile devices
const LOG_FILE        = "eventlog.db" # Log file to store IRC events

var doLogging = false
var preserve  = false

var ircEventCallback: TIRCEventCallback
var log: TLog
var events*: seq[TIRCEvent]


# Procedures
proc rolloverFileCheck =
    ## Roll over the event log file to only track the
    ## MAX_LOG_LENGTH messages at a time on disk
    if log.num_lines > MAX_LOG_LENGTH:
        log.rollover(PRESERVE_LENGTH, preserve)


proc rolloverEventsCheck =
    ## Roll over the events sequence to only track the
    ## MAX_LOG_LENGTH messages at a time in memory
    if events.len > MAX_LOG_LENGTH:
        events.remove(0, events.len - PRESERVE_LENGTH)


proc send*(e: TIRCEvent, serialized: string = nil) =
    # Check if the event has modified the user list
    if e.cmd == MNumeric and e.numeric == "353":
        usertracker.update(e)

    elif e.cmd in { MJoin, MPart, MQuit }:
        usertracker.update(e)

    # Send to subscribed callback
    ircEventCallback(serialized ?? $$e)


proc append*(e: TIRCEvent) =
    var serialized: string = nil

    if settings.logOnlyMsgs and e.cmd != MPrivMsg:
        # Send & Skip saving this to the log
        send(e, serialized)

    else:
        # Append the input event to the log
        if doLogging:
            serialized = log.write(e)
            rolloverFileCheck()

        # Send to subscribed callback
        send(e, serialized)

        # Append to in-memory log
        events.add(e)
        rolloverEventsCheck()


proc updateNick*(e: TIRCEvent) =
    # Update nick in usertracker
    usertracker.update(e)


proc disconnect*(server: string) =
    # TODO - Send to client(s)
    usertracker.remove(server)


proc connect*(server: string) =
    # TODO - Send to client(s)


proc setIRCEventCallback*(e: TIRCEventCallback) =
    ircEventCallback = e


proc initialize* =
    # Check if logging is enabled
    doLogging = settings.read("log").boolVal
    events    = newSeq[TIRCEvent]()

    if doLogging:
        # Check if rolled over logs should be preserved
        preserve = settings.read("log.preserve").boolVal

        # Open log file
        log = quicklog.open(LOG_FILE)

        # Prune log if it has grown past max log length
        rolloverFileCheck()

        # Load log information from file
        for event in log.lines(TIRCEvent):
            events.add(event)