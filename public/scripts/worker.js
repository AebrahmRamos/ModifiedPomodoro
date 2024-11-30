// Improved Pomodoro Worker
let intervalId;
let currentState = {
    secondsElapsed: 0,
    isWorking: true,
    workTime: 25,
    baseBreakDurationShort: 5,
    baseBreakDurationLong: 15,
    longBreakInterval: 4,
    workSessions: 0
};

self.onmessage = function(event) {
    const { pause, ...newState } = event.data;

    // Clear any existing interval
    if (intervalId) {
        clearInterval(intervalId);
    }

    // If pause is true, stop processing
    if (pause) return;

    // Update state if new state is provided
    if (Object.keys(newState).length > 0) {
        currentState = { ...currentState, ...newState };
    }

    intervalId = setInterval(() => {
        currentState.secondsElapsed++;

        // Complex break time calculation
        let currentBreakTime;
        if (currentState.isWorking) {
            let extraTime = Math.max(0, (currentState.secondsElapsed / 60) - currentState.workTime);
            currentBreakTime = currentState.workSessions % currentState.longBreakInterval === 0
                ? currentState.baseBreakDurationLong + extraTime * 0.3
                : currentState.baseBreakDurationShort + extraTime * 0.1;
        } else {
            currentBreakTime = currentState.baseBreakDurationShort;
        }

        // Send updated state back to main thread
        self.postMessage({
            currentBreakTime,
            secondsElapsed: currentState.secondsElapsed,
            isWorking: currentState.isWorking
        });
    }, 1000);
};