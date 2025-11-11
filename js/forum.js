import { auth, db, collection, addDoc, getDocs, onAuthStateChanged, query, orderBy } from './firebase-init.js';

const postsList = document.getElementById('posts-list');
const newPostForm = document.getElementById('new-post-form');
const redditList = document.getElementById('reddit-posts'); // This element is no longer used, but we'll check for it

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
      alert("You must be logged in to post.");
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
        createdAt: new Date() // Use JS Date, Firestore handles it
      });
      newPostForm.reset();
      renderPosts();
    } catch (e) {
      console.error('Error creating post', e);
    }
  });
}

// Fetch and render Reddit posts from r/IndiaCoffee
const renderReddit = async () => {
  if (!redditList) return; // Safely exit if element not found
  redditList.innerHTML = '<li>Loading Reddit posts...</li>';
  try {
    const res = await fetch('https://www.reddit.com/r/IndiaCoffee/.json?limit=10');
    if (!res.ok) throw new Error('Failed to load Reddit');
    const data = await res.json();
    const items = (data?.data?.children || []).filter(c => c && c.data);
    if (items.length === 0) {
      redditList.innerHTML = '<li>No Reddit posts found.</li>';
      return;
    }
    redditList.innerHTML = '';
    for (const { data: p } of items) {
      const li = document.createElement('li');
      li.className = 'post-item';
      const url = p.url_overridden_by_dest || ('https://www.reddit.com' + p.permalink);
      li.innerHTML = `
        <h4><a href="${url}" target="_blank" rel="noopener">${p.title || 'Untitled Reddit Post'}</a></h4>
        <div class="meta">by u/${p.author} • r/${p.subreddit} • ${p.ups} upvotes</div>
        <p class="muted">${p.selftext_html ? '' : ''}</p>
      `;
      redditList.appendChild(li);
    }
  } catch (e) {
    console.error('Error loading Reddit', e);
    redditList.innerHTML = '<li>Error loading Reddit posts.</li>';
  }
};

// Load Reddit posts always (guest and authed users)
renderReddit();
