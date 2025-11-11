import { auth, db, doc, getDoc, collection, getDocs, query, orderBy, onAuthStateChanged } from './firebase-init.js';
import { loadUserProgress, markModuleComplete, isModuleCompleted, getCourseProgress } from './progress.js';

let player;
let currentModuleId = null;
let currentCourseId = null;
let courseModules = [];

const titleEl = document.getElementById('course-title');
const titleSidebarEl = document.getElementById('course-title-sidebar');
const descEl = document.getElementById('course-description');
const modulesList = document.getElementById('modules-list');
const progressSummaryEl = document.getElementById('progress-summary');

function updateProgressUI() {
  if (!currentCourseId) return;
  const s = getCourseProgress(currentCourseId, courseModules.length);
  if (progressSummaryEl) progressSummaryEl.textContent = `Progress: ${s.done}/${s.total} (${s.percent}%)`;
  courseModules.forEach(mod => {
    const checkbox = document.getElementById(`check-${mod.id}`);
    if (checkbox && isModuleCompleted(currentCourseId, mod.id)) {
      checkbox.checked = true;
    }
  });
}

function loadModule(moduleId) {
  const mod = courseModules.find(m => m.id === moduleId);
  if (!mod) return;
  currentModuleId = mod.id;
  if (player) {
    player.loadVideoById(mod.video_id);
  } else {
    player = new YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: mod.video_id,
      playerVars: { 'playsinline': 1, 'modestbranding': 1, 'rel': 0 },
      events: { 'onStateChange': onPlayerStateChange }
    });
  }
  document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
  const activeItem = document.querySelector(`li[data-module-id="${mod.id}"]`);
  if (activeItem) activeItem.classList.add('active');
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    if (currentCourseId && currentModuleId) {
      markModuleComplete(currentCourseId, currentModuleId);
      updateProgressUI();
    }
  }
}

window.onYouTubeIframeAPIReady = function () {
  if (courseModules.length > 0) {
    loadModule(courseModules[0].id);
  }
};

async function renderPage() {
  currentCourseId = new URLSearchParams(window.location.search).get('id');
  if (!currentCourseId) {
    if (titleEl) titleEl.textContent = 'Course not found.';
    return;
  }
  try {
    // Fetch Course Doc
    const courseRef = doc(db, 'courses', currentCourseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) {
      if (titleEl) titleEl.textContent = 'Course not found.';
      return;
    }
    const course = courseSnap.data();
    if (titleEl) titleEl.textContent = course.title;
    if (titleSidebarEl) titleSidebarEl.textContent = course.title;
    if (descEl) descEl.textContent = course.description;

    // Fetch Modules (ordered)
    const modulesRef = collection(db, 'courses', currentCourseId, 'modules');
    const modulesQuery = query(modulesRef, orderBy('order'));
    const modulesSnap = await getDocs(modulesQuery);
    courseModules = modulesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Render Modules list
    if (modulesList) {
      modulesList.innerHTML = '';
      courseModules.forEach((mod, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action module-item';
        if (index === 0) li.classList.add('active');
        li.dataset.moduleId = mod.id;
        li.innerHTML = `
          <input type="checkbox" class="form-check-input" id="check-${mod.id}" ${isModuleCompleted(currentCourseId, mod.id) ? 'checked' : ''} disabled>
          <span>${mod.title}</span>
        `;
        li.addEventListener('click', () => loadModule(mod.id));
        modulesList.appendChild(li);
      });
    }

    // Update initial progress UI
    updateProgressUI();
    // Load first video if API already ready
    if (typeof YT !== 'undefined' && YT.Player && courseModules.length) {
      loadModule(courseModules[0].id);
    }
  } catch (e) {
    console.error('Error loading course:', e);
    if (titleEl) titleEl.textContent = 'Error loading course.';
  }
}

function initTabs() {
  // Bootstrap handles tab activation; placeholder for any future custom logic
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  onAuthStateChanged(auth, async (user) => {
    await loadUserProgress(user ? user.uid : null);
    await renderPage();
  });
});
