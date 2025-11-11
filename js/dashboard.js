import { auth, db, onAuthStateChanged, doc, getDoc, collection, getDocs } from './firebase-init.js';
import { loadUserProgress, getCourseProgress } from './progress.js';

const usernameSpan = document.getElementById('username-placeholder');
const progressList = document.getElementById('progress-list-minimal');
const chartContainer = document.getElementById('chart-container');

function renderMainChart(allProgress) {
  let totalModules = 0;
  let totalDone = 0;
  allProgress.forEach(course => {
    totalDone += course.progress.done;
    totalModules += course.progress.total;
  });
  const overallPercent = totalModules === 0 ? 0 : Math.round((totalDone / totalModules) * 100);
  const options = {
    chart: { type: 'radialBar', height: 350, sparkline: { enabled: true } },
    series: [overallPercent],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: { background: '#e7e7e7', strokeWidth: '97%' },
        dataLabels: {
          name: { show: true, offsetY: -10, fontSize: '1.2rem', color: '#888' },
          value: { offsetY: 5, fontSize: '2.5rem', color: '#111', formatter: (val) => val + '%' }
        }
      }
    },
    fill: { colors: ['var(--bs-success)'] },
    stroke: { lineCap: 'round' },
    labels: [`${totalDone} / ${totalModules} Modules`]
  };
  if (chartContainer) {
    chartContainer.innerHTML = '';
    const chart = new ApexCharts(chartContainer, options);
    chart.render();
  }
}

function renderCourseCards(allProgress) {
  if (!progressList) return;
  if (allProgress.length === 0) {
    progressList.innerHTML = `
      <div class="col-12"><div class="alert alert-secondary mb-0">
        You haven't started any courses yet. <a href="courses.html" class="alert-link">Browse courses</a>
      </div></div>`;
    return;
  }
  let html = '';
  allProgress.forEach(course => {
    const s = course.progress;
    html += `
      <div class="col">
        <div class="card shadow-sm h-100">
          <img src="${course.thumbnail || ''}" class="card-img-top" alt="${course.title}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${course.title}</h5>
            <div class="mt-auto">
              <div class="progress mb-2" style="height: 10px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${s.percent}%" aria-valuenow="${s.percent}"></div>
              </div>
              <p class="small mb-2"><strong>Progress:</strong> ${s.done}/${s.total} (${s.percent}%)</p>
              <a class="btn btn-success w-100" href="course_detail.html?id=${course.id}">
                ${s.done > 0 ? 'Continue Learning' : 'Start Course'}
              </a>
            </div>
          </div>
        </div>
      </div>`;
  });
  progressList.innerHTML = html;
}

onAuthStateChanged(auth, async (user) => {
  const guestMode = localStorage.getItem('guest_mode') === '1';
  if (!user && !guestMode) {
    if (usernameSpan) usernameSpan.textContent = '...';
    if (progressList) progressList.innerHTML = '';
    if (chartContainer) chartContainer.innerHTML = '';
    return;
  }

  await loadUserProgress(user ? user.uid : null);

  // Gather list of started courses for logged-in users
  let allProgressData = [];
  if (user) {
    const progressRef = doc(db, 'users', user.uid, 'progress', 'all-courses');
    const progressSnap = await getDoc(progressRef);
    if (progressSnap.exists()) {
      const progressData = progressSnap.data();
      for (const courseId of Object.keys(progressData)) {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        if (!courseSnap.exists()) continue;
        const modulesRef = collection(db, 'courses', courseId, 'modules');
        const modulesSnap = await getDocs(modulesRef);
        const progress = getCourseProgress(courseId, modulesSnap.size);
        allProgressData.push({ id: courseId, ...courseSnap.data(), progress });
      }
    }
  } else if (guestMode) {
    // For guest mode, no way to know list of courses from Firestore; assume the single course path via local cache keys
    // This keeps dashboard minimal for guests
    // Skipping guest courses aggregation to avoid listing non-existent IDs
  }

  renderMainChart(allProgressData);
  renderCourseCards(allProgressData);

  if (usernameSpan) {
    usernameSpan.textContent = user ? (user.displayName || user.email) : 'Guest';
  }
});
