// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js"; // Importar Firebase Storage

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCvxv85SHoDCIqYyFGy04eplrAMkjZVLoU",
    authDomain: "proyecto-u4-1bbe1.firebaseapp.com",
    projectId: "proyecto-u4-1bbe1",
    storageBucket: "proyecto-u4-1bbe1.appspot.com",
    messagingSenderId: "232521822491",
    appId: "1:232521822491:web:f33ec6ebf15c51b566e3be",
    measurementId: "G-N3KJVZR8MC"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Inicializar Firebase Storage
const provider = new GoogleAuthProvider();

// Función para registrar un nuevo usuario
export function registerUser(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("Registro exitoso. ¡Bienvenido!");
            window.location.href = 'welcome.html';
        })
        .catch((error) => {
            console.error("Error al registrar:", error.code, error.message);
            alert("Error al registrar: " + error.message);
        });
}

// Función para iniciar sesión
export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential);            
            console.log("Inicio de sesión exitoso. ¡Bienvenido!");
            window.location.href = 'welcome.html';
        })
        .catch((error) => {
            console.error("Error al iniciar sesión:", error.code, error.message);
            alert("Error al iniciar sesión: " + error.message);
        });
}

// Función para iniciar sesión con Google
export function loginWithGoogle() {
    return signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Inicio de sesión con Google exitoso. ¡Bienvenido!", result.user);
            window.location.href = 'welcome.html';
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google:", error.code, error.message);
            alert("Error al iniciar sesión con Google: " + error.message);
        });
}

// Función para agregar una tarea
export function saveTask(title, description, uid, userName, userAvatar) {
    console.log("Saving task:", title, description);
    return addDoc(collection(db, 'tasks'), {
        title: title,
        description: description,
        uid: uid,
        userName: userName,
        userAvatar: userAvatar
    });
}

// Función para obtener todas las tareas
export function getTasks() {
    console.log("Fetching tasks list");
    return getDocs(collection(db, 'tasks'));
}

// Función para escuchar en tiempo real los cambios en las tareas
export function onGetTasks(callback) {
    return onSnapshot(collection(db, 'tasks'), callback);
}

// Función para obtener una tarea específica
export function getTask(id) {
    console.log("Fetching task:", id);
    return getDoc(doc(db, 'tasks', id));
}

// Función para actualizar una tarea
export function updateTask(id, newFields) {
    console.log("Updating Task:", id);
    return updateDoc(doc(db, 'tasks', id), newFields);
}

// Función para eliminar una tarea
export function deleteTask(id) {
    console.log("Deleting task:", id);
    return deleteDoc(doc(db, "tasks", id));
}

// Exportar autenticación, base de datos y almacenamiento
export { auth, db, storage };
