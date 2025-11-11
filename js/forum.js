import { auth, db, collection, addDoc, getDocs, onAuthStateChanged, query, orderBy } from './firebase-init.js';

const postsList = document.getElementById('posts-list');
const newPostForm = document.getElementById('new-post-form');
const redditList = document.getElementById('reddit-posts');

const renderPosts = async () => {
  if (!postsList) return;
  postsList.innerHTML = '<div class="list-group-item">Loading posts...</div>';
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      postsList.innerHTML = '<div class="list-group-item">No posts yet. Be the first!</div>';
      return;
    }
    postsList.innerHTML = '';
    snap.forEach(docSnap => {
      const post = docSnap.data();
      const postEl = document.createElement('a');
      postEl.href = "#";
      postEl.className = 'list-group-item list-group-item-action flex-column align-items-start';
      postEl.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">${post.title || 'Untitled'}</h5>
          <small class="text-muted">${post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : ''}</small>
        </div>
        <p class="mb-1">${post.content || ''}</p>
        <small class="text-muted">By ${post.userId || 'Unknown'}</small>
      `;
      postsList.appendChild(postEl);
    });
  } catch (e) {
    console.error('Error loading posts', e);
    postsList.innerHTML = '<div class="list-group-item text-danger">Error loading posts.</div>';
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

const renderReddit = async () => {
  if (!redditList) return;
  redditList.innerHTML = '<div class="list-group-item">Loading Reddit posts...</div>';
  const BASE = 'https://www.reddit.com/r/IndiaCoffee/.json?limit=5';
  const SOURCES = [
    BASE,
    'https://cors.isomorphic-git.org/' + BASE,
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(BASE),
    'https://corsproxy.io/?' + encodeURIComponent(BASE)
  ];
  const fetchWithFallback = async (urls) => {
    let lastError;
    for (const u of urls) {
      try {
        const res = await fetch(u, { cache: 'no-store' });
        if (!res.ok) { lastError = new Error('HTTP ' + res.status); continue; }
        return await res.json();
      } catch (e) { lastError = e; }
    }
    throw lastError || new Error('All fetch attempts failed');
  };
  try {
    const data = await fetchWithFallback(SOURCES);
    const items = (data?.data?.children || []).filter(c => c && c.data);
    if (items.length === 0) {
      redditList.innerHTML = '<div class="list-group-item">No Reddit posts found.</div>';
      return;
    }
    redditList.innerHTML = '';
    for (const { data: p } of items) {
      const postEl = document.createElement('a');
      postEl.className = 'list-group-item list-group-item-action';
      postEl.href = p.url_overridden_by_dest || ('https://www.reddit.com' + p.permalink);
      postEl.target = '_blank';
      postEl.rel = 'noopener';
      postEl.innerHTML = `
        <h6 class="mb-1 small">${p.title || 'Untitled Reddit Post'}</h6>
        <small class="text-muted">by u/${p.author} • ${p.ups} upvotes</small>
      `;
      redditList.appendChild(postEl);
    }
  } catch (e) {
    console.error('Error loading Reddit', e);
    redditList.innerHTML = '<div class="list-group-item text-danger">Error loading Reddit posts.</div>';
  }
};

// Load Reddit posts always (guest and authed users)
renderReddit();
