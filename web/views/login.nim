# Imports
import templates
import models, templates.master
export models


# Procedures
proc view* (model: TLoginViewModel): string =
    let showFooter = true

    result = ""
    master.view(isMobile = false): tmpl html"""
        <form method=post class=pad>
            $if model.authFailed {
                <p class=error>Authentication failed
            }
            <p>Please enter your username and password:
            <ul>
                <li><input name=username>
                <li><input name=password type=password>
                <li><button>login</button>
            </ul>
        </form>
        """