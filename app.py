from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
# from flask_login import LoginManager, login_required  # TODO: integrate Flask-Login later

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-placeholder-key'  # TODO: Replace with secure key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coffee.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Import models after db initialization to avoid circular imports
try:
    from models import User, Course, Module, Quiz, UserProgress, ForumPost, ForumReply  # noqa: E401,F401
except ImportError:
    # Models file may not exist yet during initial scaffold creation
    pass

# ROUTES --------------------------------------------------------------------
@app.route('/')
def login_page():
    return render_template('login.html')

@app.route('/dashboard')
# @login_required  # Placeholder for future auth protection
def dashboard():
    return render_template('dashboard.html')

@app.route('/courses')
# @login_required
def courses():
    return render_template('courses.html')

@app.route('/course/<int:course_id>')
# @login_required
def course_detail(course_id):
    # TODO: Query actual course & modules
    return render_template('course_detail.html', course_id=course_id)

@app.route('/forum')
# @login_required
def forum():
    return render_template('forum.html')

@app.route('/tools')
# @login_required
def tools():
    return render_template('tools.html')

# API / FORM HANDLERS -------------------------------------------------------
@app.route('/api/login', methods=['POST'])
def api_login():
    # TODO: Implement real authentication
    # Accept both form-encoded and JSON data
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    return jsonify({'status': 'ok', 'message': 'Login placeholder', 'data_received': data}), 200

@app.route('/api/signup', methods=['POST'])
def api_signup():
    # TODO: Implement signup logic
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    return jsonify({'status': 'ok', 'message': 'Signup placeholder', 'data_received': data}), 201

@app.route('/api/new_post', methods=['POST'])
def api_new_post():
    # TODO: Implement forum post creation
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    return jsonify({'status': 'ok', 'message': 'New forum post placeholder', 'data_received': data}), 201

# ---------------------------------------------------------------------------
if __name__ == '__main__':
    # Ensure tables exist (placeholder; models must be defined first)
    try:
        with app.app_context():
            db.create_all()
    except Exception as e:
        print(f"Warning: could not create tables yet: {e}")
    app.run(debug=True)
