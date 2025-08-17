const API_URL = "https://8vhpmfwx2g.execute-api.us-east-1.amazonaws.com/prod/tasks";

// Charger toutes les tâches
async function loadTasks() {
  try {
    console.log('🔄 Début chargement des tâches...');
    const res = await fetch(API_URL);
    console.log('📡 Réponse GET:', res.status, res.statusText);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const tasks = await res.json();
    console.log('📋 Tâches chargées:', tasks);
    
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    
    tasks.forEach(task => {
      const li = document.createElement("li");
     
      // Texte de la tâche
      const span = document.createElement("span");
      span.textContent = task.title;
      if (task.completed) span.classList.add("done");
     
      // Bouton Toggle (changer état)
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = task.completed ? "❌ Non fait" : "✅ Fait";
      toggleBtn.onclick = () => toggleTask(task);
     
      // Bouton Modifier
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️ Modifier";
      editBtn.onclick = () => editTask(task, li);
     
      // Bouton Supprimer
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️ Supprimer";
      delBtn.onclick = () => deleteTask(task.id);
     
      li.append(span, " ", toggleBtn, " ", editBtn, " ", delBtn);
      list.appendChild(li);
    });
    
    console.log('✅ Interface mise à jour avec', tasks.length, 'tâches');
  } catch (error) {
    console.error('❌ Erreur lors du chargement des tâches:', error);
    alert('Erreur lors du chargement des tâches: ' + error.message);
  }
}

// Ajouter une tâche
async function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) return alert("Veuillez entrer un titre !");
  
  const id = Date.now().toString();
  const newTask = { id, title, completed: false };
  
  try {
    console.log('➕ Ajout d\'une tâche:', newTask);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(newTask)
    });
    
    console.log('📡 Réponse POST:', response.status, response.statusText);
    const responseData = await response.text();
    console.log('📡 Données de réponse POST:', responseData);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseData}`);
    }
    
    document.getElementById("taskTitle").value = "";
    console.log('🔄 Rechargement après ajout...');
    await loadTasks();
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout:', error);
    alert('Erreur lors de l\'ajout: ' + error.message);
  }
}

// Modifier (toggle état completed)
async function toggleTask(task) {
  try {
    console.log('🔄 Toggle de la tâche:', task.id, 'de', task.completed, 'vers', !task.completed);
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
    
    console.log('📡 Réponse PUT (toggle):', response.status, response.statusText);
    const responseData = await response.text();
    console.log('📡 Données de réponse PUT (toggle):', responseData);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseData}`);
    }
    
    console.log('🔄 Rechargement après toggle...');
    await loadTasks();
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    alert('Erreur lors de la mise à jour: ' + error.message);
  }
}

// Modifier le titre
function editTask(task, liElement) {
  console.log('✏️ Mode édition pour la tâche:', task.id);
  liElement.innerHTML = "";
  
  const input = document.createElement("input");
  input.type = "text";
  input.value = task.title;
  input.style.width = "300px";
  
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾 Enregistrer";
  saveBtn.onclick = async () => {
    const newTitle = input.value.trim();
    if (!newTitle) {
      alert("Le titre ne peut pas être vide !");
      return;
    }
    
    const updatedTask = {
      title: newTitle,
      completed: task.completed
    };
    
    try {
      console.log('💾 Sauvegarde de la tâche:', task.id, 'avec:', updatedTask);
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(updatedTask)
      });
      
      console.log('📡 Réponse PUT (edit):', response.status, response.statusText);
      const responseData = await response.text();
      console.log('📡 Données de réponse PUT (edit):', responseData);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseData}`);
      }
      
      console.log('🔄 Rechargement après sauvegarde...');
      await loadTasks();
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
  };
  
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "❌ Annuler";
  cancelBtn.onclick = () => {
    console.log('❌ Annulation édition');
    loadTasks();
  };
  
  liElement.append(input, " ", saveBtn, " ", cancelBtn);
  input.focus();
}

// Supprimer
async function deleteTask(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
    return;
  }
  
  try {
    console.log('🗑️ Suppression de la tâche:', id);
    const response = await fetch(`${API_URL}/${id}`, { 
      method: "DELETE",
      headers: {
        "Accept": "application/json"
      }
    });
    
    console.log('📡 Réponse DELETE:', response.status, response.statusText);
    const responseData = await response.text();
    console.log('📡 Données de réponse DELETE:', responseData);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseData}`);
    }
    
    console.log('🔄 Rechargement après suppression...');
    await loadTasks();
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    alert('Erreur lors de la suppression: ' + error.message);
  }
}

// Test de connexion API
async function testAPI() {
  console.log('🧪 Test de l\'API...');
  try {
    const response = await fetch(API_URL);
    console.log('🧪 Test GET:', response.status, response.statusText);
    const data = await response.text();
    console.log('🧪 Données reçues:', data);
  } catch (error) {
    console.error('🧪 Erreur test API:', error);
  }
}

// Charger au démarrage
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Application démarrée');
  testAPI(); // Test initial
  loadTasks();
});

// Permettre d'ajouter une tâche avec la touche Entrée
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

// Fonction de debug manuel (à appeler dans la console)
window.debugTask = function(id) {
  console.log('🔍 Debug manuel pour tâche:', id);
  fetch(`${API_URL}/${id}`)
    .then(r => r.text())
    .then(data => console.log('🔍 Données tâche:', data))
    .catch(e => console.error('🔍 Erreur debug:', e));
};

console.log('📋 Todo App Debug version loaded');