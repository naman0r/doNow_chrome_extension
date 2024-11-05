// ========================
// DOM ELEMENT SELECTION
// ========================
const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const clearTasksButton = document.getElementById("clearTasksButton");
const settingsIcon = document.getElementById("settingsIcon");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");

// ========================
// SETTINGS MODAL FUNCTIONS
// ========================

// Show the settings modal with animation
function showSettingsModal() {
    settingsModal.classList.add("show"); // Add 'show' class to make it visible
}

// Hide the settings modal with animation
function hideSettingsModal() {
    settingsModal.classList.remove("show"); // Remove 'show' class to hide it
}

// Event listeners for opening and closing settings modal
settingsIcon.addEventListener("click", showSettingsModal);
closeSettings.addEventListener("click", hideSettingsModal);

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
        hideSettingsModal();
    }
});

// ========================
// TASK MANAGEMENT FUNCTIONS
// ========================

// Render tasks from Chrome storage
function renderTasks() {
    chrome.storage.sync.get(["tasks"], (result) => {
        const tasks = result.tasks || [];
        tasks.forEach(task => createTaskElement(task.text, task.completed));
    });
}

// Create a task element and append it to the list
function createTaskElement(taskText, completed) {
    const newTask = document.createElement("li");

    // Create the icon to indicate completion status
    const icon = document.createElement("img");
    icon.classList.add("task-icon");
    icon.src = completed ? "images/done.png" : "images/notDone.png";
    icon.alt = completed ? "Done" : "Not Done";

    // Toggle completion status on icon click
    icon.addEventListener("click", () => toggleTask(newTask, taskText));

    // Set task text and add completion styling if applicable
    newTask.textContent = taskText;
    if (completed) newTask.classList.add("completed");

    // Add the icon before the task text
    newTask.prepend(icon);
    newTask.addEventListener("click", () => toggleTask(newTask, taskText)); // Toggle task on click

    taskList.appendChild(newTask);
}

// Add a new task to the list and save it to storage
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText !== "") {
        createTaskElement(taskText, false);
        saveTask(taskText, false);
        taskInput.value = ""; // Clear the input field
    }
}

// Save a task to Chrome storage
function saveTask(taskText, completed) {
    chrome.storage.sync.get(["tasks"], (result) => {
        const tasks = result.tasks || [];
        tasks.push({ text: taskText, completed: completed });
        chrome.storage.sync.set({ tasks: tasks });
    });
}

// Toggle task completion and update storage
function toggleTask(taskElement, taskText) {
    chrome.storage.sync.get(["tasks"], (result) => {
        const tasks = result.tasks || [];
        const updatedTasks = tasks.map(task => {
            if (task.text === taskText) {
                task.completed = !task.completed;

                // Update icon and styling based on completion
                const icon = taskElement.querySelector(".task-icon");
                icon.src = task.completed ? "images/done.png" : "images/notDone.png";
                taskElement.classList.toggle("completed", task.completed);
            }
            return task;
        });
        chrome.storage.sync.set({ tasks: updatedTasks });
    });
}

// Clear all tasks from the list and storage
function clearTasks() {
    chrome.storage.sync.remove("tasks", () => {
        taskList.innerHTML = ""; // Clear the displayed list
    });
}

// ========================
// EVENT LISTENERS
// ========================

// Add Task button listener
addTaskButton.addEventListener("click", addTask);

// Clear Tasks button listener
clearTasksButton.addEventListener("click", clearTasks);

// Allow pressing Enter to add a task
taskInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

// Load tasks when the extension popup is opened
document.addEventListener("DOMContentLoaded", renderTasks);
