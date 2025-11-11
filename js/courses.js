import { db, getDocs, collection } from './firebase-init.js';
import { HARDCODED_COURSE } from './hardcoded-course.js';

const loadCourses = async () => {
  const grid = document.getElementById('course-grid');
  let html = '';
  try {
    const querySnapshot = await getDocs(collection(db, 'courses'));

    if (querySnapshot.empty && !HARDCODED_COURSE) {
      grid.innerHTML = '<p>No courses are available yet.</p>';
      return;
    }

    // Render Firestore courses
    querySnapshot.forEach((docSnap) => {
      const course = docSnap.data();
      html += `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${course.title}</h5>
              <p class="card-text small text-muted flex-grow-1">${course.description || ''}</p>
              <a href="course_detail.html?id=${docSnap.id}" class="btn btn-success mt-auto">Start Learning</a>
            </div>
          </div>
        </div>
      `;
    });

    // Render hardcoded course
    html += `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${HARDCODED_COURSE.title}</h5>
            <p class="card-text small text-muted flex-grow-1">${HARDCODED_COURSE.description}</p>
            <a href="course_detail.html?id=${HARDCODED_COURSE.id}" class="btn btn-success mt-auto">Start Learning</a>
          </div>
        </div>
      </div>
    `;

    grid.innerHTML = html;
  } catch (error) {
    console.error('Error loading courses:', error);
    grid.innerHTML = '<p>Error loading courses. Please try again later.</p>';
  }
};

loadCourses();
