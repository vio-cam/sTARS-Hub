import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, onSnapshot, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvxv85SHoDCIqYyFGy04eplrAMkjZVLoU",
    authDomain: "proyecto-u4-1bbe1.firebaseapp.com",
    projectId: "proyecto-u4-1bbe1",
    storageBucket: "proyecto-u4-1bbe1.appspot.com",
    messagingSenderId: "232521822491",
    appId: "1:232521822491:web:f33ec6ebf15c51b566e3be",
    measurementId: "G-N3KJVZR8MC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export function registerUser(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then(() => window.location.href = 'welcome.html')
        .catch((error) => alert("Error al registrar: " + error.message));
}

export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
        .then(() => window.location.href = 'welcome.html')
        .catch((error) => alert("Error al iniciar sesión: " + error.message));
}

export function loginWithGoogle() {
    return signInWithPopup(auth, provider)
        .then(() => window.location.href = 'welcome.html')
        .catch((error) => alert("Error al iniciar sesión con Google: " + error.message));
}

export function createTask(title, description, uid, userName, userAvatar, image) {
    let imageUrl = null;

    if (image) {
        const storageRef = ref(storage, `images/${image.name}`);
        return uploadBytes (storageRef, image).then (function(snapshot){ 
            return getDownloadURL(snapshot.ref);
        }).then (function(url){
            imageUrl = url
            return savePost (title, description, uid, userName, userAvatar, imageUrl)
        })
    }
}
function savePost(title, description, uid, userName, userAvatar, imageUrl) {
    const post = {
        title: title,
        description: description,
        uid: uid,
        userName: userName,
        userAvatar: userAvatar,
        imageUrl: imageUrl,
        createdAt: new Date(),
        likes: []
    };
    return addDoc(collection(db, 'tasks'), post);
}
export function getTasks() {
    return getDocs(collection(db, 'tasks'));
}

export function onGetTasks(callback) {
    return onSnapshot(collection(db, 'tasks'), callback);
}

export function getTask(id) {
    return getDoc(doc(db, 'tasks', id));
}

export function updateTask(id, newFields) {
    return updateDoc(doc(db, 'tasks', id), newFields);
}

export function deleteTask(id) {
    return deleteDoc(doc(db, "tasks", id));
}




export { auth, db, storage };
