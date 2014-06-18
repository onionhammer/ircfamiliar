# Imports
import strutils, times, re, jester
import settings
import annotate
from cgi import XMLencode


# Fields
const mod_types* = { '~', '&', '@', '%', '+' }
const re_flags   = { reIgnoreCase, reStudy, reExtended }


# Regex patterns
let link_pattern   = re("(https?://[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])", re_flags)
let mobile_pattern = re"Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune"


# Procedures & Templates
template `as`*(x, T: expr): stmt {.immediate.} =
    var x: T; new(x)


template `??`*(value, default: expr): expr =
    if value == nil: default
    else: value


template script*(value: string): string {.immediate.} =
    "<script>" & value & "</script>\r\n"


# Helper Methods
proc remove*[T](x: var seq[T], i: int, n = 1) {.noSideEffect.} =
    ## deletes the item at index `i` by moving ``x[i+1..]`` by one position.
    ## This is an O(n) operation.
    var xl = x.len
    for j in i .. xl-(n+1):
        shallowCopy(x[j], x[j+n])
    setLen(x, xl - n)


proc cmpIgnoreCase*[T:string](x, y: T): int {.noSideEffect, procvar.} =
    cmp(x.toLower, y.toLower)


proc htmlEncode*(value: string): string =
    cgi.XMLencode(value)


proc formatJSON*(time: TTime): string =
    let gmtTime = time.getGMTime()
    return gmtTime.format("yyyy-MM-dd") & "T" &
           gmtTime.format("HH:mm:ss") & ".000Z"


proc formatDateString*(time: TTime): string =
    let localTime = time.getLocalTime()
    return localTime.format("h:mm:ss tt") & " on " &
           localTime.format(settings.dateformat)


proc headerDate*(time: TTimeInfo): string =
    time.format("ddd, dd MMM yyyy HH:mm:ss") & " GMT"


proc detectLinks*(input: string): string =
    const replacement = html"""<a href="$1" target="_blank">$1</a>"""

    return input.replacef(link_pattern, replacement)


proc isMobile*(userAgent: string): bool =
    userAgent.contains(mobile_pattern)


proc isMentioned*(input: string): bool =
    input.toLower.contains(settings.ircNick.toLower)


proc detectAction*(sender: string, input: var string): bool =
    const one = char(1)

    if input.len > 2 and
       input[0] == one and
       input[input.len - 1] == one and
       input.substr(1).find("ACTION") == 0:
        input  = sender & input.substr("ACTION".len + 1)
        result = true


proc encodeAction*(message: string): string =
    let c = char(1)
    return c & "ACTION " & message.substr(4) & c