# Imports
import templates
from irc import TIRCMType
from times import getTime
import utilities, models


# Procedures
proc logview(channel: TIRCChannel): string =
    let now          = times.getTime()
    let nowTimestamp = now.formatJSON()
    let nowTooltip   = now.formatDateString()

    tmpli html"""
        <ul class=logview>
            $for message in channel.log {
                ${
                    let time     = message.time.formatJSON()
                    let tooltip  = message.time.formatDateString()
                    var text     = message.text
                    let isAction = detectAction(message.sender, text)
                }

                $case message.msgType
                $of MPrivMsg {
                    ${ var class = if isAction: "class=action" else: "" }
                    $if not isAction and isMentioned(text) {
                        ${ class = "class=mention" }
                    }
                    <li $class data-timestamp=$time title="$tooltip" data-type=$(message.msgType)>
                        $if not isAction {
                            <a class=user>$(message.sender)</a>
                        }
                        <div class=message>$(text.htmlencode.detectLinks)</div>
                    </li>
                }
                $of MTopic {
                    <li class=topic data-timestamp=$time title="$tooltip" data-type=$(message.msgType)>
                        <div class=message>$(message.sender.htmlencode) changed the topic to: $(text.htmlencode.detectLinks)</div>
                    </li>
                }
                $of MJoin {
                    <li class=join data-timestamp=$time title="$tooltip" data-type=$(message.msgType)>
                        <div class=message>$(message.sender.htmlencode) has joined</div>
                    </li>
                }
                $of MQuit {
                    <li class=part data-timestamp=$time title="$tooltip" data-type=$(message.msgType)>
                        <div class=message>$(message.sender.htmlencode) has quit</div>
                    </li>
                }
                $of MPart {
                    <li class=part data-timestamp=$time title="$tooltip" data-type=$(message.msgType)>
                        <div class=message>$(message.sender.htmlencode) has left</div>
                    </li>
                }
                $of MNumeric {
                    $if message.numeric == "372" {
                        <li class=motd data-timestamp=$time title="$tooltip" data-type=$(message.msgType) data-numeric=$(message.numeric)>
                            <div class=message>$(text.htmlencode.detectLinks)</div>
                        </li>
                    }
                }
                $else {}
            }
            <li class=endlog data-timestamp="$nowTimestamp" title="$nowTooltip">
        </ul>
        """


proc users(channel: TIRCChannel): string = tmpli html"""
    <ul class=userlist>
        $for user in channel.users {
            $if user[0] in mod_types {
                ${ var uname = user.substr(1) }
                <li><a class="user mod">$(uname.htmlencode)</a>
            }
            $else{
                <li><a class=user>$(user.htmlencode)</a>
            }
        }
    </ul>
    """


proc view*(servers: openarray[TIRCServer], active: TIRCChannel, channelsOnly = false): string =
    tmpli html"""
        $for server in servers {
            $for channel in server.channels {
                ${ var activeCss = if active == channel: " active" else: "" }

                <div class="channel-display$activeCss"
                     data-channel="$(channel.name)"
                     data-server="$(server.address)">
                    $(logview(channel))
                    $(users(channel))
                </div>
            }
        }
        """

    if not channelsOnly:
        # Append additional information
        if active != nil:
            let disabled = if active.users.len == 0: " disabled"
                           else:                     ""

            tmpl html"""<input id=chatbox maxlength=3500$disabled>"""

        else: tmpl html"""
            <div class=pad>Welcome to iRC Familiar</div>
            <p>
                If you are seeing this message, you likely have not configured
                your settings.cfg file. Please follow the guide online!
            <p>
            """