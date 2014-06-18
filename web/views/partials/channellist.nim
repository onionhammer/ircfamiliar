# Imports
import templates
import models


# Procedures
proc view*(servers: openarray[TIRCServer], active: TIRCChannel): string =
    result = ""

    if active != nil:
        tmpl html"""
            <menu id=channels>
                $for server in servers {
                    $for channel in server.channels {
                        ${ var activeClass = if channel == active: "active" else: "" }
                        <li>
                            <a class="$activeClass" data-server="$(server.address)">$(channel.name)</a>
                        </li>
                    }
                }
            </menu>
            """