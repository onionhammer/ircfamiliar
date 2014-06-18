# Imports
import models, templates
import
    templates.loggedin,
    partials.channellist,
    partials.channeldisplay

export models


# Procedures
proc view*(servers: openarray[TIRCServer],
    active: TIRCChannel, settings: string, isMobile = false): string =

    let showFooter = active == nil

    result = ""
    loggedin.view(isMobile):

        # Show active channel
        result.add channeldisplay.view(servers, active)

        # Show channel list
        result.add channellist.view(servers, active)

        # Add settings into DOM
        result.add settings