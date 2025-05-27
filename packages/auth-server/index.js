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

  // For demo, assign each user to the first organisation
  const tenantId = organisations[0].id;

  if (user) {
    // Create JWT with user claims
    const token = jwt.sign(
      {
        'claims.jwt.hasura.io': {
          'x-hasura-allowed-roles': ['admin', 'user', 'public'],
          'x-hasura-default-role': user.role,
          'x-hasura-user-id': user.id.toString(),
          'x-hasura-tenant-id': tenantId
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

// Mock organisations database
const organisations = [
  {
    id: 'b1e2e2e2e2e2e2e2e2e2e2e2e',
    name: 'Acme Corp'
  },
  {
    id: 'c2f3f3f3f3f3f3f3f3f3f3f3f',
    name: 'Globex Solutions'
  },
  {
    id: 'd3a4a4a4a4a4a4a4a4a4a4a4a',
    name: 'Umbrella Group'
  }
];
