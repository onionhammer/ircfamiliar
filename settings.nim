# Imports
import os, parsecfg, strutils, streams, tables


# Type definitions
type
    TSettingKind* = enum
        SettingInt, SettingString,
        SettingChannel, SettingServer,
        SettingBool

    TSettings* = seq[TSetting]
    TSetting* = object
        case kind*: TSettingKind
        of SettingInt:
            intVal*: int
        of SettingChannel.. SettingServer:
            channel*: string
            server*: string
            port*: int
            command*: string
        of SettingBool:
            boolVal*: bool
        of SettingString:
            strVal*: string


# Fields
const filename         = "settings.cfg"
const default_irc_port = 6667

var settings = initTable[string, TSettings]()


# Procedures
proc addSetting(kind: TSettingKind; key, value: string) =
    var newSetting = TSetting(kind: kind)

    case kind
    of SettingInt:
        newSetting.intVal = parseInt(value)

    of SettingChannel:
        let serverIndex = value.find(",")
        var portIndex   = value.find(":")

        portIndex = if portIndex > 0: portIndex else: value.len
        var port = value.substr(portIndex + 1).strip()

        newSetting.channel = value.substr(0, serverIndex - 1).strip().toLower
        newSetting.server  = value.substr(serverIndex + 1, portIndex - 1).strip()
        newSetting.port    = if port != "": parseInt(port) else: default_irc_port

    of SettingServer:
        let commandIndex = value.find(",")
        var portIndex    = value.find(":")

        let info  = value.substr(0, commandIndex - 1).strip()
        portIndex = if portIndex > 0: portIndex else: info.len
        let port  = info.substr(portIndex+1).strip()

        newSetting.server  = info.substr(0, portIndex - 1).strip().toLower
        newSetting.port    = if port != "": parseInt(port) else: default_irc_port
        newSetting.command = value.substr(commandIndex + 1).strip()

    of SettingBool:
        newSetting.boolVal = parseBool(value)

    of SettingString:
        newSetting.strVal = value

    #Check if key already exists
    if settings.hasKey(key):
        settings.mget(key).add(newSetting)
    else:
        settings[key] = @[newSetting]


proc parseWebInfo(parser: var TCfgParser): TCfgEvent =
    ## Parse web info settings
    while true:
        var entry = parser.next

        case entry.kind
        of cfgKeyValuePair:
            case entry.key
            of "port", "service.port":
                addSetting(SettingInt, entry.key, entry.value)
            of "http":
                addSetting(SettingBool, entry.key, entry.value)
            else:
                addSetting(SettingString, entry.key, entry.value)

        else: return entry


proc parseIrcOptions(parser: var TCfgParser): TCfgEvent =
    ## Parse additional IRC options
    while true:
        var entry = parser.next

        case entry.kind:
        of cfgKeyValuePair:
            case entry.key:
            of "channel":
                addSetting(SettingChannel, entry.key, entry.value)
            of "log":
                addSetting(SettingBool, entry.key, entry.value)
            of "log.preserve":
                addSetting(SettingBool, entry.key, entry.value)
            of "log.onlymessages":
                addSetting(SettingBool, entry.key, entry.value)
            of "server.onconnect":
                addSetting(SettingServer, entry.key, entry.value)
            else:
                addSetting(SettingString, entry.key, entry.value)

        else: return entry


proc read*(key: string, default = TSetting(kind: SettingString, strVal: "")): TSetting =
    if settings.hasKey(key):
        let results = settings[key]

        if results.len > 0:
            return results[0]

    return default


proc readSeq*(key: string, default: TSettings = @[]): TSettings =
    if settings.hasKey(key): settings[key]
    else: default


# Load settings
block open:

    # Parse settings
    let file = newFileStream(filename, fmRead)

    if file != nil:
        var parser: TCfgParser
        parser.open(file, filename)

        var entry = parser.next()

        while true:
            case entry.kind
            of cfgSectionStart:
                case entry.section:
                of "web.info":
                    entry = parseWebInfo(parser)
                of "irc.options":
                    entry = parseIrcOptions(parser)

            of cfgError:
                echo "Error: ", entry.msg
                break
            of cfgEof:
                break
            else:
                entry = parser.next()

        close(parser)
        close(file)

    else:
        echo "Cannot open ", filename


# Default settings
let DEFAULT_ONLYMESSAGES = TSetting(kind: SettingBool, boolVal: false)
let DEFAULT_USEHTTP      = TSetting(kind: SettingBool, boolVal: false)

# Store some commonly used settings
let webPort*     = read("port").intVal
let useHTTP*     = read("http", DEFAULT_USEHTTP).boolVal
let servicePort* = read("service.port").intVal
let dateformat*  = read("dateformat").strVal
let logOnlyMsgs* = read("log.onlymessages", DEFAULT_ONLYMESSAGES).boolVal
var ircNick*     = read("nick").strVal