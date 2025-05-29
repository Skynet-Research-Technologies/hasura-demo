'use strict';

/**
 * Module exports for @hasura-demo/auth-server
 * 
 * This file centralizes all exports from the auth-server package,
 * including the server and JWT utility functions.
 */

const { app, createServer } = require('./index');
const {
  createJwtToken,
  createAdminToken,
  createUserToken,
  createGuestToken,
  verifyToken
} = require('./jwt-utils');

module.exports.app = app;
module.exports.createServer = createServer;

module.exports.utils = {
  createJwtToken,
  createAdminToken,
  createUserToken,
  createGuestToken,
  verifyToken
};
