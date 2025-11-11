import { auth, db, collection, addDoc, getDocs, onAuthStateChanged, query, orderBy } from './firebase-init.js';

const postsList = document.getElementById('posts-list');
const newPostForm = document.getElementById('new-post-form');
const redditList = document.getElementById('reddit-posts'); // Might be null in new layout

const renderPosts = async () => {
  if (!postsList) return;
  postsList.innerHTML = '<li>Loading posts...</li>';
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      postsList.innerHTML = '<li>Be the first to ask a question!</li>';
      return;
    }
    postsList.innerHTML = '';
    snap.forEach(docSnap => {
      const post = docSnap.data();
      const li = document.createElement('li');
      li.className = 'post-item';
      li.innerHTML = `
        <h4>${post.title || 'Untitled'}</h4>
        <div class="meta">By ${post.userId || 'Unknown'}${post.createdAt ? ' • ' + new Date(post.createdAt.seconds * 1000).toLocaleString() : ''}</div>
        <p>${post.content || ''}</p>
      `;
      postsList.appendChild(li);
    });
  } catch (e) {
    console.error('Error loading posts', e);
    postsList.innerHTML = '<li>Error loading posts.</li>';
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    renderPosts();
  } else if (postsList) {
    postsList.innerHTML = '<li>You must be logged in to view discussions.</li>';
    if (newPostForm) newPostForm.style.display = 'none';
  }
});

if (newPostForm) {
  newPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('You must be logged in to post.');
      return;
    }
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    if (!title || !content) return;
    try {
      await addDoc(collection(db, 'posts'), {
        title,
        content,
        userId: auth.currentUser.uid,
        createdAt: new Date()
      });
      newPostForm.reset();
      renderPosts();
    } catch (e) {
      console.error('Error creating post', e);
    }
  });
}
