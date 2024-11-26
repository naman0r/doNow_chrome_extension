// ========================
// DOM ELEMENT SELECTION
// ========================
const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const clearTasksButton = document.getElementById("clearTasksButton");
const clearCompletedTasksButton = document.getElementById("clearCompletedTasksButton"); // Button to clear completed tasks
const priorityInput = document.getElementById("priorityInput"); // Priority field

// DOM Elements for the joke feature
const setupElement = document.getElementById("setup");
const punchlineElement = document.getElementById("punchline");

// ======================
// JOKE FUNCTIONALITY
// ======================

/**
 * Fetch a random joke from the API.
 * @returns {Promise<Object>} Joke object with `setup` and `punchline`.
 */
async function fetchRandomJoke() {
    const response = await fetch("https://official-joke-api.appspot.com/random_joke");
    return response.json();
}

async function displayRandomJoke() {
    try {
        const randomJoke = await fetchRandomJoke();
        setupElement.textContent = randomJoke.setup || "Oops! Couldn't fetch a joke.";
        punchlineElement.textContent = randomJoke.punchline || "";
    } catch (error) {
        setupElement.textContent = "Error fetching joke!";
        punchlineElement.textContent = "Please try again later.";
        console.error("Failed to fetch joke:", error);
    }
}

// Display a joke when the page loads
document.addEventListener("DOMContentLoaded", () => {
    renderTasks(); // Load tasks
    displayRandomJoke(); // Fetch and display a random joke
});

// ========================
// TASK MANAGEMENT FUNCTIONS
// ========================

/**
 * Render tasks from Chrome storage.
 * Clears the existing DOM to avoid duplication before appending tasks.
 */
function renderTasks() {
    // Clear existing tasks in the DOM
    taskList.innerHTML = "";

    // Retrieve tasks from Chrome storage and render them
    chrome.storage.sync.get(["tasks"], (result) => {
        const tasks = result.tasks || [];
        tasks.forEach(task => createTaskElement(task.text, task.completed, task.priority));
    });
}

/**
 * Create a task element and append it to the task list.
 */
function createTaskElement(taskText, completed, priority) {
    const newTask = document.createElement("li");
    newTask.classList.add("task-item");

    // Apply color based on priority
    const taskColor = calculateColor(priority);
    newTask.style.backgroundColor = taskColor;

    // Completion status icon
    const icon = document.createElement("img");
    icon.classList.add("task-icon");
    icon.src = completed ? "images/done.png" : "images/notDone.png";
    icon.alt = completed ? "Done" : "Not Done";
    icon.addEventListener("click", () => toggleTask(newTask, taskText));

    // Task text with priority
    const taskTextElement = document.createElement("span");
    taskTextElement.textContent = `${taskText} [Priority: ${priority}]`;
    if (completed) taskTextElement.classList.add("completed");

    // Append elements to the task
    newTask.appendChild(icon);
    newTask.appendChild(taskTextElement);
    taskList.appendChild(newTask);
}

/**
 * Add a new task to the task list.
 */
function addTask() {
    const taskText = taskInput.value.trim();
    const priority = priorityInput.value;

    if (taskText) {
        createTaskElement(taskText, false, priority);
        saveTask(taskText, false, priority);
        taskInput.value = "";
        priorityInput.value = "unset";
    }
}

/**
 * Save a task to Chrome storage.
 */
function saveTask(taskText, completed, priority) {
    chrome.storage.sync.get(["tasks"], (result) => {
        const tasks = result.tasks || [];
        tasks.push({ text: taskText, completed, priority });
        chrome.storage.sync.set({ tasks });
    });
}

/**
 * Toggle task completion status and update Chrome storage.
 */
function toggleTask(taskElement, taskText) {
    chrome.storage.sync.get(["tasks"], (result) => {
        const tasks = result.tasks || [];
        tasks.forEach(task => {
            if (task.text === taskText) {
                task.completed = !task.completed;
                const icon = taskElement.querySelector(".task-icon");
                icon.src = task.completed ? "images/done.png" : "images/notDone.png";
                taskElement.querySelector("span").classList.toggle("completed", task.completed);
            }
        });
        chrome.storage.sync.set({ tasks });
    });
}

/**
 * Clear all tasks from the list and Chrome storage.
 */
function clearTasks() {
    chrome.storage.sync.remove("tasks", () => {
        taskList.innerHTML = "";
    });
}

/**
 * Clear completed tasks only.
 */
function clearCompletedTasks() {
    chrome.storage.sync.get(["tasks"], (result) => {
        const tasks = result.tasks || [];
        const updatedTasks = tasks.filter(task => !task.completed); // Keep only non-completed tasks
        chrome.storage.sync.set({ tasks: updatedTasks }, () => {
            renderTasksFromScratch(updatedTasks);
        });
    });
}

/**
 * Render tasks from scratch.
 */
function renderTasksFromScratch(tasks) {
    taskList.innerHTML = ""; // Clear current tasks
    tasks.forEach(task => createTaskElement(task.text, task.completed, task.priority)); // Re-render tasks
}

// ========================
// EVENT LISTENERS
// ========================

addTaskButton.addEventListener("click", addTask);
clearTasksButton.addEventListener("click", clearTasks);
clearCompletedTasksButton.addEventListener("click", clearCompletedTasks);

// Allow pressing Enter to add a task
taskInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

/**
 * Calculate a playful color based on priority level.
 */
function calculateColor(priority) {
    const neonRed = { r: 255, g: 7, b: 58 };
    const neonYellow = { r: 255, g: 240, b: 31 };
    const neonGreen = { r: 57, g: 255, b: 20 };
    const neonCyan = { r: 0, g: 255, b: 255 };
    const neutralGray = "#808080";

    if (priority === "unset") return neutralGray;

    const urgency = Math.max(1, Math.min(10, parseInt(priority)));
    const t = (9 - urgency) / 9;
    const wave = Math.sin(t * Math.PI);

    let fromColor, toColor;
    if (t < 0.5) {
        fromColor = neonRed;
        toColor = neonYellow;
    } else {
        fromColor = neonYellow;
        toColor = Math.random() > 0.5 ? neonGreen : neonCyan;
    }

    const blendT = t < 0.5 ? t * 2 : (t - 0.5) * 2;
    const r = Math.round(fromColor.r + blendT * (toColor.r - fromColor.r));
    const g = Math.round(fromColor.g + blendT * (toColor.g - fromColor.g));
    const b = Math.round(fromColor.b + blendT * (toColor.b - fromColor.b));

    const pulseFactor = 0.2;
    const pulse = Math.round(wave * 255 * pulseFactor);

    return `rgb(${Math.min(r + pulse, 255)}, ${Math.min(g + pulse, 255)}, ${Math.min(b + pulse, 255)})`;
}
