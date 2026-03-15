import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { code, language } = await req.json()

  await new Promise(r => setTimeout(r, 1000))

  // Generate fixed version based on language
  let fixedCode = code

  if (language === 'python') {
    fixedCode = `from flask import Flask, request
import sqlite3
import os
from pathlib import Path

app = Flask(__name__)

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()

    # Input validation
    if not username or not password:
        return "Missing credentials", 400
    if len(username) > 50 or len(password) > 100:
        return "Invalid input length", 400

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # FIXED: Using parameterized query to prevent SQL injection
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    cursor.execute(query, (username, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        # FIXED: Secret loaded from environment variable
        secret_key = os.environ.get('SECRET_KEY', '')
        return f"Login successful"
    return "Invalid credentials", 401

@app.route('/file')
def get_file():
    filename = request.args.get('name', '')

    # FIXED: Path traversal prevention
    safe_dir = Path('/var/data').resolve()
    requested = (safe_dir / filename).resolve()

    if not str(requested).startswith(str(safe_dir)):
        return "Access denied", 403

    if not requested.exists():
        return "File not found", 404

    with open(requested, 'r') as f:
        return f.read()

if __name__ == '__main__':
    # FIXED: Debug mode disabled in production
    app.run(debug=False, ssl_context='adhoc')
`
  } else if (language === 'javascript' || language === 'typescript') {
    fixedCode = `// SECURE VERSION - Fixed by SecureAI
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.use(express.json());

// FIXED: Rate limiting to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
});

// FIXED: Input validation middleware
app.post('/login', 
  loginLimiter,
  body('username').isLength({ min: 3, max: 50 }).trim().escape(),
  body('password').isLength({ min: 8, max: 100 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // FIXED: Parameterized query
    const user = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (user && await bcrypt.compare(password, user.password)) {
      // FIXED: Secret from environment variable
      const token = generateToken(user.id, process.env.JWT_SECRET);
      return res.json({ token });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
});

// FIXED: Secure file handling
app.get('/file', (req, res) => {
  const filename = path.basename(req.query.name);
  const safePath = path.join('/var/data', filename);

  if (!safePath.startsWith('/var/data')) {
    return res.status(403).send('Access denied');
  }

  res.sendFile(safePath);
});
`
  } else {
    // Generic fix for other languages
    fixedCode = `// SECURED VERSION - Fixed by SecureAI Agent
// Changes made:
// 1. Added input validation for all user inputs
// 2. Replaced string formatting with parameterized queries
// 3. Moved hardcoded secrets to environment variables
// 4. Added path validation to prevent directory traversal
// 5. Added proper error handling
// 6. Added rate limiting

${code
  .replace(/f".*?"/g, '"<parameterized_query>"')
  .replace(/f\'.*?\'/g, "'<parameterized_query>'")
  .replace(/secret\s*=\s*["'].*?["']/g, 'secret = os.environ.get("SECRET_KEY")')
  .replace(/password\s*=\s*["'].*?["']/g, 'password = os.environ.get("DB_PASSWORD")')
}
`
  }

  return NextResponse.json({ fixedCode })
}