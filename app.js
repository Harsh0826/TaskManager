// Task class to represent a single task object
class Task {
  constructor(id, title, description, priority, category, completed = false) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.category = category;
    this.completed = completed;
  }
}

// TaskManager class handles storing and managing tasks
class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || []; // Load tasks from localStorage
  }

  save() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks)); // Save tasks to localStorage
  }

  addTask(task) {
    this.tasks.push(task); // Add new task
    this.save();
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id); // Delete task by id
    this.save();
  }

  updateTask(id, updatedTask) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? updatedTask : task
    );
    this.save();
  }

  getTasks() {
    return this.tasks; // Return all tasks
  }

  toggleComplete(id) {
    this.tasks = this.tasks.map((task) => {
      if (task.id === id) task.completed = !task.completed;
      return task;
    });
    this.save();
  }
}

// Initialize TaskManager instance
const manager = new TaskManager();

// Select DOM elements
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const notification = document.getElementById("notification");
const filterCategory = document.getElementById("filterCategory");
const sortPriority = document.getElementById("sortPriority");
const searchInput = document.getElementById("searchInput");
const error = document.getElementById("error");
const themeToggle = document.getElementById("themeToggle");
const confirmModal = document.getElementById("confirmModal");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const editPriority = document.getElementById("editPriority");
const editCategory = document.getElementById("editCategory");
const editError = document.getElementById("editError");
const cancelEdit = document.getElementById("cancelEdit");

// Global variables for managing delete/edit operations
let taskToDelete = null;
let currentEditTaskId = null;

// Theme toggle event listener
themeToggle.addEventListener("click", () => {
  if (document.body.dataset.theme === "dark") {
    document.body.dataset.theme = "light";
  } else {
    document.body.dataset.theme = "dark";
  }
});

// Handle form submission to add new task
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const priority = document.getElementById("priority").value;
  const category = document.getElementById("category").value;

  if (!title || !priority || !category) {
    error.textContent = "Please fill all required fields.";
    return;
  }
  error.textContent = "";

  const task = new Task(Date.now(), title, description, priority, category);
  manager.addTask(task);
  if (priority === "High") showNotification("High Priority Task Added!");

  taskForm.reset();
  renderTasks();
});

// Event listeners for filtering, sorting, and searching tasks
filterCategory.addEventListener("change", renderTasks);
sortPriority.addEventListener("change", renderTasks);
searchInput.addEventListener("input", renderTasks);

// Function to render all tasks on the screen
function renderTasks() {
  taskList.innerHTML = "";
  let tasks = manager.getTasks();

  const filter = filterCategory.value;
  const search = searchInput.value.toLowerCase();
  const sort = sortPriority.value;

  // Apply filters
  if (filter) tasks = tasks.filter((t) => t.category === filter);
  if (search)
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search)
    );

  // Apply sorting
  if (sort) {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    tasks.sort((a, b) => {
      if (sort === "HighToLow")
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      else if (sort === "LowToHigh")
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  // Handle empty task list
  if (tasks.length === 0) {
    taskList.innerHTML = "<p>No tasks found.</p>";
    return;
  }

  // Create task cards
  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card" + (task.completed ? " completed" : "");

    card.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description || ""}</p>
      <p><strong>Category:</strong> ${task.category}</p>
      <p><strong>Priority:</strong> <span class="badge ${task.priority.toLowerCase()}">${
      task.priority
    }</span></p>
      <div>
        <button onclick="toggleComplete(${task.id})">${
      task.completed ? "Unmark" : "Complete"
    }</button>
        <button onclick="editTask(${task.id})">Edit</button>
        <button onclick="showConfirmModal(${task.id})">Delete</button>
      </div>
    `;
    taskList.appendChild(card);
  });
}

// Mark task as complete or incomplete
function toggleComplete(id) {
  manager.toggleComplete(id);
  renderTasks();
}

// Show edit modal with task details
function editTask(id) {
  const task = manager.getTasks().find((t) => t.id === id);
  if (!task) return;

  currentEditTaskId = id;
  editTitle.value = task.title;
  editDescription.value = task.description;
  editPriority.value = task.priority;
  editCategory.value = task.category;

  editError.textContent = "";
  editModal.classList.remove("hidden");
}

// Handle cancel edit
cancelEdit.addEventListener("click", () => {
  editModal.classList.add("hidden");
  currentEditTaskId = null;
});

// Handle edit form submission
editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = editTitle.value.trim();
  const description = editDescription.value.trim();
  const priority = editPriority.value;
  const category = editCategory.value;

  if (!title || !priority || !category) {
    editError.textContent = "Please fill all required fields.";
    return;
  }
  editError.textContent = "";

  if (currentEditTaskId) {
    const existing = manager.getTasks().find((t) => t.id === currentEditTaskId);
    const updatedTask = new Task(
      currentEditTaskId,
      title,
      description,
      priority,
      category,
      existing.completed
    );
    manager.updateTask(currentEditTaskId, updatedTask);
    if (priority === "High") showNotification("High Priority Task Updated!");
    currentEditTaskId = null;
    editModal.classList.add("hidden");
    renderTasks();
  }
});

// Show delete confirmation modal
function showConfirmModal(id) {
  taskToDelete = id;
  confirmModal.classList.remove("hidden");
}

// Handle confirm delete
document.getElementById("confirmDelete").addEventListener("click", () => {
  if (taskToDelete !== null) {
    manager.deleteTask(taskToDelete);
    taskToDelete = null;
    renderTasks();
    confirmModal.classList.add("hidden");
  }
});

// Handle cancel delete
document.getElementById("cancelDelete").addEventListener("click", () => {
  taskToDelete = null;
  confirmModal.classList.add("hidden");
});

// Show notification message
function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Initial render of tasks on page load
renderTasks();
