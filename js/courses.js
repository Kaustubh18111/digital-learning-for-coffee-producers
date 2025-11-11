import { HARDCODED_COURSE } from './hardcoded-course.js';

const loadCourses = async () => {
  const grid = document.getElementById('course-grid');
  let html = '';

  // Only render the hardcoded course
  html += `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <img src="${HARDCODED_COURSE.thumbnail}" class="card-img-top" alt="${HARDCODED_COURSE.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${HARDCODED_COURSE.title}</h5>
          <p class="card-text small text-muted flex-grow-1">${HARDCODED_COURSE.description}</p>
          <a href="course_detail.html?id=${HARDCODED_COURSE.id}" class="btn btn-success mt-auto">Start Learning</a>
        </div>
      </div>
    </div>
  `;

  grid.innerHTML = html;
};

loadCourses();
