let timer = document.getElementById("timer");

let playButton = document.getElementById("play-button");
let resetButton = document.getElementById("reset-button");
let breakButton = document.getElementById("break-button");

let workTime = document.getElementById("work-time");
let baseBreakDurationLong = document.getElementById("long-break");
let baseBreakDurationShort = document.getElementById("short-break");
let longBreakInterval = document.getElementById("long-break-interval");
let shortBreakIncrease = 0.1;
let longBreakIncrease = 0.3;
let breakTimeElement = document.getElementById("break-time");

let secondsElapsed = 0;
let workSessions = 0;
let isWorking = true;
let intervalId;
let currentBreakTime;
let playButtonState = true;

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let limit;
    if (workTime) {
        limit = workTime.value;
    } else {
        limit = Math.floor(currentBreakTime / 60);
    }
    seconds = seconds % 60;
    return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0") + " / " + limit.toString().padStart(2, "0") + ":00";
}

function updateTimer() {
    secondsElapsed++;
    if (isWorking) {
        let extraTime = Math.max(0, (secondsElapsed / 60) - workTime.value);
        if ((workSessions + 1) % longBreakInterval.value == 0 && workSessions != 0) {
            currentBreakTime = parseInt(baseBreakDurationLong.value) + extraTime * longBreakIncrease;
        } else {
            currentBreakTime = parseInt(baseBreakDurationShort.value) + extraTime * shortBreakIncrease;
        }
        breakTimeElement.textContent = currentBreakTime.toFixed(2);
        timer.textContent = formatTime(secondsElapsed);
        if (secondsElapsed / 60 >= workTime.value) {
            breakButton.disabled = false;
            workSessions++;
        } else {
            breakButton.disabled = true;
        }
    } else {
        timer.textContent = formatTime(secondsElapsed);
        if (secondsElapsed >= currentBreakTime * 60) {
            clearInterval(intervalId);
            isWorking = true;
            secondsElapsed = 0;
            timer.textContent = formatTime(secondsElapsed);
            breakTimeElement.parentNode.style.display = "block";
            intervalId = setInterval(updateTimer, 1000);
            breakButton.textContent = "Start Break";
        }
    }
}


playButton.addEventListener("click", () => {
    playButton.classList.toggle('glyphicon-play');
    playButton.classList.toggle('glyphicon-pause');
    if (playButtonState) {
        intervalId = setInterval(updateTimer, 1000);
    } else {
        clearInterval(intervalId);
    }
    playButtonState = !playButtonState;
})

resetButton.addEventListener("click", () => {
    clearInterval(intervalId);
    if (isWorking) {
        secondsElapsed = 0;
        timer.textContent = formatTime(0);
    } else {
        secondsElapsed = 0;
        timer.textContent = formatTime(secondsElapsed);
    }
    playButton.disabled = false;
    resetButton.disabled = false;
})

function startWork() {
    clearInterval(intervalId);
    isWorking = true;
    secondsElapsed = 0;
    timer.textContent = formatTime(secondsElapsed);
    intervalId = setInterval(updateTimer, 1000);
    breakTimeElement.parentNode.style.display = "inline";
    breakButton.textContent = "Start Break";
}

function startBreak() {
    clearInterval(intervalId);
    isWorking = false;
    let extraTime = Math.max(0, (secondsElapsed / 60) - workTime.value);
    currentBreakTime = parseInt(baseBreakDurationShort.value) + extraTime * shortBreakIncrease;
    secondsElapsed = 0;
    timer.textContent = formatTime(secondsElapsed);
    breakTimeElement.parentNode.style.display = "none";
    intervalId = setInterval(updateTimer, 1000);
    breakButton.textContent = "Start Work";
}

breakButton.addEventListener("click", () => {
    if (isWorking) {
        startBreak();
    } else {
        startWork();
    }
})