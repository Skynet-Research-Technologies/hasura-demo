const { GraphQLClient, gql } = require('graphql-request');
const config = require('./config');

/**
 * Creates a Hasura GraphQL client context with functional approach
 * @param {Object} options - Client configuration options
 * @returns {Object} - Client context object
 */
const createHasuraClient = (options = {}) => {
  // Create initial context
  const context = {
    url: options.url || config.endpoint,
    headers: {
      ...(options.headers || {}),
      ...((options.adminSecret || config.adminSecret) && { 
        'x-hasura-admin-secret': options.adminSecret || config.adminSecret
      }),
      ...((options.jwtToken || config.jwtToken) && { 
        'Authorization': `Bearer ${options.jwtToken || config.jwtToken}` 
      }),
    },
    requestHistory: [],
    maxHistorySize: options.maxHistorySize || config.maxHistorySize
  };
  
  // Initialize GraphQL client
  context.client = new GraphQLClient(context.url, { headers: context.headers });
  
  return context;
};

/**
 * Adds a request to history
 * @param {Object} ctx - Client context
 * @param {Object} request - Request details to add to history
 */
const addToRequestHistory = (ctx, request) => {
  ctx.requestHistory.unshift(request);
  if (ctx.requestHistory.length > ctx.maxHistorySize) {
    ctx.requestHistory.pop();
  }
};

/**
 * Updates the GraphQL client with current context
 * @param {Object} ctx - Client context
 */
const updateClient = (ctx) => {
  ctx.client = new GraphQLClient(ctx.url, { headers: ctx.headers });
};

/**
 * Sets JWT token for authorization
 * @param {Object} ctx - Client context
 * @param {string} token - JWT token
 * @returns {Object} - Updated context
 */
const setJwtToken = (ctx, token) => {
  ctx.headers.Authorization = `Bearer ${token}`;
  updateClient(ctx);
  return ctx;
};

/**
 * Sets admin secret for authorization
 * @param {Object} ctx - Client context
 * @param {string} secret - Admin secret
 * @returns {Object} - Updated context
 */
const setAdminSecret = (ctx, secret) => {
  ctx.headers['x-hasura-admin-secret'] = secret;
  updateClient(ctx);
  return ctx;
};

/**
 * Executes a GraphQL query or mutation
 * @param {Object} ctx - Client context
 * @param {string} query - GraphQL query or mutation
 * @param {Object} variables - Query variables
 * @returns {Promise<Object>} - Query result
 */
const execute = async (ctx, query, variables = {}) => {
  try {
    const startTime = Date.now();
    const result = await ctx.client.request(query, variables);
    const endTime = Date.now();
    
    addToRequestHistory(ctx, {
      type: query.trim().startsWith('mutation') ? 'mutation' : 'query',
      variables,
      duration: endTime - startTime,
      timestamp: new Date().toISOString(),
      success: true
    });
    
    return result;
  } catch (error) {
    addToRequestHistory(ctx, {
      type: query.trim().startsWith('mutation') ? 'mutation' : 'query',
      variables,
      error: error.message,
      timestamp: new Date().toISOString(),
      success: false
    });
    
    throw error;
  }
};

/**
 * Gets request history
 * @param {Object} ctx - Client context
 * @returns {Array} - Request history
 */
const getRequestHistory = (ctx) => [...ctx.requestHistory];

/**
 * Clears request history
 * @param {Object} ctx - Client context
 * @returns {Object} - Updated context
 */
const clearRequestHistory = (ctx) => {
  ctx.requestHistory = [];
  return ctx;
};

/**
 * Fetches fixtures with various options
 * @param {Object} ctx - Client context
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query result
 */
const getFixtures = async (ctx, options = {}) => {
  const { limit = 10, offset = 0, where = {}, orderBy = null, fields = null } = options;

  const fieldsList = fields || `
    id
    homeTeamId
    awayTeamId
    fixtureDate
    sportId
    venue
    status
    createdAt
  `;

  const orderByStr = orderBy ? `, order_by: $orderBy` : '';
  
  const query = gql`
    query GetFixtures($limit: Int, $offset: Int, $where: FixturesBoolExp ${orderBy ? ', $orderBy: [FixturesOrderByExp!]' : ''}) {
      fixtures(limit: $limit, offset: $offset, where: $where${orderByStr}) {
        ${fieldsList}
      }
    }
  `;

  return execute(ctx, query, { limit, offset, where, ...(orderBy && { orderBy }) });
};

/**
 * Fetches people with various options
 * @param {Object} ctx - Client context
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query result
 */
const getPeople = async (ctx, options = {}) => {
  const { limit = 10, offset = 0, where = {}, orderBy = null, fields = null } = options;

  const fieldsList = fields || `
    id
    name
    teamId
  `;

  const orderByStr = orderBy ? `, order_by: $orderBy` : '';
  
  const query = gql`
    query GetPeople($limit: Int, $offset: Int, $where: PeopleBoolExp ${orderBy ? ', $orderBy: [PeopleOrderByExp!]' : ''}) {
      people(limit: $limit, offset: $offset, where: $where${orderByStr}) {
        ${fieldsList}
      }
    }
  `;

  return execute(ctx, query, { limit, offset, where, ...(orderBy && { orderBy }) });
};

/**
 * Fetches player stats with various options
 * @param {Object} ctx - Client context
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query result
 */
const getPlayerStats = async (ctx, options = {}) => {
  const { limit = 10, offset = 0, where = {}, orderBy = null, fields = null } = options;

  const fieldsList = fields || `
    id
    personId
    fixtureId
    goals
    assists
    yellowCards
    redCards
    minutesPlayed
    rating
    stats
  `;

  const orderByStr = orderBy ? `, order_by: $orderBy` : '';
  
  const query = gql`
    query GetPlayerStats($limit: Int, $offset: Int, $where: PlayerstatsBoolExp ${orderBy ? ', $orderBy: [PlayerstatsOrderByExp!]' : ''}) {
      playerstats(limit: $limit, offset: $offset, where: $where${orderByStr}) {
        ${fieldsList}
      }
    }
  `;

  return execute(ctx, query, { limit, offset, where, ...(orderBy && { orderBy }) });
};

/**
 * Inserts fixtures
 * @param {Object} ctx - Client context
 * @param {Array} objects - Fixture objects to insert
 * @param {Object} options - Insertion options
 * @returns {Promise<Object>} - Mutation result
 */
const insertFixtures = async (ctx, objects, options = {}) => {
  const { fields = null, postCheck = null } = options;
  const fieldsList = fields || `
    id
    homeTeamId
    awayTeamId
    fixtureDate
    sportId
    venue
    status
  `;

  const postCheckParam = postCheck ? ', $postCheck: FixturesBoolExp' : '';
  const postCheckArg = postCheck ? ', postCheck: $postCheck' : '';
  
  const mutation = gql`
    mutation InsertFixtures($objects: [InsertFixturesObjectInput!]!${postCheckParam}) {
      insertFixtures(objects: $objects${postCheckArg}) {
        affectedRows
        returning {
          ${fieldsList}
        }
      }
    }
  `;

  return execute(ctx, mutation, { 
    objects,
    ...(postCheck && { postCheck })
  });
};

/**
 * Inserts people
 * @param {Object} ctx - Client context
 * @param {Array} objects - People objects to insert
 * @param {Object} options - Insertion options
 * @returns {Promise<Object>} - Mutation result
 */
const insertPeople = async (ctx, objects, options = {}) => {
  const { fields = null, postCheck = null } = options;
  const fieldsList = fields || `
    id
    name
    teamId
  `;

  const postCheckParam = postCheck ? ', $postCheck: PeopleBoolExp' : '';
  const postCheckArg = postCheck ? ', postCheck: $postCheck' : '';
  
  const mutation = gql`
    mutation InsertPeople($objects: [InsertPeopleObjectInput!]!${postCheckParam}) {
      insertPeople(objects: $objects${postCheckArg}) {
        affectedRows
        returning {
          ${fieldsList}
        }
      }
    }
  `;

  return execute(ctx, mutation, { 
    objects,
    ...(postCheck && { postCheck })
  });
};

/**
 * Inserts player stats
 * @param {Object} ctx - Client context
 * @param {Array} objects - Player stats objects to insert
 * @param {Object} options - Insertion options
 * @returns {Promise<Object>} - Mutation result
 */
const insertPlayerStats = async (ctx, objects, options = {}) => {
  const { fields = null, postCheck = null } = options;
  const fieldsList = fields || `
    id
    personId
    fixtureId
    goals
    assists
    yellowCards
    redCards
    minutesPlayed
    rating
  `;

  const postCheckParam = postCheck ? ', $postCheck: PlayerstatsBoolExp' : '';
  const postCheckArg = postCheck ? ', postCheck: $postCheck' : '';
  
  const mutation = gql`
    mutation InsertPlayerStats($objects: [InsertPlayerstatsObjectInput!]!${postCheckParam}) {
      insertPlayerstats(objects: $objects${postCheckArg}) {
        affectedRows
        returning {
          ${fieldsList}
        }
      }
    }
  `;

  return execute(ctx, mutation, { 
    objects,
    ...(postCheck && { postCheck })
  });
};

/**
 * Updates a fixture by ID
 * @param {Object} ctx - Client context
 * @param {number} id - Fixture ID
 * @param {Object} set - Fields to update
 * @param {Object} options - Update options
 * @returns {Promise<Object>} - Mutation result
 */
const updateFixtureById = async (ctx, id, set, options = {}) => {
  const { fields = null } = options;
  const fieldsList = fields || `
    id
    homeTeamId
    awayTeamId
    fixtureDate
    sportId
    venue
    status
  `;
  
  const mutation = gql`
    mutation UpdateFixtureById($id: Int32!, $set: UpdateFixturesByIdUpdateColumnsInput!) {
      updateFixturesById(keyId: $id, updateColumns: $set) {
        affectedRows
        returning {
          ${fieldsList}
        }
      }
    }
  `;

  return execute(ctx, mutation, { id, set });
};

/**
 * Updates a person by ID
 * @param {Object} ctx - Client context
 * @param {number} id - Person ID
 * @param {Object} set - Fields to update
 * @param {Object} options - Update options
 * @returns {Promise<Object>} - Mutation result
 */
const updatePersonById = async (ctx, id, set, options = {}) => {
  const { fields = null } = options;
  const fieldsList = fields || `
    id
    name
    teamId
  `;
  
  const mutation = gql`
    mutation UpdatePersonById($id: Int32!, $set: UpdatePeopleByIdUpdateColumnsInput!) {
      updatePeopleById(keyId: $id, updateColumns: $set) {
        affectedRows
        returning {
          ${fieldsList}
        }
      }
    }
  `;

  return execute(ctx, mutation, { id, set });
};

/**
 * Updates player stats by ID
 * @param {Object} ctx - Client context
 * @param {number} id - Player stats ID
 * @param {Object} set - Fields to update
 * @param {Object} options - Update options
 * @returns {Promise<Object>} - Mutation result
 */
const updatePlayerStatsById = async (ctx, id, set, options = {}) => {
  const { fields = null } = options;
  const fieldsList = fields || `
    id
    personId
    fixtureId
    goals
    assists
    yellowCards
    redCards
    minutesPlayed
    rating
  `;
  
  const mutation = gql`
    mutation UpdatePlayerStatsById($id: Int32!, $set: UpdatePlayerstatsByIdUpdateColumnsInput!) {
      updatePlayerstatsById(keyId: $id, updateColumns: $set) {
        affectedRows
        returning {
          ${fieldsList}
        }
      }
    }
  `;

  return execute(ctx, mutation, { id, set });
};

/**
 * Deletes a fixture by ID
 * @param {Object} ctx - Client context
 * @param {number} id - Fixture ID
 * @returns {Promise<Object>} - Mutation result
 */
const deleteFixtureById = async (ctx, id) => {
  const mutation = gql`
    mutation DeleteFixtureById($id: Int32!) {
      deleteFixturesById(keyId: $id) {
        affectedRows
      }
    }
  `;

  return execute(ctx, mutation, { id });
};

/**
 * Deletes a person by ID
 * @param {Object} ctx - Client context
 * @param {number} id - Person ID
 * @returns {Promise<Object>} - Mutation result
 */
const deletePersonById = async (ctx, id) => {
  const mutation = gql`
    mutation DeletePersonById($id: Int32!) {
      deletePeopleById(keyId: $id) {
        affectedRows
      }
    }
  `;

  return execute(ctx, mutation, { id });
};

/**
 * Deletes player stats by ID
 * @param {Object} ctx - Client context
 * @param {number} id - Player stats ID
 * @returns {Promise<Object>} - Mutation result
 */
const deletePlayerStatsById = async (ctx, id) => {
  const mutation = gql`
    mutation DeletePlayerStatsById($id: Int32!) {
      deletePlayerstatsById(keyId: $id) {
        affectedRows
      }
    }
  `;

  return execute(ctx, mutation, { id });
};

/**
 * Deletes player stats by fixture and person
 * @param {Object} ctx - Client context
 * @param {number} fixtureId - Fixture ID
 * @param {number} personId - Person ID
 * @returns {Promise<Object>} - Mutation result
 */
const deletePlayerStatsByFixtureAndPerson = async (ctx, fixtureId, personId) => {
  const mutation = gql`
    mutation DeletePlayerStatsByFixtureAndPerson($fixtureId: Int32!, $personId: Int32!) {
      deletePlayerstatsByFixtureIdAndPersonId(keyFixtureId: $fixtureId, keyPersonId: $personId) {
        affectedRows
      }
    }
  `;

  return execute(ctx, mutation, { fixtureId, personId });
};

// Export all functions
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
  deletePlayerStatsByFixtureAndPerson
};
