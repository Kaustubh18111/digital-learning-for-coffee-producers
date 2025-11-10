import { auth, onAuthStateChanged, signOut } from './firebase-init.js';

const loadFragments = async () => {
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    const response = await fetch('fragments/navbar.html');
    const html = await response.text();
    navbarPlaceholder.innerHTML = html;

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
          window.location.href = 'index.html';
        } catch (error) {
          console.error('Error logging out:', error);
        }
      });
    }
  }

  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    const response = await fetch('fragments/footer.html');
    footerPlaceholder.innerHTML = await response.text();
  }
};

onAuthStateChanged(auth, (user) => {
  const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
  if (user) {
    if (isLoginPage) {
      window.location.href = 'dashboard.html';
    }
  } else {
    if (!isLoginPage) {
      window.location.href = 'index.html';
    }
  }
});

document.addEventListener('DOMContentLoaded', loadFragments);
