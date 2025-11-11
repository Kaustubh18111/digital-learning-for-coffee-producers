import { HARDCODED_COURSE } from './hardcoded-course.js';
import { markModuleComplete, isModuleCompleted, getProgressSummary } from './progress.js';

let player;
let currentModuleId = null;

const titleEl = document.getElementById('course-title');
const titleSidebarEl = document.getElementById('course-title-sidebar');
const descEl = document.getElementById('course-description');
const modulesList = document.getElementById('modules-list');
const progressSummaryEl = document.getElementById('progress-summary');

function updateProgressUI() {
  const s = getProgressSummary();
  if(progressSummaryEl) progressSummaryEl.textContent = `Progress: ${s.done}/${s.total} (${s.percent}%)`;

  HARDCODED_COURSE.modules.forEach(mod => {
    const checkbox = document.getElementById(`check-${mod.id}`);
    if (checkbox && isModuleCompleted(mod.id)) {
      checkbox.checked = true;
    }
  });
}

function loadModule(moduleId) {
  const mod = HARDCODED_COURSE.modules.find(m => m.id === moduleId);
  if (!mod) return;
  currentModuleId = mod.id;

  if (player) {
    player.loadVideoById(mod.video_id);
  } else {
    player = new YT.Player('youtube-player', {
      height: '100%', // Will be controlled by CSS
      width: '100%', // Will be controlled by CSS
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
  if (event.data == YT.PlayerState.ENDED) {
    if (currentModuleId) {
      markModuleComplete(currentModuleId);
      updateProgressUI();
    }
  }
}

window.onYouTubeIframeAPIReady = function() {
  if (HARDCODED_COURSE.modules.length > 0) {
    loadModule(HARDCODED_COURSE.modules[0].id);
  }
};

function renderPage() {
  const course = HARDCODED_COURSE;
  if (!titleEl || !titleSidebarEl || !descEl || !modulesList) return;

  titleEl.textContent = course.title;
  titleSidebarEl.textContent = course.title;
  descEl.textContent = course.description;

  modulesList.innerHTML = '';
  course.modules.forEach((mod, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action module-item';
    if(index === 0) li.classList.add('active');
    li.dataset.moduleId = mod.id;

    li.innerHTML = `
      <input type="checkbox" class="form-check-input" id="check-${mod.id}" ${isModuleCompleted(mod.id) ? 'checked' : ''} disabled>
      <span>${mod.title}</span>
    `;

    li.addEventListener('click', () => {
      loadModule(mod.id);
    });

    modulesList.appendChild(li);
  });

  updateProgressUI();
}

document.addEventListener('DOMContentLoaded', () => {
  renderPage();
  // Bootstrap tabs are now handled automatically by the Bootstrap JS bundle
});
