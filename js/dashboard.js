import { auth, db, onAuthStateChanged, doc, getDoc } from './firebase-init.js';

onAuthStateChanged(auth, async (user) => {
  const usernameSpan = document.getElementById('username-placeholder');
  const progressList = document.getElementById('progress-list');
  const guestMode = localStorage.getItem('guest_mode') === '1';

  if (user) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
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
    progressList.innerHTML = '<p>Course progress tracking coming soon.</p>';
  } else if (guestMode) {
    usernameSpan.textContent = 'Guest';
    progressList.innerHTML = '<p>Guest mode: sign in to track your progress.</p>';
  }
});
