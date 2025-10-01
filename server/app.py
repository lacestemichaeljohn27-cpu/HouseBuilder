from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import bcrypt
import re
import os

app = Flask(__name__)
CORS(app)  # allow frontend JS to call API

# -------------------------
# Config: MySQL Connection
# -------------------------
db = mysql.connector.connect(
    host="localhost",        # Your MySQL host
    port=3306,
    user="root",             # Your MySQL username
    password="password",     # Your MySQL password
    database="housebuilder"  # Your database name
)
cursor = db.cursor(dictionary=True)

MODELS_DIR = "models"

# -------------------------
# Helpers
# -------------------------
def hash_password(password: str) -> str:
    """Generate salted bcrypt hash"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def check_password(password: str, hashed: str) -> bool:
    """Check bcrypt password"""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def valid_email(email: str) -> bool:
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

# -------------------------
# Routes
# -------------------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    confirm_password = data.get("confirmPassword", "").strip()

    # Validation
    if not all([name, email, password, confirm_password]):
        return jsonify({"success": False, "message": "All fields are required"}), 400

    if not valid_email(email):
        return jsonify({"success": False, "message": "Invalid email format"}), 400

    if len(password) < 4:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    if password != confirm_password:
        return jsonify({"success": False, "message": "Passwords do not match"}), 400

    # Check if email already exists
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        return jsonify({"success": False, "message": "Email already exists"}), 400

    # Insert into DB with bcrypt hash
    password_hash = hash_password(password)
    cursor.execute(
        "INSERT INTO users (full_name, email, password_hash, created_at) VALUES (%s, %s, %s, NOW())",
        (name, email, password_hash)
    )
    db.commit()

    return jsonify({"success": True, "message": "User registered successfully!"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not all([email, password]):
        return jsonify({"success": False, "message": "Email and password are required"}), 400

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user or not check_password(password, user["password_hash"]):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": user["full_name"]
    })

# -------------------------
# Serve Models (GLB + DAE)
# -------------------------
@app.route("/models/<path:filename>")
def serve_model(filename):  
    return send_from_directory(MODELS_DIR, filename)

# -------------------------
# Run Server
# -------------------------
if __name__ == "__main__":
    os.makedirs(MODELS_DIR, exist_ok=True)
    app.run(debug=True)
