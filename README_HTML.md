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
tools.html            # Placeholder tools area
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
You can manually add documents in the Firebase Console or seed using a temporary script (not included). Ensure `video_url` uses the embed format: `https://www.youtube.com/embed/VIDEO_ID`.

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

## Notes
Original Python/Flask backend removed. All dynamic logic now client-side. Remove unused backend files (`app.py`, `models.py`, `extensions.py`, `templates/`, `static/`).
