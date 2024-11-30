// Pomodoro Timer Script

class PomodoroTimer {
    constructor() {
        // DOM Elements
        this.display = document.querySelector("#timer");
        this.breakTimeDisplay = document.querySelector("#break-time");
        this.controlsContainer = document.querySelector("#controls");
        this.settingsContainer = document.querySelector("#settings");

        // Timer Buttons
        this.playPauseButton = this.createButton('Play', 'play-pause');
        this.resetButton = this.createButton('Reset', 'reset');
        this.breakButton = this.createButton('Start Break', 'break');

        // Input Elements
        this.workTimeInput = this.createInput('work-time', this.getSetting('work-time', 25), 1, 60);
        this.shortBreakInput = this.createInput('short-break-time', 5, 1, 30);
        this.longBreakInput = this.createInput('long-break-time', 15, 1, 45);
        this.longBreakIntervalInput = this.createInput('long-break-interval', 4, 1, 10);

        // State Variables
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.workSessions = 0;
        this.isTimerRunning = false;
        this.playPauseButton.textContent = 'Start';
        this.isWorking = true;

        // Initialize application
        this.initializeUI();
        this.initializeEventListeners();
        this.display.textContent = `${this.pad(this.workTimeInput.value)}:00`;
    }

    createButton(text, id) {
        const button = document.createElement('button');
        button.textContent = text;
        button.id = id;
        this.controlsContainer.appendChild(button);
        return button;
    }

    getSetting(key, defaultValue) {
        const storedValue = localStorage.getItem(key);
        return storedValue ? parseInt(storedValue) : defaultValue;
    }

    createInput(id, defaultValue, min, max) {
        const inputContainer = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = id;
        input.value = defaultValue;
        input.min = min;
        input.max = max;

        inputContainer.appendChild(label);
        inputContainer.appendChild(input);
        this.settingsContainer.appendChild(inputContainer);

        return input;
    }

    initializeUI() {
        // Initially show settings
        this.settingsContainer.style.display = 'block';
    }

    initializeEventListeners() {
        const themeToggleButton = document.getElementById('theme-toggle');
            themeToggleButton.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');

                // Update button text based on theme
                themeToggleButton.textContent = document.body.classList.contains('dark-mode')
                    ? 'Light Mode'
                    : 'Dark Mode';
        });

        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.validateInput(input);
                localStorage.setItem(input.id, input.value);
            });
        });

        // Play/Pause Button
        this.playPauseButton.addEventListener('click', () => this.toggleTimer());

        // Reset Button
        this.resetButton.addEventListener('click', () => this.resetTimer());

        // Break Button
        this.breakButton.addEventListener('click', () => this.startBreak());

        // Input Validation
        const inputs = [
            this.workTimeInput, 
            this.shortBreakInput, 
            this.longBreakInput, 
            this.longBreakIntervalInput
        ];

        inputs.forEach(input => {
            input.addEventListener('change', () => this.validateInput(input));
        });
    }

    validateInput(input) {
        const value = parseInt(input.value);
        const min = parseInt(input.min);
        const max = parseInt(input.max);

        if (value < min) input.value = min;
        if (value > max) input.value = max;
    }

    toggleTimer() {
        if (!this.isTimerRunning) {
            this.startTimer();
        } else {
            this.pauseTimer();
        }
    }

    startTimer() {
        if (this.isTimerRunning) return;

        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(() => this.updateDisplay(), 1000);
        
        this.isTimerRunning = true;
        this.playPauseButton.textContent = 'Pause';
        this.lockSettings();
    }

    pauseTimer() {
        if (!this.isTimerRunning) return;

        clearInterval(this.timerInterval);
        this.elapsedTime = Date.now() - this.startTime;
        
        this.isTimerRunning = false;
        this.playPauseButton.textContent = 'Resume';
        this.unlockSettings();
    }

    resetTimer() {
        clearInterval(this.timerInterval);
        
        this.startTime = 0;
        this.elapsedTime = 0;
        this.workSessions = 0;
        this.isTimerRunning = false;
        this.isWorking = true;

        this.playPauseButton.textContent = 'Start';
        this.updateDisplay();
        this.unlockSettings();
    }

    startBreak() {
        this.workSessions++;
        this.isWorking = !this.isWorking;
    
        // Determine break duration
        const shortBreakTime = parseInt(this.shortBreakInput.value);
        const longBreakTime = parseInt(this.longBreakInput.value);
        const longBreakInterval = parseInt(this.longBreakIntervalInput.value);
    
        clearInterval(this.timerInterval);
    
        if (this.isWorking) {
            // Start work timer
            this.startCustomTimer(parseInt(this.workTimeInput.value));
        } else {
            // Start break timer
            if (this.workSessions % longBreakInterval === 0) {
                this.startCustomTimer(longBreakTime);
            } else {
                this.startCustomTimer(shortBreakTime);
            }
        }
    
        this.breakButton.textContent = this.isWorking ? 'Start Break' : 'Start Work';
    }

    startCustomTimer(duration) {
        if (!this.isTimerRunning) return;
        this.startTime = Date.now();
        this.elapsedTime = 0; // Reset elapsed time for accurate break duration
        this.timerInterval = setInterval(() => this.updateDisplay(duration), 1000);
        this.isTimerRunning = true;
        this.playPauseButton.textContent = 'Pause';
    }

    updateDisplay(customDuration = null) {
        const totalTime = (customDuration || parseInt(this.workTimeInput.value)) * 60 * 1000;
        const elapsedTime = Date.now() - this.startTime + this.elapsedTime; // Include elapsed time
        const timeRemaining = Math.max(0, totalTime - elapsedTime);
    
        const minutes = Math.floor(timeRemaining / (60 * 1000));
        const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
    
        this.display.textContent = `${this.pad(minutes)}:${this.pad(seconds)}`;
        this.breakTimeDisplay.textContent = minutes;
    
        if (timeRemaining <= 0) {
            clearInterval(this.timerInterval);
            this.startBreak();
        }
    }

    lockSettings() {
        [
            this.workTimeInput, 
            this.shortBreakInput, 
            this.longBreakInput, 
            this.longBreakIntervalInput
        ].forEach(input => input.disabled = true);
    }

    unlockSettings() {
        [
            this.workTimeInput, 
            this.shortBreakInput, 
            this.longBreakInput, 
            this.longBreakIntervalInput
        ].forEach(input => input.disabled = false);
    }

    pad(number) {
        return number.toString().padStart(2, '0');
    }
}

// Initialize the timer when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});