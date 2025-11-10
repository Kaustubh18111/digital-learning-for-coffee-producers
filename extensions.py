from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Centralized extensions to avoid circular imports
db = SQLAlchemy()
bcrypt = Bcrypt()
