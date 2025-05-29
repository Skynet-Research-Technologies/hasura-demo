# Auth Server

This service provides authentication and JWT token generation for Hasura. It supports three roles:

- **admin**: Full access to all resources and actions.
- **user**: Standard user access, limited to their own data and permitted actions.
- **guest**: Minimal access, typically for unauthenticated or guest users.

Update the user management and JWT claims as needed to support these roles in your Hasura instance.

## Usage

### Server

```javascript
// Import the package
const authServer = require('@hasura-demo/auth-server');

// Start the server
const server = authServer.createServer(3333);

// Or access the Express app directly
const { app } = authServer;

// Close the server when needed
authServer.closeServer();
// Or if using createServer:
server.close();
```

### JWT Utilities

```javascript
// Import the entire package
const authServer = require('@hasura-demo/auth-server');

// Use the JWT utilities
const token = authServer.createJwtToken({
  userId: 'user-123',
  role: 'user',
  allowedRoles: ['user', 'guest'],
  tenantId: 'tenant-abc',
  username: 'testuser',
  secret: 'your-secret-key',
  expiresIn: '1h'
});

// Or use the shorthand JWT utilities
const adminToken = authServer.jwt.createAdminToken('your-secret-key');

// Import just the JWT utilities
const jwtUtils = require('@hasura-demo/auth-server/jwt');
const userToken = jwtUtils.createUserToken('user-123', 'tenant-abc', 'your-secret-key');
```

## Organisations

This service includes three randomly generated organisations for demonstration purposes:

- **Acme Corp**
- **Globex Solutions**
- **Umbrella Group**

Replace or extend these with your actual organisation management as needed.
