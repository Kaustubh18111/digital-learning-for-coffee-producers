# CoffeeLearn (Static HTML + Firebase Rebuild)

This version re-engineers the original Flask/SQLite app into a static multi-page application (MPA) powered by Firebase Authentication and Firestore.

## Tech Stack
- Pure HTML/CSS/JS (no build step required)
- Firebase Hosting (optional), Firestore, Authentication

## Structure
```
index.html            # Login / Signup page
dashboard.html        # Protected dashboard
courses.html          # Lists courses from Firestore
course_detail.html    # Displays selected course & modules
forum.html            # Community posts (CRUD limited)
css/style.css         # Shared styles
js/firebase-init.js   # Firebase SDK + config
js/main.js            # Auth guard + fragment loader
js/auth.js            # Login/Signup logic
js/dashboard.js       # Dashboard data population
js/courses.js         # Course list rendering
js/course_detail.js   # Course & modules display
js/forum.js           # Forum posts fetch & create
fragments/navbar.html # Reusable nav
fragments/footer.html # Reusable footer
firestore.rules       # Firestore security rules
firebase.json         # Hosting rewrites
README_HTML.md        # This documentation
 - (Removed deprecated Tools page)
```

## Firebase Setup
1. Install Firebase CLI if deploying:
```bash
npm install -g firebase-tools
```
2. Login and init (if not already):
```bash
firebase login
firebase init hosting
```
Skip overwriting existing `firebase.json`.

## Local Preview
You can simply open `index.html` in a browser for a static preview. Auth and Firestore calls require serving over `http://` or from Firebase Hosting (due to origin security). Recommended:
```bash
python3 -m http.server 8080
# Then visit http://localhost:8080/index.html
```

## Authentication Flow
- `index.html` loads `firebase-init.js` and `auth.js` only.
- After login/signup, redirect to `dashboard.html`.
- `main.js` guards protected pages: redirects unauthenticated users to `index.html`.

## Firestore Collections (Expected)
- `users/{uid}`: `{ username?, email }`
- `courses/{courseId}`: `{ title, description }`
  - Subcollection `modules/{moduleId}`: `{ title, video_url }`
- `posts/{postId}`: `{ title, content, userId, createdAt }`

## Adding Courses/Modules
You can use the built-in hardcoded course or add documents in the Firebase Console. Ensure `video_url` uses the embed format: `https://www.youtube.com/embed/VIDEO_ID`.

### Option A: Built-in hardcoded course
- ID: `low-intervention-farming`
- Modules stored client-side with localStorage progress. Accessible at:
  - `courses.html` (shows a card)
  - `course_detail.html?id=low-intervention-farming`

### Option B: Manual Firestore course (example)
1. In Firebase Console → Firestore Database, click “Start collection”
   - Collection ID: `courses`
   - Next → Document ID: Auto-ID
   - Add fields:
     - `title` (string): `Low Intervention Farming`
     - `description` (string): `A course on low-intervention and regenerative farming principles.`
   - Save
2. Open the new course document → “Start collection”
   - Collection ID: `modules`
   - Next → Document ID: Auto-ID
   - Add fields:
     - `title` (string): `Introduction to Low Intervention`
     - `video_url` (string): `https://www.youtube.com/embed/8q_1dD3G1-s`
   - Save
3. Refresh your site:
   - `courses.html` will list the course
   - Clicking it opens `course_detail.html` and shows the video

## Security Rules
See `firestore.rules` for basic protections. Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Hosting Deployment
```bash
firebase deploy --only hosting
```

## Roadmap / Next Steps
- Add user progress tracking (`userProgress` collection)
- Add delete/edit for forum posts
- Implement course completion metrics
- Replace placeholder module titles
- Add image uploads via Firebase Storage
 - Deprecated `tools.html` page and related navbar/rewrite removed.

## Notes
Original Python/Flask backend removed. All dynamic logic now client-side. Remove unused backend files (`app.py`, `models.py`, `extensions.py`, `templates/`, `static/`).
