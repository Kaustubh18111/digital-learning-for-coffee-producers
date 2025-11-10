import { auth, db, collection, addDoc, getDocs, onAuthStateChanged, query, orderBy } from './firebase-init.js';

const postsList = document.getElementById('posts-list');
const newPostForm = document.getElementById('new-post-form');

const renderPosts = async () => {
  postsList.innerHTML = '<li>Loading posts...</li>';
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      postsList.innerHTML = '<li>No posts yet.</li>';
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
  }
});

if (newPostForm) {
  newPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();

    if (!title || !content) return;

    try {
      await addDoc(collection(db, 'posts'), {
        title,
        content,
        userId: auth.currentUser.uid,
        createdAt: { seconds: Math.floor(Date.now()/1000) }
      });
      newPostForm.reset();
      renderPosts();
    } catch (e) {
      console.error('Error creating post', e);
    }
  });
}
