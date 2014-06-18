interface Notification {
    show(): void
    cancel(): void

    ondisplay: (ev: Event) => any;
    onerror: (ev: Event) => any;
    onclose: (ev: Event) => any;
    onclick: (ev: Event) => any;
}

interface NotificationCenter {
    checkPermission(): number
    createNotification(icon: string, title: string, content: string): Notification
    requestPermission(callback?: (e: any) => void)
}

interface Window {
    webkitNotifications: NotificationCenter
}