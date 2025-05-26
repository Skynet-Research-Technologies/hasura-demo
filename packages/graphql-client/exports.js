/**
 * Module exports for @hasura-demo/graphql-client
 */

const {
  createHasuraClient,
  setJwtToken,
  setAdminSecret,
  execute,
  getRequestHistory,
  clearRequestHistory,
  getFixtures,
  getPeople,
  getPlayerStats,
  insertFixtures,
  insertPeople,
  insertPlayerStats,
  updateFixtureById,
  updatePersonById,
  updatePlayerStatsById,
  deleteFixtureById,
  deletePersonById,
  deletePlayerStatsById,
  deletePlayerStatsByFixtureAndPerson
} = require('./index');
const config = require('./config');

// Export all core functions
module.exports = {
  createHasuraClient,
  setJwtToken,
  setAdminSecret,
  execute,
  getRequestHistory,
  clearRequestHistory,
  getFixtures,
  getPeople,
  getPlayerStats,
  insertFixtures,
  insertPeople,
  insertPlayerStats,
  updateFixtureById,
  updatePersonById,
  updatePlayerStatsById,
  deleteFixtureById,
  deletePersonById,
  deletePlayerStatsById,
  deletePlayerStatsByFixtureAndPerson,
  config
};

// Helper for backwards compatibility and convenience
module.exports.createClient = (options = {}) => {
  return createHasuraClient(options);
};

// Create an admin client using the admin secret from config
module.exports.createAdminClient = (options = {}) => {
  const ctx = createHasuraClient({
    ...options,
    adminSecret: options.adminSecret || config.adminSecret
  });
  
  return ctx;
};

// Create a client using JWT authentication from config
module.exports.createAuthClient = (options = {}) => {
  const ctx = createHasuraClient({
    ...options, 
    jwtToken: options.jwtToken || config.jwtToken
  });
  
  return ctx;
};
