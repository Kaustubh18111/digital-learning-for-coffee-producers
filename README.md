# Digital Learning Platform for Coffee Producers

A minimal Flask + SQLite + HTML/CSS/JS skeleton for a digital learning platform.

## Features
- Flask backend with routes for login, dashboard, courses, course detail, forum, and tools
- Placeholder API endpoints for login, signup, and new forum post
- SQLite database configured via SQLAlchemy
- Basic templates and styling

## Project Structure
```
/ 
├── app.py                # Main Flask app
├── models.py             # SQLAlchemy models (placeholders)
├── requirements.txt      # Python dependencies
├── static/
│   ├── style.css         # Global styles
│   └── script.js         # Placeholder JS
└── templates/
    ├── base.html         # Layout with navbar/footer
    ├── login.html        # Auth page (standalone)
    ├── dashboard.html    # User dashboard
    ├── courses.html      # Course library
    ├── course_detail.html# Single course page
    ├── forum.html        # Q&A forum
    └── tools.html        # Tools placeholders
```

## Quick start
1) Create and activate a virtual environment (optional but recommended).

2) Install dependencies.

3) Run the app and open http://127.0.0.1:5000

### Commands
```bash
# 1) Create venv (optional)
python3 -m venv .venv
source .venv/bin/activate  # zsh / bash

# 2) Install deps
pip install -r requirements.txt

# 3) Run app
python app.py
```

## Notes
- This scaffold intentionally omits authentication and real data—add Flask-Login and proper user/session handling later.
- Replace SECRET_KEY in `app.py` for production.
- Run `python` and from a shell do:
  ```python
  from app import db
  db.create_all()
  ```
  to initialize tables once models are finalized.
