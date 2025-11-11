import { auth, db, onAuthStateChanged, doc, getDoc } from './firebase-init.js';
import { HARDCODED_COURSE } from './hardcoded-course.js';
import { getProgressSummary } from './progress.js';

// Function to render the ApexChart
function renderProgressChart(summary) {
  const options = {
    chart: {
      type: 'radialBar',
      height: 520, // Increased vertical height
      sparkline: {
        enabled: false // Disable sparkline to allow standard padding
      }
    },
    series: [summary.percent],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: '97%',
        },
        dataLabels: {
          name: {
            show: true,
            offsetY: -10,
            fontSize: '1.2rem',
            color: '#888'
          },
          value: {
            offsetY: 5,
            fontSize: '2.5rem',
            color: '#111',
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      }
    },
    fill: {
      colors: ['#2f855a'] // Our --bs-primary color
    },
    stroke: {
      lineCap: 'round'
    },
    labels: [`${summary.done} / ${summary.total} Modules`],
  };

  const chartContainer = document.getElementById('chart-container');
  if (chartContainer) {
    chartContainer.innerHTML = ''; // Clear old chart
    const chart = new ApexCharts(chartContainer, options);
    chart.render();
  }
}

// Function to render the "Continue Learning" card
function renderProgressList(summary) {
  const progressList = document.getElementById('progress-list-minimal');
  if (progressList) {
    const s = summary;
    progressList.innerHTML = `
      <div class="d-flex flex-column h-100">
        <img src="${HARDCODED_COURSE.thumbnail}" class="card-img-top mb-3 rounded" alt="${HARDCODED_COURSE.title}">
        <h5 class="card-title">${HARDCODED_COURSE.title}</h5>
        <p class="card-text small text-muted">${HARDCODED_COURSE.description}</p>
        <div class="mt-auto">
          <div class="progress mb-2" style="height: 10px;">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${s.percent}%" aria-valuenow="${s.percent}"></div>
          </div>
          <p class="small mb-2"><strong>Progress:</strong> ${s.done}/${s.total} (${s.percent}%)</p>
          <a class="btn btn-success w-100" href="course_detail.html?id=${HARDCODED_COURSE.id}">
            ${s.done > 0 ? 'Continue Learning' : 'Start Course'}
          </a>
        </div>
      </div>
    `;
  }
}

// Main Auth Listener
onAuthStateChanged(auth, async (user) => {
  const usernameSpan = document.getElementById('username-placeholder');
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
    renderProgressChart(s);
    renderProgressList(s);

  } else if (guestMode) {
    usernameSpan.textContent = 'Guest';
    const s = getProgressSummary();
    renderProgressChart(s);
    renderProgressList(s);
  }
});
