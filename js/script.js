const taskInput = document.getElementById("taskInput");
const reminderInput = document.getElementById("reminderTime");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const clearAllBtn = document.getElementById("clearAllBtn");
const toggleDarkBtn = document.getElementById("toggleDarkBtn");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// 🔊 Reminder sound
const reminderSound = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
reminderSound.loop = true; // keep looping until dismissed

// Request notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";
  let pending = 0;
  let completed = 0;

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    // Task text
    const span = document.createElement("span");
    span.textContent = task.text;
    span.className = "task-text";

    // Reminder
    if (task.reminder) {
      const reminderSpan = document.createElement("span");
      reminderSpan.textContent = ` (Reminder: ${task.reminder})`;
      reminderSpan.className = "reminder";
      span.appendChild(reminderSpan);
    }

    li.appendChild(span);

    // Toggle complete button
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "✔";
    toggleBtn.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(toggleBtn);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);

    // Counters
    if (task.completed) {
      completed++;
    } else {
      pending++;
    }
  });

  pendingCount.textContent = `Pending 🕓: ${pending}`;
  completedCount.textContent = `Completed✅ : ${completed}`;
}

// Add task
addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const reminder = reminderInput.value;

  if (text === "") return;

  tasks.push({ text, completed: false, reminder, notified: false });
  saveTasks();
  renderTasks();

  taskInput.value = "";
  reminderInput.value = "";
});

// Clear all
clearAllBtn.addEventListener("click", () => {
  tasks = [];
  saveTasks();
  renderTasks();
});

// Dark mode toggle
toggleDarkBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

// Load dark mode
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// 🔔 Check reminders every minute
setInterval(() => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  tasks.forEach(task => {
    if (task.reminder && task.reminder === currentTime && !task.notified) {
      // 🔊 Play sound (looping until dismissed)
      reminderSound.play();

      // 🔔 Send notification
      if ("Notification" in window && Notification.permission === "granted") {
        const notif = new Notification("Reminder", {
          body: task.text + " ⏰",
          icon: "https://cdn-icons-png.flaticon.com/512/1827/1827349.png"
        });

        // Stop sound when notification clicked
        notif.onclick = () => {
          reminderSound.pause();
          reminderSound.currentTime = 0;
        };
      } else {
        if (confirm(`Reminder: ${task.text}\n\nStop alarm?`)) {
          reminderSound.pause();
          reminderSound.currentTime = 0;
        }
      }

      task.notified = true; // avoid repeat
      saveTasks();
    }
  });
}, 60000); // check every 1 min

// Init
renderTasks();


