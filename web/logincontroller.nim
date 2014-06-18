# Imports
import strutils, sha1, jester
import settings, utilities

# Import views
import views.login


# Fields
const login_root*  = "/"
const auth_cookie* = "AUTH"

# Load user credentials
let credentials = sha1.compute(
    settings.read("username").strVal &
    settings.read("password").strVal
).toBase64()


# Procedures
proc authenticate(inputCreds: string): bool =
    ## Validate login credentials against settings
    credentials == inputCreds


proc is_authenticated*(creds: string): bool =
    ## Check if user is currently authenticated
    if creds == nil: false
    else: authenticate(creds)


template respondLogin() {.immediate.} =
    bind login.view

    resp login.view(TLoginViewModel())


template post_authed*(path: string, body) {.immediate, dirty.} =
    ## Template which automatically ensures logged in state
    bind respondLogin

    post path:
        if is_authenticated(request.cookies[auth_cookie]):
            body
        elif request.pathInfo == login_root:
            respondLogin()
        else:
            redirect login_root


template get_authed*(path: string, body) {.immediate, dirty.} =
    ## Template which automatically ensures logged in state
    bind respondLogin

    get path:
        if is_authenticated(request.cookies[auth_cookie]):
            body
        elif request.pathInfo == login_root:
            respondLogin()
        else:
            redirect login_root


# Register actions
block login_action:
    post login_root:
        let username    = @"username"
        let password    = @"password"
        let credentials = sha1.compute(username & password).toBase64()
        let auth        = authenticate(credentials)

        if auth:
            setCookie(auth_cookie, credentials, daysForward(30))
            redirect login_root

        else:
            resp login.view(TLoginViewModel(
                authFailed: true,
                message:    "Invalid credentials"
            ))


block logout_action:
    get_authed "/logout":
        setCookie(auth_cookie, "", daysForward(-1))
        redirect login_root