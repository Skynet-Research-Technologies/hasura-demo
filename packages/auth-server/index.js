const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

const APP_PORT = process.env.APP_PORT || 3000;
// Secret key for signing JWTs (in production, use a secure, environment-based secret)
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());

// Login endpoint to generate JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find user (in a real app, use secure password hashing)
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Create JWT with user claims
    const token = jwt.sign(
      {
        'https://hasura.io/jwt/claims': {
          'x-hasura-allowed-roles': ['admin', 'user'],
          'x-hasura-default-role': user.role,
          'x-hasura-user-id': user.id.toString()
        },
        sub: user.id.toString(),
        name: user.username
      },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1h'
      }
    );

    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.listen(APP_PORT, () => {
  console.log(`Auth server running on http://localhost:${APP_PORT}`);
});

module.exports = app;

// Mock user database (replace with your actual user management)
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'adminpass',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: 'userpass',
    role: 'user'
  }
];
