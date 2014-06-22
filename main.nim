# Imports
import asyncio
import utilities, versioninfo, settings
import web.server
import ircclient.log, ircclient.manager


# Output build info
static:
    echo """

        ____    ____
     __/\  _`\ /\  _`\
    /\_\ \ \L\ \ \ \/\_\
    \/\ \ \ ,  /\ \ \/_/
     \ \ \ \ \\ \\ \ \L\ \
      \ \_\ \_\ \_\ \____/
       \/_/\/_/\/_/\/___/
       ___                         ___
     /'___\                    __ /\_ \    __
    /\ \__/   __      ___ ___ /\_\\//\ \  /\_\     __     _ __
    \ \ ,__\/'__`\  /' __` __`\/\ \ \ \ \ \/\ \  /'__`\  /\`'__\
     \ \ \_/\ \L\.\_/\ \/\ \/\ \ \ \ \_\ \_\ \ \/\ \L\.\_\ \ \/
      \ \_\\ \__/.\_\ \_\ \_\ \_\ \_\/\____\\ \_\ \__/.\_\\ \_\
       \/_/ \/__/\/_/\/_/\/_/\/_/\/_/\/____/ \/_/\/__/\/_/ \/_/

    """
    # Output version information at compile-time
    echo "    by Erik O'Leary (@onionhammer)"
    echo "    version: " & versioninfo.build & "\n\n"


# Fields
let dispatch = newDispatcher()


# Procedures
proc updateLoop() =
    while dispatch.poll(): discard


proc exit() {.noconv.} =
    quit(QuitSuccess)


######################################
# Main entry point into iRC Familiar #
######################################
block main:

    # Initialize log
    log.initialize()

    # Initialize IRC
    manager.initialize(dispatch)

    # Initialize Web Service
    server.initialize(dispatch)

    # Spint dispatcher
    updateLoop()

    # Set up CTRL+C sigint
    setControlCHook(exit)