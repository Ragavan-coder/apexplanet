/* Advanced To-Do Dashboard Script
   - tasks stored in localStorage under "adv_tasks_v1"
   - supports add/edit/delete/toggle, priority, category, due date
   - search, filter, sort, stats, progress bar
*/

const LS_KEY = "adv_tasks_v1";

/* ---------- DOM Refs ---------- */
const taskForm = document.getElementById("taskForm");
const taskText = document.getElementById("taskText");
const addBtn = document.getElementById("addBtn");
const prioritySelect = document.getElementById("prioritySelect");
const categoryInput = document.getElementById("categoryInput");
const categoryList = document.getElementById("categoryList");
const dueInput = document.getElementById("dueInput");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const sortSelect = document.getElementById("sortSelect");

const totalCountEl = document.getElementById("totalCount");
const completedCountEl = document.getElementById("completedCount");
const remainingCountEl = document.getElementById("remainingCount");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

const clearCompletedBtn = document.getElementById("clearCompleted");
const clearAllBtn = document.getElementById("clearAll");

const categoriesWrap = document.getElementById("categoriesWrap");

const taskListEl = document.getElementById("taskList");
const remainingList = document.getElementById("remainingList");
const completedList = document.getElementById("completedList");

const taskTemplate = document.getElementById("taskTemplate").content;

/* ---------- App State ---------- */
let tasks = loadTasks(); // array of {id,text,completed,priority,category,due,created}

/* ---------- Helpers ---------- */
function saveTasks() { localStorage.setItem(LS_KEY, JSON.stringify(tasks)); }
function loadTasks() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function isOverdue(d) {
  if (!d) return false;
  const today = new Date();
  const due = new Date(d + "T23:59:59");
  return !isNaN(due) && due < today && !isSameDay(due, today);
}
function isSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function formatDate(d){ if(!d) return ""; const dt = new Date(d); return dt.toLocaleDateString(); }

/* ---------- Render / UI ---------- */
function updateStats(){
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const remaining = total - completed;
  totalCountEl.textContent = total;
  completedCountEl.textContent = completed;
  remainingCountEl.textContent = remaining;
  const pct = total === 0 ? 0 : Math.round((completed/total)*100);
  progressBar.style.width = pct + "%";
  progressPercent.textContent = pct + "%";
}

function collectCategories(){
  const cats = [...new Set(tasks.map(t => t.category).filter(Boolean))];
  categoryList.innerHTML = "";
  categoriesWrap.innerHTML = "";
  cats.forEach(c => {
    const opt = document.createElement('option'); opt.value = c; categoryList.appendChild(opt);
    const chip = document.createElement('button'); chip.className="cat-chip"; chip.textContent = c;
    chip.onclick = ()=> { categoryInput.value = c; };
    categoriesWrap.appendChild(chip);
  });
}

/* Apply filters, search, sort */
function getFilteredTasks(){
  const q = (searchInput.value || "").trim().toLowerCase();
  const filter = filterSelect.value;
  let list = tasks.slice();

  if (filter === "active") list = list.filter(t => !t.completed);
  else if (filter === "completed") list = list.filter(t => t.completed);
  else if (filter === "overdue") list = list.filter(t => !t.completed && isOverdue(t.due));

  if (q) list = list.filter(t => t.text.toLowerCase().includes(q) || (t.category||"").toLowerCase().includes(q));

  const sort = sortSelect.value;
  if (sort === "created_desc") list.sort((a,b)=>b.created-a.created);
  else if (sort === "created_asc") list.sort((a,b)=>a.created-b.created);
  else if (sort === "due_asc") list.sort((a,b)=> (a.due||"").localeCompare(b.due||""));
  else if (sort === "priority_desc") {
    const map = { high:3, medium:2, low:1 };
    list.sort((a,b)=> (map[b.priority]||0) - (map[a.priority]||0));
  } else if (sort === "alpha_asc") list.sort((a,b)=> a.text.localeCompare(b.text));
  return list;
}

function renderTasks(){
  taskListEl.innerHTML = "";
  remainingList.innerHTML = "";
  completedList.innerHTML = "";

  const list = getFilteredTasks();
  list.forEach(t => {
    const node = document.importNode(taskTemplate, true);
    const li = node.querySelector('li');
    li.dataset.id = t.id;
    const title = li.querySelector('.task-title');
    const cat = li.querySelector('.task-category');
    const due = li.querySelector('.task-due');
    const toggleBtn = li.querySelector('.toggle-btn');
    const priorityBadge = li.querySelector('.priority-badge');
    const editBtn = li.querySelector('.edit-btn');
    const deleteBtn = li.querySelector('.delete-btn');

    title.textContent = t.text;
    cat.textContent = t.category ? t.category : "";
    due.textContent = t.due ? "Due: " + formatDate(t.due) : "";
    priorityBadge.className = "priority-badge " + (t.priority ? "priority-" + t.priority : "");
    priorityBadge.textContent = (t.priority || "").toUpperCase();

    if (t.completed){
      li.classList.add('task-completed');
      toggleBtn.textContent = "✔";
      toggleBtn.style.background = "linear-gradient(90deg,#a7f3d0,#34d399)";
    } else {
      toggleBtn.textContent = "◻";
      toggleBtn.style.background = "transparent";
    }

    // overdue indicator
    if (isOverdue(t.due) && !t.completed){
      due.style.color = "var(--danger)";
      due.textContent += " • overdue";
    }

    // events
    toggleBtn.onclick = ()=> { toggleComplete(t.id); };
    editBtn.onclick = ()=> { openEditDialog(t.id); };
    deleteBtn.onclick = ()=> { deleteTask(t.id); };

    taskListEl.appendChild(li);

    // also update mini lists
    const mini = document.createElement('li'); mini.textContent = t.text + (t.due ? " — " + formatDate(t.due) : "");
    if (t.completed) completedList.appendChild(mini); else remainingList.appendChild(mini);
  });

  updateStats();
  collectCategories();
}

/* ---------- CRUD ---------- */
function addTaskFromForm(e){
  e && e.preventDefault();
  const text = (taskText.value||"").trim();
  if (!text) { taskText.focus(); return; }
  const newTask = {
    id: uid(),
    text,
    completed: false,
    priority: prioritySelect.value || "medium",
    category: (categoryInput.value||"").trim() || null,
    due: dueInput.value || null,
    created: Date.now()
  };
  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
  // clear input but keep category
  taskText.value = ""; dueInput.value = "";
  taskText.focus();
}

function toggleComplete(id){
  const idx = tasks.findIndex(t=>t.id===id);
  if (idx<0) return;
  tasks[idx].completed = !tasks[idx].completed;
  saveTasks(); renderTasks();
}

function deleteTask(id){
  if (!confirm("Delete this task?")) return;
  tasks = tasks.filter(t=>t.id!==id);
  saveTasks(); renderTasks();
}

function openEditDialog(id){
  const t = tasks.find(x=>x.id===id);
  if (!t) return;
  const newText = prompt("Edit task text:", t.text);
  if (newText === null) return;
  t.text = newText.trim() || t.text;
  const newPriority = prompt("Priority (low/medium/high):", t.priority) || t.priority;
  t.priority = ["low","medium","high"].includes(newPriority) ? newPriority : t.priority;
  const newCat = prompt("Category (leave blank to remove):", t.category||"");
  t.category = newCat.trim() || null;
  const newDue = prompt("Due date (YYYY-MM-DD) or blank:", t.due||"");
  t.due = newDue.trim() || null;
  saveTasks(); renderTasks();
}

/* ---------- Bulk actions ---------- */
clearCompletedBtn.onclick = ()=> {
  if (!confirm("Remove all completed tasks?")) return;
  tasks = tasks.filter(t => !t.completed);
  saveTasks(); renderTasks();
};
clearAllBtn.onclick = ()=> {
  if (!confirm("Delete ALL tasks? This cannot be undone.")) return;
  tasks = [];
  saveTasks(); renderTasks();
};

/* ---------- Event wiring ---------- */
taskForm.addEventListener('submit', addTaskFromForm);
searchInput.addEventListener('input', renderTasks);
filterSelect.addEventListener('change', renderTasks);
sortSelect.addEventListener('change', renderTasks);

/* keyboard: Enter in search toggles focus; Esc clears search */
searchInput.addEventListener('keydown', (e)=> {
  if (e.key === 'Escape') { searchInput.value=''; renderTasks(); }
});

/* initialize */
(function init(){
  // set year
  const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();
  renderTasks();
})();
