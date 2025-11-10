import { db, doc, getDoc, collection, getDocs } from './firebase-init.js';
import { HARDCODED_COURSE } from './hardcoded-course.js';
import { markModuleComplete, isModuleCompleted, getProgressSummary } from './progress.js';

const getCourseIdFromURL = () => new URLSearchParams(window.location.search).get('id');

const loadCourse = async () => {
  const courseId = getCourseIdFromURL();
  if (!courseId) return;

  const titleEl = document.getElementById('course-title');
  const descEl = document.getElementById('course-description');
  const videoContainer = document.getElementById('video-container');
  const modulesList = document.getElementById('modules-list');

  try {
    if (courseId === HARDCODED_COURSE.id) {
      // Render from hardcoded data
      titleEl.textContent = HARDCODED_COURSE.title;
      descEl.textContent = HARDCODED_COURSE.description;

      // Progress summary UI
      const progressInfo = document.createElement('p');
      const updateProgressInfo = () => {
        const s = getProgressSummary();
        progressInfo.textContent = `Progress: ${s.done}/${s.total} (${s.percent}%)`;
      };
      updateProgressInfo();
      modulesList.parentElement.insertBefore(progressInfo, modulesList);

      let firstVideo = null;
      HARDCODED_COURSE.modules.forEach((mod) => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isModuleCompleted(mod.id);
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            markModuleComplete(mod.id);
            updateProgressInfo();
          }
        });
        const label = document.createElement('span');
        label.textContent = ' ' + (mod.title || 'Untitled Module');
        li.appendChild(checkbox);
        li.appendChild(label);

        li.addEventListener('click', (e) => {
          // Avoid double-trigger when clicking checkbox
          if ((e.target || e.srcElement) !== checkbox) {
            if (mod.video_url) {
              videoContainer.innerHTML = `<iframe width="100%" height="315" src="${mod.video_url}" frameborder="0" allowfullscreen></iframe>`;
            }
          }
        });
        modulesList.appendChild(li);
        if (!firstVideo && mod.video_url) firstVideo = mod.video_url;
      });

      if (firstVideo) {
        videoContainer.innerHTML = `<iframe width="100%" height="315" src="${firstVideo}" frameborder="0" allowfullscreen></iframe>`;
      }
      return;
    }

    // Default: Firestore-backed course
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) {
      titleEl.textContent = 'Course not found';
      return;
    }
    const course = courseSnap.data();
    titleEl.textContent = course.title;
    descEl.textContent = course.description || '';

    const modulesRef = collection(db, 'courses', courseId, 'modules');
    const modulesSnap = await getDocs(modulesRef);

    let firstVideo = null;
    modulesSnap.forEach((modDoc) => {
      const mod = modDoc.data();
      const li = document.createElement('li');
      li.textContent = mod.title || 'Untitled Module';
      li.addEventListener('click', () => {
        if (mod.video_url) {
          videoContainer.innerHTML = `<iframe width="100%" height="315" src="${mod.video_url}" frameborder="0" allowfullscreen></iframe>`;
        }
      });
      modulesList.appendChild(li);
      if (!firstVideo && mod.video_url) firstVideo = mod.video_url;
    });

    if (firstVideo) {
      videoContainer.innerHTML = `<iframe width="100%" height="315" src="${firstVideo}" frameborder="0" allowfullscreen></iframe>`;
    }
  } catch (e) {
    console.error('Error loading course detail', e);
  }
};

loadCourse();
