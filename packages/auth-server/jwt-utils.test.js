'use strict';

/**
 * Tests for JWT token utilities
 * 
 * This file tests the exported utility functions from test-utils.js
 * which can be used by other packages for both testing and production.
 */

const {
  createJwtToken,
  createAdminToken,
  createUserToken,
  createGuestToken,
  verifyToken
} = require('./jwt-utils');

describe('JWT Token Utilities', () => {
  // Set a test secret for consistent test runs
  const TEST_SECRET = 'test-secret-key';

  it('creates a JWT token with Hasura claims', () => {
    const token = createJwtToken({
      userId: 'test-123',
      role: 'user',
      allowedRoles: ['user', 'guest'],
      tenantId: 'test-tenant-id',
      username: 'test-user',
      customClaims: {},
      secret: TEST_SECRET,
      expiresIn: '1h'
    });

    expect(token).toBeDefined();

    // Verify token structure
    const decoded = verifyToken(token, TEST_SECRET);
    expect(decoded).toHaveProperty(['claims.jwt.hasura.io']);
    expect(decoded['claims.jwt.hasura.io']).toHaveProperty('x-hasura-user-id', 'test-123');
    expect(decoded['claims.jwt.hasura.io']).toHaveProperty('x-hasura-default-role', 'user');
  });

  it('creates an admin token with proper role', () => {
    const token = createAdminToken(TEST_SECRET);
    const decoded = verifyToken(token, TEST_SECRET);

    expect(decoded['claims.jwt.hasura.io']).toHaveProperty('x-hasura-default-role', 'admin');
    expect(decoded['claims.jwt.hasura.io']['x-hasura-allowed-roles']).toContain('admin');
  });

  it('creates a user token with tenant ID', () => {
    const userId = 'user-456';
    const tenantId = 'tenant-abc';
    const token = createUserToken(userId, tenantId, TEST_SECRET);
    const decoded = verifyToken(token, TEST_SECRET);

    expect(decoded['claims.jwt.hasura.io']).toHaveProperty('x-hasura-user-id', userId);
    expect(decoded['claims.jwt.hasura.io']).toHaveProperty('x-hasura-tenant-id', tenantId);
    expect(decoded['claims.jwt.hasura.io']).toHaveProperty('x-hasura-default-role', 'user');
  });

  it('creates a guest token with limited permissions', () => {
    const token = createGuestToken(TEST_SECRET);
    const decoded = verifyToken(token, TEST_SECRET);

    expect(decoded['claims.jwt.hasura.io']).toHaveProperty('x-hasura-default-role', 'guest');
  });

  it('supports custom claims in the token', () => {
    const customClaims = {
      'x-hasura-custom-claim': 'custom-value',
      'x-hasura-org-id': 'org-123'
    };

    const token = createJwtToken({
      userId: 'test-user',
      role: 'user',
      allowedRoles: ['user', 'guest'],
      tenantId: 'test-tenant',
      username: 'test-username',
      customClaims,
      secret: TEST_SECRET,
      expiresIn: '1h'
    });

    const decoded = verifyToken(token, TEST_SECRET);
    expect(decoded['claims.jwt.hasura.io']).toHaveProperty('x-hasura-custom-claim', 'custom-value');
    expect(decoded['claims.jwt.hasura.io']).toHaveProperty('x-hasura-org-id', 'org-123');
  });

  it('throws an error when verifying with wrong secret', () => {
    const token = createJwtToken({
      userId: 'test-user',
      role: 'user',
      allowedRoles: ['user', 'guest'],
      tenantId: 'test-tenant',
      username: 'test-username',
      customClaims: {},
      secret: TEST_SECRET,
      expiresIn: '1h'
    });
    
    expect(() => {
      verifyToken(token, 'wrong-secret');
    }).toThrow();
  });
});
