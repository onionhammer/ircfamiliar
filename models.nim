# Imports
import times
from irc import TIRCMType
export times


# Login View
type
    TLoginViewModel* = object
        authFailed*: bool
        message*: string


# Index View
type
    TIRCServer* = ref object
        channels*: seq[TIRCChannel]
        nick*: string
        address*: string

    TIRCChannel* = ref object
        active*: bool
        name*: string
        users*: seq[TIRCUser]
        log*: seq[TIRCMessage]

    TIRCUser* = string

    TIRCMessage* = ref object
        msgType*: TIRCMType
        numeric*: string
        sender*: string
        recipient*: string
        text*: string
        time*: TTime