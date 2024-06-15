let intervalId;
let currentSecondsElapsed = 0;

self.onmessage = function(event) {
    const { isWorking, secondsElapsed, workTime, baseBreakDurationShort, baseBreakDurationLong, longBreakInterval, workSessions, pause } = event.data;
    // console.log("Worker received message:", event.data);

    clearInterval(intervalId);

    if (pause) {
        return;  // If the message is to pause, do nothing further.
    }

    currentSecondsElapsed = secondsElapsed;

    intervalId = setInterval(() => {
        currentSecondsElapsed += 1;

        let currentBreakTime;
        if (isWorking) {
            let extraTime = Math.max(0, (currentSecondsElapsed / 60) - workTime);
            if (workSessions % longBreakInterval === 0 && workSessions !== 0) {
                currentBreakTime = parseInt(baseBreakDurationLong) + extraTime * 0.3;
            } else {
                currentBreakTime = parseInt(baseBreakDurationShort) + extraTime * 0.1;
            }
        } else {
            currentBreakTime = parseInt(baseBreakDurationShort);
        }

        self.postMessage({
            currentBreakTime,
            secondsElapsed: currentSecondsElapsed
        });
        // console.log("Worker sent message:", {
        //     currentBreakTime,
        //     secondsElapsed: currentSecondsElapsed
        // });
    }, 1000);
};
