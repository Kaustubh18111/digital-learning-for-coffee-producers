import { db, getDocs, collection } from './firebase-init.js';
import { HARDCODED_COURSE } from './hardcoded-course.js';

const loadCourses = async () => {
  const grid = document.getElementById('course-grid');
  let html = '';
  try {
    const querySnapshot = await getDocs(collection(db, 'courses'));
    if (querySnapshot.empty) {
      grid.innerHTML = '<p>No courses are available yet.</p>';
      return;
    }
    querySnapshot.forEach((docSnap) => {
      const course = docSnap.data();
      html += `
        <div class="course-card">
          <div class="thumb">IMG</div>
          <h3>${course.title}</h3>
          <p>${course.description || ''}</p>
          <a href="course_detail.html?id=${docSnap.id}" class="btn small">Start Learning</a>
        </div>
      `;
    });
    // Append hardcoded course if not already present (avoid duplicates by checking title match)
    const exists = html.includes(HARDCODED_COURSE.title);
    if (!exists) {
      html += `
        <div class="course-card">
          <div class="thumb">IMG</div>
          <h3>${HARDCODED_COURSE.title}</h3>
          <p>${HARDCODED_COURSE.description}</p>
          <a href="course_detail.html?id=${HARDCODED_COURSE.id}" class="btn small">Start Learning</a>
        </div>
      `;
    }
    grid.innerHTML = html;
  } catch (error) {
    console.error('Error loading courses:', error);
    grid.innerHTML = '<p>Error loading courses. Please try again later.</p>';
  }
};

loadCourses();
