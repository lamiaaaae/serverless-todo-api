const API_URL = "https://8vhpmfwx2g.execute-api.us-east-1.amazonaws.com/prod/tasks";

// Load all tasks
async function loadTasks() {
  try {
    console.log('🔄 Starting to load tasks...');
    const res = await fetch(API_URL);
    console.log('📡 GET response:', res.status, res.statusText);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const tasks = await res.json();
    console.log('📋 Tasks loaded:', tasks);
    
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    
    tasks.forEach(task => {
      const li = document.createElement("li");
     
      // Task text
      const span = document.createElement("span");
      span.textContent = task.title;
      if (task.completed) span.classList.add("done");
     
      // Toggle button (change completed state)
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = task.completed ? "❌ Not done" : "✅ Done";
      toggleBtn.onclick = () => toggleTask(task);
     
      // Edit button
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️ Edit";
      editBtn.onclick = () => editTask(task, li);
     
      // Delete button
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️ Delete";
      delBtn.onclick = () => deleteTask(task.id);
     
      li.append(span, " ", toggleBtn, " ", editBtn, " ", delBtn);
      list.appendChild(li);
    });
    
    console.log('✅ UI updated with', tasks.length, 'tasks');
  } catch (error) {
    console.error('❌ Error loading tasks:', error);
    alert('Error loading tasks: ' + error.message);
  }
}

// Add a task
async function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) return alert("Please enter a title!");
  
  const id = Date.now().toString();
  const newTask = { id, title, completed: false };
  
  try {
    console.log('➕ Adding task:', newTask);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(newTask)
    });
    
    console.log('📡 POST response:', response.status, response.statusText);
    const responseData = await response.text();
    console.log('📡 POST response data:', responseData);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseData}`);
    }
    
    document.getElementById("taskTitle").value = "";
    console.log('🔄 Reloading tasks after add...');
    await loadTasks();
  } catch (error) {
    console.error('❌ Error adding task:', error);
    alert('Error adding task: ' + error.message);
  }
}

// Toggle task completion
async function toggleTask(task) {
  try {
    console.log('🔄 Toggling task:', task.id, 'from', task.completed, 'to', !task.completed);
    const updatedTask = { 
      title: task.title, 
      completed: !task.completed 
    };
    
    const response = await fetch(`${API_URL}/${task.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(updatedTask)
    });
    
    console.log('📡 PUT response (toggle):', response.status, response.statusText);
    const responseData = await response.text();
    console.log('📡 PUT response data (toggle):', responseData);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseData}`);
    }
    
    console.log('🔄 Reloading tasks after toggle...');
    await loadTasks();
  } catch (error) {
    console.error('❌ Error updating task:', error);
    alert('Error updating task: ' + error.message);
  }
}

// Edit task title
function editTask(task, liElement) {
  console.log('✏️ Editing mode for task:', task.id);
  liElement.innerHTML = "";
  
  const input = document.createElement("input");
  input.type = "text";
  input.value = task.title;
  input.style.width = "300px";
  
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾 Save";
  saveBtn.onclick = async () => {
    const newTitle = input.value.trim();
    if (!newTitle) {
      alert("Title cannot be empty!");
      return;
    }
    
    const updatedTask = {
      title: newTitle,
      completed: task.completed
    };
    
    try {
      console.log('💾 Saving task:', task.id, 'with:', updatedTask);
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(updatedTask)
      });
      
      console.log('📡 PUT response (edit):', response.status, response.statusText);
      const responseData = await response.text();
      console.log('📡 PUT response data (edit):', responseData);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseData}`);
      }
      
      console.log('🔄 Reloading tasks after save...');
      await loadTasks();
    } catch (error) {
      console.error('❌ Error saving task:', error);
      alert('Error saving task: ' + error.message);
    }
  };
  
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "❌ Cancel";
  cancelBtn.onclick = () => {
    console.log('❌ Edit cancelled');
    loadTasks();
  };
  
  liElement.append(input, " ", saveBtn, " ", cancelBtn);
  input.focus();
}

// Delete task
async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }
  
  try {
    console.log('🗑️ Deleting task:', id);
    const response = await fetch(`${API_URL}/${id}`, { 
      method: "DELETE",
      headers: {
        "Accept": "application/json"
      }
    });
    
    console.log('📡 DELETE response:', response.status, response.statusText);
    const responseData = await response.text();
    console.log('📡 DELETE response data:', responseData);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseData}`);
    }
    
    console.log('🔄 Reloading tasks after deletion...');
    await loadTasks();
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    alert('Error deleting task: ' + error.message);
  }
}

// API connection test
async function testAPI() {
  console.log('🧪 Testing API...');
  try {
    const response = await fetch(API_URL);
    console.log('🧪 GET test:', response.status, response.statusText);
    const data = await response.text();
    console.log('🧪 Received data:', data);
  } catch (error) {
    console.error('🧪 API test error:', error);
  }
}

// Load tasks on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Application started');
  testAPI(); // Initial test
  loadTasks();
});

// Allow Enter key to add task
document.addEventListener('DOMContentLoaded', function() {
  const taskInput = document.getElementById('taskTitle');
  if (taskInput) {
    taskInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addTask();
      }
    });
  }
});

// Manual debug function (call from console)
window.debugTask = function(id) {
  console.log('🔍 Manual debug for task:', id);
  fetch(`${API_URL}/${id}`)
    .then(r => r.text())
    .then(data => console.log('🔍 Task data:', data))
    .catch(e => console.error('🔍 Debug error:', e));
};

console.log('📋 Todo App Debug version loaded');
