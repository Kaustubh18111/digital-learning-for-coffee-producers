import { HARDCODED_COURSE } from './hardcoded-course.js';
import { markModuleComplete, isModuleCompleted, getProgressSummary } from './progress.js';

let player; // This will be our YouTube Player object
let currentModuleId = null; // Track which module is playing

const titleEl = document.getElementById('course-title');
const titleSidebarEl = document.getElementById('course-title-sidebar');
const descEl = document.getElementById('course-description');
const modulesList = document.getElementById('modules-list');
const progressSummaryEl = document.getElementById('progress-summary');

// 1. Function to update the progress text
function updateProgressUI() {
  const s = getProgressSummary();
  progressSummaryEl.textContent = `Progress: ${s.done}/${s.total} (${s.percent}%)`;
  
  // Update checkboxes
  HARDCODED_COURSE.modules.forEach(mod => {
    const checkbox = document.getElementById(`check-${mod.id}`);
    if (checkbox && isModuleCompleted(mod.id)) {
      checkbox.checked = true;
    }
  });
}

// 2. Function to load a module's video
function loadModule(moduleId) {
  const mod = HARDCODED_COURSE.modules.find(m => m.id === moduleId);
  if (!mod) return;

  currentModuleId = mod.id;

  if (player) {
    player.loadVideoById(mod.video_id);
  } else {
    // Player isn't ready, load it (this runs for the first video)
    player = new YT.Player('youtube-player', {
      height: '450',
      width: '100%',
      videoId: mod.video_id,
      playerVars: { 'playsinline': 1 },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }

  // Update active state in sidebar
  document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
  const activeLi = document.querySelector(`li[data-module-id="${mod.id}"]`);
  if (activeLi) activeLi.classList.add('active');
}

// 3. This is the YouTube API event handler
function onPlayerStateChange(event) {
  // If video has 'ENDED'
  if (event.data == YT.PlayerState.ENDED) {
    if (currentModuleId) {
      markModuleComplete(currentModuleId); // Mark it complete
      updateProgressUI(); // Update the UI
    }
  }
}

// 4. This global function is called by the YouTube API script
window.onYouTubeIframeAPIReady = function() {
  // Load the first module
  loadModule(HARDCODED_COURSE.modules[0].id);
};

// 5. Function to render the whole page on load
function renderPage() {
  const course = HARDCODED_COURSE; // We only have one course
  titleEl.textContent = course.title;
  titleSidebarEl.textContent = course.title;
  descEl.textContent = course.description;

  // Render module list in sidebar
  modulesList.innerHTML = '';
  course.modules.forEach(mod => {
    const li = document.createElement('li');
    li.className = 'module-item';
    li.dataset.moduleId = mod.id; // Store ID for click
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `check-${mod.id}`;
    checkbox.checked = isModuleCompleted(mod.id);
    checkbox.disabled = true; // Disable checkbox, make it display-only
    
    const label = document.createElement('span');
    label.textContent = mod.title;

    li.appendChild(checkbox);
    li.appendChild(label);
    
    // Click to load video
    li.addEventListener('click', () => {
      loadModule(mod.id);
    });
    
    modulesList.appendChild(li);
  });

  updateProgressUI(); // Set initial progress text
}

// --- New Tab Switching Logic ---
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

// --- Load everything ---
document.addEventListener('DOMContentLoaded', () => {
  // We can't call renderPage() immediately, 
  // we must wait for the YouTube API to call onYouTubeIframeAPIReady()
  // So we just init the tabs here.
  initTabs();
  
  // We need to manually call renderPage here so the sidebar
  // and titles load *before* the YouTube API is ready.
  renderPage();
});
