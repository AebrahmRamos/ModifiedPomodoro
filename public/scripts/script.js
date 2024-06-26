let timer = document.getElementById("timer");

let playButton = document.getElementById("play-button");
let resetButton = document.getElementById("reset-button");
let breakButton = document.getElementById("break-button");
let settingsDiv = document.getElementById("settings");

let workTime = document.getElementById("work-time");
let baseBreakDurationLong = document.getElementById("long-break");
let baseBreakDurationShort = document.getElementById("short-break");
let longBreakInterval = document.getElementById("long-break-interval");
let shortBreakIncrease = 0.1;
let longBreakIncrease = 0.3;
let breakTimeElement = document.getElementById("break-time");
let worker = new Worker('scripts/worker.js'); // Updated path

let extraTime = 0;
let secondsElapsed = 0;
let workSessions = 0;
let isWorking = true;
let settingsDisplay = 0;
let currentBreakTime = 0;

function showSettings(){
    if(settingsDisplay === 0){
        settingsDiv.style.display = 'block';
        settingsDisplay = 1;
    } else {
        settingsDiv.style.display = 'none';
        settingsDisplay = 0;
    }
}

function formatTime(seconds, limit) {
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0") + " / " + limit.toString().padStart(2, "0") + ":00";
}

function startWorker() {
    console.log("Starting worker with data:", {
        isWorking,
        secondsElapsed,
        workTime: workTime.value,
        baseBreakDurationShort: baseBreakDurationShort.value,
        baseBreakDurationLong: baseBreakDurationLong.value,
        longBreakInterval: longBreakInterval.value,
        workSessions 
    });
    worker.postMessage({
        isWorking,
        secondsElapsed,
        workTime: workTime.value,
        baseBreakDurationShort: baseBreakDurationShort.value,
        baseBreakDurationLong: baseBreakDurationLong.value,
        longBreakInterval: longBreakInterval.value,
        workSessions 
    });
}

worker.onmessage = function(event) {
    console.log("Main script received message:", event.data);
    const { currentBreakTime: newBreakTime, secondsElapsed: newSecondsElapsed } = event.data;
    currentBreakTime = newBreakTime;
    secondsElapsed = newSecondsElapsed;
    breakTimeElement.textContent = currentBreakTime.toFixed(2);
    timer.textContent = formatTime(secondsElapsed, isWorking ? workTime.value : Math.floor(currentBreakTime / 60));
    
    // Enable the break button if the study time exceeds the work time
    if (isWorking && (secondsElapsed / 60) >= workTime.value) {
        breakButton.disabled = false;
    }

    if (!isWorking && secondsElapsed >= currentBreakTime * 60) {
        isWorking = true;
        secondsElapsed = 0;
        timer.textContent = formatTime(secondsElapsed, workTime.value);
        breakTimeElement.parentNode.style.display = "block";
        startWorker();
        breakButton.textContent = "Start Break";
    }
};

playButton.addEventListener("click", () => {
    playButton.classList.toggle('glyphicon-play');
    playButton.classList.toggle('glyphicon-pause');
    if (playButton.classList.contains('glyphicon-pause')) {
        startWorker();
    } else {
        worker.postMessage({ pause: true });
    }
});

resetButton.addEventListener("click", () => {
    worker.terminate();
    worker = new Worker('scripts/worker.js'); // Updated path
    secondsElapsed = 0;
    isWorking = true;
    timer.textContent = formatTime(0, workTime.value);
    breakTimeElement.textContent = "0.00";
    playButton.classList.remove('glyphicon-pause');
    playButton.classList.add('glyphicon-play');
    breakButton.disabled = true; // Reset the break button state
});

function startWork() {
    isWorking = true;
    secondsElapsed = 0;
    timer.textContent = formatTime(secondsElapsed, workTime.value);
    breakTimeElement.parentNode.style.display = "inline";
    breakButton.textContent = "Start Break";
    playButton.classList.remove('glyphicon-play');
    playButton.classList.add('glyphicon-pause');
    startWorker();
}

function startBreak() {
    workSessions++;
    isWorking = false;
    extraTime = Math.max(0, (secondsElapsed / 60) - workTime.value);
    currentBreakTime = parseInt(baseBreakDurationShort.value) + extraTime * shortBreakIncrease;
    secondsElapsed = 0;
    timer.textContent = formatTime(secondsElapsed, Math.floor(currentBreakTime / 60));
    breakTimeElement.parentNode.style.display = "none";
    startWorker();
    breakButton.textContent = "Start Work";
    playButton.classList.remove('glyphicon-play');
    playButton.classList.add('glyphicon-pause');
}

breakButton.addEventListener("click", () => {
    if (isWorking) {
        startBreak();
    } else {
        startWork();
    }
});
