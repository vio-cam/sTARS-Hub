import { auth, createTask, onGetTasks, deleteTask, getTask, updateTask } from "./config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');
const btnCancel = document.getElementById('btn-task-cancel');
const btnLogout = document.getElementById('logout');
const loadingSpinner = document.getElementById('loadingSpinner');
const saludoContainer = document.getElementById('saludo');
const postImage = document.getElementById('task-file');

let editStatus = false; 
let id = ''; 

window.addEventListener('DOMContentLoaded', async () => {
    loadingSpinner.style.display = 'block';

    const saludoContainer = document.getElementById('saludo');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            
            const userName = user.displayName || user.email.split('@')[0];
            const userAvatar = user.photoURL || './Recursos/usuario.png';
            

            saludoContainer.innerHTML = `
            <div class="d-flex align-items-center">
            <div class="card text-center p-4 shadow-lg" style="width: 18rem;">
                <div class="user-circle mx-auto mb-3">

                <img src="${userAvatar}" alt="${userName}" class="rounded-circle" width="40">
                <h4 class="card-title">
                <span class="ms-2">Hola, ${userName}</span></h4>

                </div>
                <p class="card-text text-muted">Bienvenido de nuevo</p>
                </div>
            `;
            onGetTasks((querySnapshot) => {
                tasksContainer.innerHTML = ''; 
                querySnapshot.forEach((doc) => {
                    const task = doc.data();
                    const isOwner = task.uid === user.uid;    
                    const createdAt = task.createdAt.toDate().toLocaleString();
                    tasksContainer.innerHTML += `
                        <div id="comentario" class="card my-3 shadow-sm" style="width: 600px; height: 500px; margin: 0 auto;">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <img src="${task.userAvatar}" alt="${task.userName}" class="rounded-circle me-3" width="50" height="50">
                                    <div>
                                        <h5 class="card-title mb-0">${task.userName}</h5>
                                        <small class="text-muted">${createdAt}</small>
                                    </div>
                                </div>
                                <h3 class="h5" id="titulo">${task.title}</h3>
                                <p class="card-text mt-2" id="descripción">${task.description}</p>

                                <!-- Imagen principal estilo IG -->
                                <div class="card mt-3 text-center" style="max-width: 500px; margin: 0 auto;">
                                    <img src="${task.imageUrl}" alt="Imagen de ${task.userName}" class="img-fluid rounded" style="width: 500px; height: 300px; object-fit: cover;">
                                </div>
                                </div>
                            </div>
                            
                        </div>

                            ${isOwner ? `
                            <div class="mt-3 text-center botones">
                                <button class="btn btn-warning btn-edit" data-id="${doc.id}">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="btn btn-danger btn-delete" data-id="${doc.id}">
                                    <i class="bi bi-trash3-fill"></i>
                                </button>
                            </div>` : ''}
                        </div>`;
                });

                loadingSpinner.style.display = 'none';

                  // Listener para botones de eliminar
                  const btnsDelete = tasksContainer.querySelectorAll('.btn-delete');
                  btnsDelete.forEach(btn => {
                      btn.addEventListener('click', function (event) {
                          const taskId = event.target.dataset.id;
                          deleteTask(taskId);
                      });
                  });
  
                  // Listener para botones de editar
                  const btnsEdit = tasksContainer.querySelectorAll('.btn-edit');
                  btnsEdit.forEach(btn => {
                      btn.addEventListener('click', async function (event) {
                          const taskId = event.target.dataset.id;
                          const doc = await getTask(taskId);
                          const task = doc.data();
  
                          taskForm['task-title'].value = task.title;
                          taskForm['task-description'].value = task.description;
  
                          editStatus = true;
                          id = doc.id;
                          console.log(doc.id);
                          
                          taskForm['btn-task-save'].innerText = 'Update';
                          btnCancel.style.display = 'inline'; 
                      });
                  });
              });
        } else {
            console.log("Usuario no autenticado.");
            window.location.href = 'index.html';
        }
    });
});

btnLogout.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("Cierre de sesión exitoso.");
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("No se pudo cerrar sesión. Intenta de nuevo.");
    }
});

taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = taskForm['task-title'].value;
    const description = taskForm['task-description'].value;
    const user = auth.currentUser;
    const image = postImage.files[0];
    const userName = user.displayName || user.email.split('@')[0];
    const userAvatar = user.photoURL || './Recursos/usuario.png';

    if (user) {
        const uid = user.uid;
        if (editStatus) {
            await updateTask(taskId, { title, description });
            editStatus = false;
            taskForm['btn-task-save'].innerText = 'Save';
            btnCancel.style.display = 'none';
        } else {
            await createTask(title, description, uid, userName, userAvatar, image);
        }
        taskForm.reset();
    } else {
        alert("Debes iniciar sesión para poder guardar tareas.");
    }
});

btnCancel.addEventListener('click', () => {
    taskForm.reset();
    editStatus = false;
    taskId = '';
    taskForm['btn-task-save'].innerText = 'Save';
    btnCancel.style.display = 'none';
});
