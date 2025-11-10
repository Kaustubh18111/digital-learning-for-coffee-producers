import { 
  auth, 
  db,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  doc,
  setDoc
} from './firebase-init.js';

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const flashMessage = document.getElementById('flash-message');

const showFlashMessage = (message, type = 'danger') => {
  if (!flashMessage) return;
  flashMessage.textContent = message;
  flashMessage.className = `alert ${type}`;
  flashMessage.style.display = 'block';
};

// Login Logic
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in main.js will handle redirect
      window.location.href = 'dashboard.html';
    } catch (error) {
      showFlashMessage(error.message, 'danger');
    }
  });
}

// Signup Logic
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save the username to a 'users/{uid}' doc in Firestore
      if (username) {
        await setDoc(doc(db, 'users', user.uid), { username, email });
      } else {
        await setDoc(doc(db, 'users', user.uid), { email });
      }
      window.location.href = 'dashboard.html';
    } catch (error) {
      showFlashMessage(error.message, 'danger');
    }
  });
}
