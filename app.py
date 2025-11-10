from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, logout_user, login_required, current_user

app = Flask(__name__)
app.config['SECRET_KEY'] = 'a-very-secret-key-that-you-must-change'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coffee.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from extensions import db, bcrypt
db.init_app(app)
bcrypt.init_app(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login_page'
login_manager.login_message_category = 'info'

# Import models after db/bcrypt initialized to avoid circular import issues
from models import User, Course, Module, Quiz, UserProgress, ForumPost, ForumReply

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# AUTHENTICATION ROUTES --------------------------------------------------
@app.route('/')
def login_page():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/signup', methods=['POST'])
def handle_signup():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')

    if User.query.filter_by(username=username).first():
        flash('Username already exists.', 'danger')
        return redirect(url_for('login_page'))
    if User.query.filter_by(email=email).first():
        flash('Email already registered.', 'danger')
        return redirect(url_for('login_page'))

    new_user = User(username=username, email=email)
    new_user.password = password
    db.session.add(new_user)
    db.session.commit()

    login_user(new_user)
    flash('Account created successfully!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/login', methods=['POST'])
def handle_login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    username = request.form.get('username')
    password = request.form.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        login_user(user)
        return redirect(url_for('dashboard'))
    else:
        flash('Invalid username or password.', 'danger')
        return redirect(url_for('login_page'))

@app.route('/logout')
@login_required
def handle_logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login_page'))

# MAIN APP ROUTES -------------------------------------------------------
@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', username=current_user.username)

@app.route('/courses')
@login_required
def courses():
    all_courses = Course.query.all()
    return render_template('courses.html', courses=all_courses)

@app.route('/course/<int:course_id>')
@login_required
def course_detail(course_id):
    course = Course.query.get_or_404(course_id)
    return render_template('course_detail.html', course=course)

@app.route('/forum')
@login_required
def forum():
    posts_with_users = db.session.query(ForumPost, User).join(User, ForumPost.user_id == User.id).order_by(ForumPost.id.desc()).all()
    return render_template('forum.html', posts_with_users=posts_with_users)

@app.route('/new_post', methods=['POST'])
@login_required
def new_post():
    title = request.form.get('title')
    content = request.form.get('content')
    if not title or not content:
        flash('Title and content are required.', 'danger')
        return redirect(url_for('forum'))
    post = ForumPost(title=title, content=content, user_id=current_user.id)
    db.session.add(post)
    db.session.commit()
    flash('New post created!', 'success')
    return redirect(url_for('forum'))

@app.route('/tools')
@login_required
def tools():
    return render_template('tools.html')

# DATABASE SETUP COMMANDS ----------------------------------------------
@app.cli.command('initdb')
def init_db_command():
    """Creates the database tables."""
    with app.app_context():
        db.create_all()
    print('Initialized the database.')

@app.cli.command('seed')
def seed_db_command():
    """Seeds the database with sample data."""
    with app.app_context():
        db.session.query(ForumPost).delete()
        db.session.query(UserProgress).delete()
        db.session.query(Quiz).delete()
        db.session.query(Module).delete()
        db.session.query(Course).delete()
        db.session.query(User).delete()

        user1 = User(username='Kaustubh', email='test@example.com')
        user1.password = 'password123'
        db.session.add(user1)
        course1 = Course(title='Scientific Coffee Processing', description='Explore fermentation science and drying optimization.')
        course2 = Course(title='Soil Health', description='Improve nutrient cycling and soil structure.')
        course3 = Course(title='Pest Management', description='Identify and respond to common coffee pests.')
        playlist_course = Course(title='Coffee Production Video Series', description='Curated YouTube playlist covering coffee production topics.')
        db.session.add_all([course1, course2, course3, playlist_course])
        db.session.commit()

        mod1_1 = Module(title='Introduction to Fermentation', video_url='https://www.youtube.com/embed/dQw4w9WgXcQ', course_id=course1.id)
        mod1_2 = Module(title='Understanding Drying Curves', video_url='https://www.youtube.com/embed/dQw4w9WgXcQ', course_id=course1.id)
        mod2_1 = Module(title='Composting Strategies', video_url='https://www.youtube.com/embed/dQw4w9WgXcQ', course_id=course2.id)
        playlist_module = Module(title='Playlist Overview', video_url='https://www.youtube.com/embed/videoseries?list=PLdGYyxCUP1CXok8WekAxSETrlgPo_yfgA', course_id=playlist_course.id)
        db.session.add_all([mod1_1, mod1_2, mod2_1, playlist_module])
        db.session.commit()

        post1 = ForumPost(title='How to reduce over-fermentation?', content='I am having trouble with my beans tasting sour. Any tips?', user_id=user1.id)
        db.session.add(post1)
        db.session.commit()
    print('Database seeded with sample data.')

if __name__ == '__main__':
    app.run(debug=True)
