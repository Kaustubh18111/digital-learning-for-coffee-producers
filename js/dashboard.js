import { auth, db, onAuthStateChanged, doc, getDoc } from './firebase-init.js';
import { HARDCODED_COURSE } from './hardcoded-course.js';
import { getProgressSummary } from './progress.js';

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
    // Show progress for the hardcoded course
    const s = getProgressSummary();
    progressList.innerHTML = `
      <div class="course-card">
        <h4>${HARDCODED_COURSE.title}</h4>
        <p>${HARDCODED_COURSE.description}</p>
        <p><strong>Progress:</strong> ${s.done}/${s.total} (${s.percent}%)</p>
        <a class="btn small" href="course_detail.html?id=${HARDCODED_COURSE.id}">Continue</a>
      </div>
    `;
  } else if (guestMode) {
    usernameSpan.textContent = 'Guest';
    const s = getProgressSummary();
    progressList.innerHTML = `
      <div class="course-card">
        <h4>${HARDCODED_COURSE.title}</h4>
        <p>${HARDCODED_COURSE.description}</p>
        <p><strong>Progress:</strong> ${s.done}/${s.total} (${s.percent}%)</p>
        <a class="btn small" href="course_detail.html?id=${HARDCODED_COURSE.id}">Start</a>
      </div>
      <p class="muted">Guest mode stores progress in this browser only.</p>
    `;
  }
});
