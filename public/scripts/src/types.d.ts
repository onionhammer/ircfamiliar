interface TIRCEvent {
    cmd: string
    host: string
    nick: string
    numeric: number
    origin: string
    params: string[]
    raw: string
    servername: string
    timestamp: number
    typ: string
    user: string
}