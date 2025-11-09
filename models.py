from app import db, bcrypt
from flask_login import UserMixin

# Models updated for functional MVP -----------------------------------------
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f"<User {self.username}>"

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<Course {self.title}>"


class Module(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    video_url = db.Column(db.String(255), nullable=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    course = db.relationship('Course', backref=db.backref('modules', lazy=True))

    def __repr__(self):
        return f"<Module {self.title}>"


class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    options = db.Column(db.Text, nullable=True)  # could store JSON string
    answer = db.Column(db.String(100), nullable=True)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), nullable=False)
    module = db.relationship('Module', backref=db.backref('quizzes', lazy=True))

    def __repr__(self):
        return f"<Quiz {self.id} for module {self.module_id}>"


class UserProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), nullable=False)
    completed = db.Column(db.Boolean, default=False)

    user = db.relationship('User', backref=db.backref('progress', lazy=True))
    module = db.relationship('Module', backref=db.backref('user_progress', lazy=True))

    def __repr__(self):
        return f"<UserProgress user={self.user_id} module={self.module_id} completed={self.completed}>"


class ForumPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('posts', lazy=True))

    def __repr__(self):
        return f"<ForumPost {self.title}>"


class ForumReply(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('forum_post.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('replies', lazy=True))
    post = db.relationship('ForumPost', backref=db.backref('replies', lazy=True))

    def __repr__(self):
        return f"<ForumReply {self.id} to post {self.post_id}>"
