import { auth, db, onAuthStateChanged, doc, getDoc } from './firebase-init.js';
import { HARDCODED_COURSE } from './hardcoded-course.js';
import { getProgressSummary } from './progress.js';

function renderModernProgress(container, summary) {
  // Donut chart dimensions
  const size = 160;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (summary.percent / 100) * circumference;

  container.innerHTML = `
    <div class="progress-grid">
      <div class="donut-wrapper">
        <svg class="donut" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle class="donut-bg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${stroke}" />
          <circle class="donut-fg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${stroke}"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" />
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="donut-label">${summary.percent}%</text>
        </svg>
      </div>
      <div class="progress-meta">
        <h4 class="course-title">${HARDCODED_COURSE.title}</h4>
        <p class="course-desc">${HARDCODED_COURSE.description}</p>
        <div class="bar-row">
          <div class="bar-track"><div class="bar-fill" style="width:${summary.percent}%;"></div></div>
          <span class="bar-text">${summary.done}/${summary.total} modules</span>
        </div>
        <a href="course_detail.html?id=${HARDCODED_COURSE.id}" class="btn small">${summary.done ? 'Continue' : 'Start Learning'}</a>
      </div>
    </div>
  `;
}

onAuthStateChanged(auth, async (user) => {
  const usernameSpan = document.getElementById('username-placeholder');
  const container = document.getElementById('progress-modern');
  const guestMode = localStorage.getItem('guest_mode') === '1';

  let displayName = 'Guest';
  if (user) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().username) {
        displayName = userDoc.data().username;
      } else {
        displayName = user.email;
      }
    } catch (e) {
      console.error('Error fetching user profile', e);
      if (user.email) displayName = user.email;
    }
  }
  usernameSpan.textContent = displayName;

  const summary = getProgressSummary();
  if (container) {
    renderModernProgress(container, summary);
  }
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    const bucket = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    greetingEl.innerHTML = `${bucket}, <span id="username-placeholder">${displayName}</span> \uD83D\uDC4B`;
  }
});
