# Digital Learning Platform for Coffee Producers (Functional MVP)

A Flask + SQLAlchemy + Flask-Login web application. This functional MVP lets users sign up, log in, view courses, and create forum posts.

## Features Implemented
- Secure user authentication (signup, login, logout) with hashed passwords (Flask-Bcrypt)
- Session management with Flask-Login
- Dynamic course listing and course detail pages with modules
- Forum with ability to create posts tied to logged-in users
- CLI commands to initialize and seed the database
- Flash messaging for user feedback

## Tech Stack
| Layer | Technology |
|-------|------------|
| Web Framework | Flask |
| ORM/DB | SQLAlchemy + SQLite (coffee.db) |
| Auth | Flask-Login + Flask-Bcrypt |
| Templates | Jinja2 |
| Styling | Custom CSS |

## Project Structure
```
/ 
├── app.py                 # Main Flask app with routes & CLI commands
├── models.py              # SQLAlchemy models (User, Course, Module, etc.)
├── requirements.txt       # Python dependencies
├── static/
│   ├── style.css          # Global styles (includes flash message styles)
│   └── script.js          # Placeholder for future interactivity
└── templates/
  ├── base.html          # Layout with navbar & flashes
  ├── login.html         # Auth (login + signup)
  ├── dashboard.html     # User dashboard
  ├── courses.html       # Course library (dynamic)
  ├── course_detail.html # Single course page (dynamic modules)
  ├── forum.html         # Forum with dynamic posts
  └── tools.html         # Tools placeholder
```

## 1. Setup Environment
Create and activate a virtual environment.

```bash
python3 -m venv .venv
source .venv/bin/activate  # zsh / bash
```

## 2. Install Dependencies
```bash
pip install -r requirements.txt
```

## 3. Initialize the Database
```bash
flask --app app initdb
```

## 4. Seed Sample Data (Users, Courses, Modules, Forum Post)
```bash
flask --app app seed
```

## 5. Run the Development Server
```bash
python app.py
# or
flask --app app run --debug
```

Visit: http://127.0.0.1:5000

## Default Seeded User
Username: Kaustubh  
Email: test@example.com  
Password: password123

## Security Notes
- Change `SECRET_KEY` in `app.py` before deploying.
- Use environment variables for secrets in production.
- Consider Flask-Migrate for schema evolution.

## Next Steps / Roadmap
- Add password reset + email verification
- Per-course enrollment & progress tracking UI
- Quiz submission & grading logic
- Forum replies & pagination
- Role-based admin panel for content management

## License
Add your chosen license here (MIT, Apache-2.0, etc.).
