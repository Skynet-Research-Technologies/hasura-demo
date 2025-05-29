'use strict';

/**
 * Example usage of auth-server package
 */

// Import the entire package
const authServer = require('./exports');

// Alternative import styles (commented out as examples):
// const { app, createServer, utils } = require('./exports');
// const { createJwtToken, createAdminToken } = require('./exports').utils;

// Start the server with a custom port
const server = authServer.createServer(3333);
console.log(`Server running on port ${server.port}`);

// Generate various tokens for testing
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Create a token with full options
const fullToken = authServer.utils.createJwtToken({
  userId: 'user-123',
  role: 'user',
  allowedRoles: ['user', 'guest'],
  tenantId: 'tenant-xyz',
  username: 'john.doe',
  customClaims: {
    'x-hasura-org-id': 'org-456'
  },
  secret: JWT_SECRET,
  expiresIn: '2h'
});

console.log('Full token:', fullToken);

// Use the JWT utility functions
const adminToken = authServer.utils.createAdminToken(JWT_SECRET);
console.log('Admin token:', adminToken);

const userToken = authServer.utils.createUserToken('user-456', 'tenant-abc', JWT_SECRET);
console.log('User token:', userToken);

const guestToken = authServer.utils.createGuestToken(JWT_SECRET);
console.log('Guest token:', guestToken);

// Verify a token
try {
  const decoded = authServer.utils.verifyToken(userToken, JWT_SECRET);
  console.log('Decoded token:', JSON.stringify(decoded, null, 2));
} catch (err) {
  console.error('Token verification failed:', err.message);
}

// Close the server when done
server.close();
console.log('Server closed');

// This is just an example - in a real scenario you would keep the server running
console.log('Note: In a real application, you would not close the server immediately.');
