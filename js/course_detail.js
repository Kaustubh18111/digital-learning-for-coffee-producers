import { HARDCODED_COURSE } from './hardcoded-course.js';
import { markModuleComplete, isModuleCompleted, getProgressSummary } from './progress.js';

let player; // YouTube Player instance
let currentModuleId = null; // Track which module is playing

const titleEl = document.getElementById('course-title');
const titleSidebarEl = document.getElementById('course-title-sidebar');
const descEl = document.getElementById('course-description');
const modulesList = document.getElementById('modules-list');
const progressSummaryEl = document.getElementById('progress-summary');

function updateProgressUI() {
  const s = getProgressSummary();
  progressSummaryEl.textContent = `Progress: ${s.done}/${s.total} (${s.percent}%)`;
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
      height: '450',
      width: '100%',
      videoId: mod.video_id,
      playerVars: { 'playsinline': 1 },
      events: { 'onStateChange': onPlayerStateChange }
    });
  }

  document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
  const activeLi = document.querySelector(`li[data-module-id="${mod.id}"]`);
  if (activeLi) activeLi.classList.add('active');
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    if (currentModuleId) {
      markModuleComplete(currentModuleId);
      updateProgressUI();
    }
  }
}

window.onYouTubeIframeAPIReady = function () {
  // Load the first module when API is ready
  loadModule(HARDCODED_COURSE.modules[0].id);
};

function renderPage() {
  const course = HARDCODED_COURSE;
  titleEl.textContent = course.title;
  if (titleSidebarEl) titleSidebarEl.textContent = course.title;
  descEl.textContent = course.description;

  modulesList.innerHTML = '';
  course.modules.forEach(mod => {
    const li = document.createElement('li');
    li.className = 'module-item';
    li.dataset.moduleId = mod.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `check-${mod.id}`;
    checkbox.checked = isModuleCompleted(mod.id);
    checkbox.disabled = true;

    const label = document.createElement('span');
    label.textContent = mod.title;

    li.appendChild(checkbox);
    li.appendChild(label);
    li.addEventListener('click', () => loadModule(mod.id));
    modulesList.appendChild(li);
  });

  updateProgressUI();
}

const initTabs = () => {
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabLinks.forEach(link => {
    link.addEventListener('click', () => {
      const tabId = link.getAttribute('data-tab');
      tabLinks.forEach(item => item.classList.remove('active'));
      tabPanels.forEach(item => item.classList.remove('active'));
      link.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderPage();
});
