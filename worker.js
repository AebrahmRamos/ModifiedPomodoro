self.addEventListener('message', event => {
    const { isWorking, secondsElapsed, workTime, baseBreakDurationShort, baseBreakDurationLong, longBreakInterval, workSessions } = event.data;
  
    let currentBreakTime;
    let extraTime = Math.max(0, (secondsElapsed / 60) - workTime);
  
    if (!isWorking) {
      if (workSessions % longBreakInterval === 0 && workSessions !== 0) {
        currentBreakTime = parseInt(baseBreakDurationLong) + extraTime * 0.3;
      } else {
        currentBreakTime = parseInt(baseBreakDurationShort) + extraTime * 0.1;
      }
      self.postMessage({ currentBreakTime });
    }
  });