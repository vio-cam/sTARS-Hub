import { auth, saveTask, getTasks, onGetTasks, deleteTask, getTask, updateTask } from "./config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');
const btnCancel = document.getElementById('btn-task-cancel');
const btnLogout = document.getElementById('logout');

let editStatus = false; // Bandera para el estado de edición
let id = ''; // ID de la tarea que se está editando

window.addEventListener('DOMContentLoaded', async function () {
    const loadingSpinner = document.getElementById('loadingSpinner');

    loadingSpinner.style.display = 'block';
    
    onAuthStateChanged(auth, function (user) {
        if (user) {
            console.log("Usuario autenticado:", user);

            // Mostrar el spinner antes de cargar las tareas
            

            // Aquí ya sabemos que el usuario está autenticado, por lo tanto podemos cargar las tareas
            onGetTasks(function (querySnapshot) {
                tasksContainer.innerHTML = '';

                querySnapshot.forEach(doc => {
                    const task = doc.data();
                    const taskOwner = task.uid; // El UID del creador de la tarea
                    const currentUser = user.uid; // El UID del usuario autenticado

                    if (taskOwner === currentUser) {
                        tasksContainer.innerHTML += `
                        <div class="card card-body mt-2">
                            <h3 class="h5">${task.title}</h3>
                            <p>${task.description}</p>
                            <div>
                                <button class='btn btn-warning btn-edit' data-id='${doc.id}'><i class="bi bi-pencil-square"></i></button>
                                <button class='btn btn-danger btn-delete' data-id='${doc.id}'><i class="bi bi-trash3-fill"></i></button>
                            </div>
                        </div>
                        `;
                    } else {
                        tasksContainer.innerHTML += `
                        <div class="card card-body mt-2">
                            <h3 class="h5">${task.title}</h3>
                            <p>${task.description}</p>
                        </div>
                        `;
                    }
                });

                // Ocultar el spinner después de cargar las tareas
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
                        taskForm['btn-task-save'].innerText = 'Update';
                        btnCancel.style.display = 'inline'; 
                    });
                });
            });
        } else {
            console.log("Usuario no autenticado.");
            window.location.href = 'index.html'; // Redirige si no hay usuario
        }
    });
});


// onAuthStateChanged para manejar la autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Usuario autenticado:", user);
    } else {
        console.log("Usuario no autenticado.");
        window.location.href = 'index.html'; // Redirige si no hay usuario
    }
});

// Cerrar sesión
btnLogout.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log("Cierre de sesión exitoso.");
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error("Error al cerrar sesión:", error);
            alert("No se pudo cerrar sesión. Intenta de nuevo.");
        });
});

// Manejar el envío del formulario de tareas
taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = taskForm['task-title'].value;
    const description = taskForm['task-description'].value;

    const user = auth.currentUser; // Obtener el usuario actual

    if (user) {
        const uid = user.uid; // Obtener el UID del usuario

        if (editStatus) {
            // Actualizar tarea existente
            updateTask(id, { title, description });
            editStatus = false;
            taskForm['btn-task-save'].innerText = 'Save';
            btnCancel.style.display = 'none';
        } else {
            // Guardar nueva tarea con el UID del usuario
            saveTask(title, description, uid);
        }
        taskForm.reset();
    } else {
        alert("Debes iniciar sesión para poder guardar tareas.");
    }
});

// Botón de cancelar edición
btnCancel.addEventListener('click', function () {
    taskForm.reset();
    editStatus = false;
    id = '';
    taskForm['btn-task-save'].innerText = 'Save';
    btnCancel.style.display = 'none';
});

auth.onAuthStateChanged(function (user) {
    const defaultAvatar = "https://via.placeholder.com/100"; // Avatar por defecto
    const avatars = document.getElementsByClassName('userAvatar');
    const usernames = document.getElementsByClassName('userName');

    // Verificamos si hay un usuario autenticado
    if (user) {
        const displayName = user.displayName || user.email.split('@')[0];
        const photoURL = user.photoURL || defaultAvatar;

        // Actualizamos el nombre del usuario en todos los elementos con la clase userName
        Array.from(usernames).forEach(username => {
            username.textContent = displayName;
        });

        // Recorremos todas las imágenes con la clase userAvatar y les asignamos la URL de la imagen
        Array.from(avatars).forEach(avatar => {
            avatar.setAttribute('src', photoURL);
        });
    } else {
        // Si no hay usuario, eliminamos el nombre y mostramos la imagen por defecto
        Array.from(usernames).forEach(username => {
            username.textContent = '';
        });

        Array.from(avatars).forEach(avatar => {
            avatar.setAttribute('src', defaultAvatar);
        });
    }
});
