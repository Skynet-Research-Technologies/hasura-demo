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

  let user;
  if (!username) {
    user = users['guest'];
  } else if (users[username] && users[username].password === password) {
    // valid credentials
    user = users[username];
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // For demo, assign each user to the first organisation
  const tenantId = organisations[0].id;

  // Create JWT with user claims
  const token = jwt.sign(
    {
      'claims.jwt.hasura.io': {
        'x-hasura-allowed-roles': ['admin', 'user', 'guest'],
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
});

const server = app.listen(APP_PORT, () => {
  console.log(`Auth server running on http://localhost:${APP_PORT}`);
});

module.exports = {
  app,
  closeServer: () => server.close()
};

// Mock user database (replace with your actual user management)
const users = {
  'admin': {
    id: 'user-a1b2c3d4e5f6g7h8i9j0k1l2',
    username: 'admin',
    password: 'adminpass',
    role: 'admin'
  },
  'user': {
    id: 'user-b2c3d4e5f6g7h8i9j0k1l2m3',
    username: 'user',
    password: 'userpass',
    role: 'user'
  },
  'guest': {
    id: 'user-c3d4e5f6g7h8i9j0k1l2m3n4',
    username: 'guest',
    password: 'guestpass',
    role: 'guest',
  }
};

// Mock organisations database
const organisations = [
  {
    id: 'org-b1e2e2e2e2e2e2e2e2e2e2e2e',
    name: 'Acme Corp'
  },
  {
    id: 'org-c2f3f3f3f3f3f3f3f3f3f3f3f',
    name: 'Globex Solutions'
  },
  {
    id: 'org-d3a4a4a4a4a4a4a4a4a4a4a4a',
    name: 'Umbrella Group'
  }
];
