const express = require('express');
const { createJwtToken } = require('./jwt-utils');
require('dotenv').config();

// Secret key for signing JWTs (in production, use a secure, environment-based secret)
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
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

  // Create JWT with user claims using the utility function
  const token = createJwtToken({
    userId: user.id.toString(),
    role: user.role,
    tenantId: tenantId,
    username: user.username,
    secret: JWT_SECRET,
    expiresIn: '1h'
  });

  res.json({ token });
});

// Create server function for programmatic initialization
function createServer(port) {
  const serverPort = port
  const server = app.listen(serverPort, () => {
    console.log(`Auth server running on http://localhost:${serverPort}`);
  });
  
  return {
    app,
    close: () => server.close()
  };
}

module.exports = {
  app,
  createServer
};

if (require.main === module) {
  // If this file is run directly, start the server on a default port
  const port = process.env.PORT || 3000;
  const { close } = createServer(port);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    close();
    console.log('Server closed');
    process.exit(0);
  });
}

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
