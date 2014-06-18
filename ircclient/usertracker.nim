# Imports
import algorithm, tables, strutils, sequtils
import utilities
from IRC import TIRCEvent, TIRCMType


# Types
type TUserListKey* = tuple[channel, server: string]


# Fields
var usersByChannel = initTable[TUserListKey, seq[string]]()


# Procedures
proc userNotEquals(logged, nick: string): bool {.inline.} =
    var cleanedLog = logged

    if logged[0] in mod_types:
        cleanedLog = logged.substr(1)

    return cleanedLog != nick


proc update*(e: TIRCEvent) =
    ## Updates userlist for channel based on event

    if e.cmd == MNumeric:
        #If `e` is a numeric, update all users in channel
        var channel = ""
        var users: seq[string]

        for param in e.params:
            if param.find("#") == 0:
                channel = param
            elif channel != "":
                users = param.split(' ')
                break

        #Update users in channel
        if users != nil:
            sort(users, cmpIgnoreCase)
            usersByChannel[(channel.toLower, e.servername)] = users

    elif e.cmd == MQuit:
        #If `e` is quit, remove user from all channels
        for key in usersByChannel.keys:
            if key.server == e.servername:

                #Iterate through users & remove
                usersByChannel[key] = usersByChannel[key].filter(
                    proc(i: string): bool = userNotEquals(i, e.nick))

    elif e.cmd == MPart:
        #If `e` is part, remove user from channel
        var key = (e.origin.toLower, e.servername)

        if usersByChannel.hasKey(key):
            usersByChannel[key] = usersByChannel[key].filter(
                proc(i: string): bool = userNotEquals(i, e.nick))

    elif e.cmd == MJoin:
        #If `e` is join, add user to channel
        var key = (e.origin.toLower, e.servername)

        if usersByChannel.hasKey(key):
            var users = usersByChannel[key]
            if not users.contains(e.nick):
                users.add(e.nick)
                sort(users, cmpIgnoreCase)
                usersByChannel[key] = users
        else:
            usersByChannel[key] = @[e.nick]

    elif e.cmd == MNick:
        #If `e` is nick, update user's name
        var curNick = e.nick
        var newNick = e.origin

        for key in usersByChannel.keys:
            if key.server == e.servername:

                #Iterate through users & update nick
                var users = usersByChannel[key]
                var index = users.find(curNick)

                if index >= 0:
                    users[index] = newNick

                usersByChannel[key] = users
                break


proc remove*(server: string) =
    for key in usersByChannel.keys:
        if key.server == server:
            usersByChannel.del(key)
            return


proc remove*(key: TUserListKey) =
    if usersByChannel.hasKey(key):
        usersByChannel.del(key)


proc get*(channel, server: string): seq[string] =
    usersByChannel[(channel.toLower, server)] ?? newSeq[string]()