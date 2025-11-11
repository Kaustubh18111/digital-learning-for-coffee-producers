import { auth, onAuthStateChanged, signOut } from './firebase-init.js';

const loadFragments = async () => {
  // Load Sidebar
  const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
  if (sidebarPlaceholder) {
    const response = await fetch('fragments/sidebar.html');
    const html = await response.text();
    sidebarPlaceholder.innerHTML = html;

    // Add logout functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
          localStorage.removeItem('guest_mode');
          window.location.href = 'index.html';
        } catch (error) {
          console.error('Error logging out:', error);
        }
      });
    }

    // Highlight the active nav link based on current page
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    const map = {
      'dashboard.html': 'nav-dashboard',
      'courses.html': 'nav-courses',
      'course_detail.html': 'nav-courses',
      'forum.html': 'nav-forum'
    };
    const activeId = map[page];
    if (activeId) {
      const link = document.getElementById(activeId);
      if (link) link.classList.add('active');
    }
  }

  // Load Footer
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    const response = await fetch('fragments/footer.html');
    footerPlaceholder.innerHTML = await response.text();
  }
};

onAuthStateChanged(auth, (user) => {
  const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
  const guestMode = localStorage.getItem('guest_mode') === '1';

  if (user) {
    if (isLoginPage) {
      window.location.href = 'dashboard.html';
    }
  } else {
    if (guestMode) {
      // Allow navigation without redirect for guest
      if (isLoginPage) {
        window.location.href = 'dashboard.html';
      }
      return; // Skip redirect if guest
    }
    if (!isLoginPage) {
      window.location.href = 'index.html';
    }
  }
});

document.addEventListener('DOMContentLoaded', loadFragments);
