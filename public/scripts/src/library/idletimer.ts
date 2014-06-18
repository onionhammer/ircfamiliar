/// <reference path="dom.ts" />

class timer {

    //Callbacks
    private static onUserIdle: (lastMoved: Date) => void;
    private static onUserActive: () => void;

    //Fields
    private static inactiveLimit: number;
    private static lastMove     = new Date();
    private static idleTime     = 0;
    static isUserActive = true;

    ///Calls idle/active callbacks. inactiveLimit in seconds
    static initialize(inactiveLimit: number, onUserIdle: (lastMoved: Date) => void, onUserActive: () => void) {

        //Bind fields
        timer.inactiveLimit = inactiveLimit * 1000;

        //Bind callbacks
        timer.onUserIdle   = onUserIdle;
        timer.onUserActive = onUserActive;

        //Detect events
        document.body.bind("mousemove", timer.userNowActive)
                     .bind("keypress", timer.userNowActive);

        //Spin idle timer
        setInterval(() => {
            timer.idleTime += 10000; //10 seconds

            if (timer.idleTime >= timer.inactiveLimit && timer.isUserActive === true) {
                timer.isUserActive = false;
                timer.onUserIdle(timer.lastMove);
            }
        }, 10000);
    }

    private static userNowActive() {
        if (timer.isUserActive === false) {
            timer.isUserActive = true;
            timer.onUserActive();
        }

        timer.lastMove = new Date();
        timer.idleTime = 0;
    }

}