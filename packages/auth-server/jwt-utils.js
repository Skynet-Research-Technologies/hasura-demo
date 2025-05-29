'use strict';

/**
 * JWT token utilities for Hasura
 * 
 * This module provides functions to generate and verify JWT tokens with Hasura claims
 * for authentication and authorization scenarios. Although named "test-utils", 
 * these utilities can be used by other packages both in testing and production environments.
 */

const jwt = require('jsonwebtoken');

/**
 * Create a JWT token with Hasura claims
 * 
 * @param {Object} options - Options for creating the JWT
 * @param {String} options.userId - User ID to include in claims (required)
 * @param {String} options.role - Default role (admin, user, guest) (required)
 * @param {String[]} options.allowedRoles - Array of allowed roles (required)
 * @param {String} options.tenantId - Tenant ID to include in claims (required)
 * @param {String} options.username - Username to include in the token (required)
 * @param {Object} options.customClaims - Additional claims to include (optional)
 * @param {String} options.secret - Secret key for signing (required)
 * @param {String} options.expiresIn - Token expiration time (required)
 * @returns {String} JWT token string
 */
function createJwtToken({
  userId,
  role,
  allowedRoles,
  tenantId,
  username,
  customClaims,
  secret,
  expiresIn
}) {
  // Standard Hasura claims structure
  const hasuraClaims = {
    'x-hasura-allowed-roles': allowedRoles,
    'x-hasura-default-role': role,
    'x-hasura-user-id': userId,
    'x-hasura-tenant-id': tenantId,
    ...(customClaims || {})
  };

  // Create token with proper Hasura namespace
  return jwt.sign(
    {
      'claims.jwt.hasura.io': hasuraClaims,
      sub: userId,
      name: username
    },
    secret,
    {
      algorithm: 'HS256',
      expiresIn
    }
  );
}

/**
 * Create an admin token with full permissions
 * 
 * @param {String} secret - Secret key for signing (required)
 * @param {Object} customClaims - Additional claims to include (optional)
 * @returns {String} JWT token string
 */
function createAdminToken(secret, customClaims = {}) {
  return createJwtToken({
    userId: 'admin-user-id',
    role: 'admin',
    allowedRoles: ['admin', 'user', 'guest'],
    tenantId: 'admin-tenant-id',
    username: 'admin',
    customClaims,
    secret,
    expiresIn: '1h'
  });
}

/**
 * Create a user token with standard permissions
 * 
 * @param {String} userId - User ID to include (required)
 * @param {String} tenantId - Tenant ID to include (required)
 * @param {String} secret - Secret key for signing (required)
 * @param {Object} customClaims - Additional claims to include (optional)
 * @returns {String} JWT token string
 */
function createUserToken(
  userId,
  tenantId,
  secret,
  customClaims = {}
) {
  return createJwtToken({
    userId,
    role: 'user',
    allowedRoles: ['user', 'guest'],
    tenantId,
    username: userId,
    customClaims,
    secret,
    expiresIn: '1h'
  });
}

/**
 * Create a guest token with limited permissions
 * 
 * @param {String} secret - Secret key for signing (required)
 * @param {Object} customClaims - Additional claims to include (optional)
 * @returns {String} JWT token string
 */
function createGuestToken(secret, customClaims = {}) {
  return createJwtToken({
    userId: 'guest-user-id',
    role: 'guest',
    allowedRoles: ['guest'],
    tenantId: 'guest-tenant-id',
    username: 'guest',
    customClaims,
    secret,
    expiresIn: '1h'
  });
}

/**
 * Verify and decode a JWT token
 * 
 * @param {String} token - JWT token to verify (required)
 * @param {String} secret - Secret key used for verification (required)
 * @returns {Object} Decoded token payload
 */
function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

module.exports = {
  createJwtToken,
  createAdminToken,
  createUserToken,
  createGuestToken,
  verifyToken
};
