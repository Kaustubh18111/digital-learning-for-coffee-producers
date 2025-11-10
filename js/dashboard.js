import { auth, db, onAuthStateChanged, doc, getDoc } from './firebase-init.js';

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const usernameSpan = document.getElementById('username-placeholder');
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().username) {
        usernameSpan.textContent = userDoc.data().username;
      } else {
        usernameSpan.textContent = user.email;
      }
    } catch (e) {
      console.error('Error fetching user profile', e);
      usernameSpan.textContent = user.email;
    }

    const progressList = document.getElementById('progress-list');
    progressList.innerHTML = '<p>Course progress tracking coming soon.</p>';
  }
});
