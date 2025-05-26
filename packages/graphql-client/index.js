const { gql, createHasuraClient } = require('./client');

/**
 * Fetches fixtures with various options
 * @param {Object} client - Client context
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query result
 */
const getFixtures = async (client, options = {}) => {
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

  return client.execute(query, { limit, offset, where, ...(orderBy && { orderBy }) });
};

/**
 * Fetches people with various options
 * @param {Object} client - Client context
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query result
 */
const getPeople = async (client, options = {}) => {
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

  return client.execute(query, { limit, offset, where, ...(orderBy && { orderBy }) });
};

/**
 * Fetches player stats with various options
 * @param {Object} client - Client context
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query result
 */
const getPlayerStats = async (client, options = {}) => {
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

  return client.execute(query, { limit, offset, where, ...(orderBy && { orderBy }) });
};

/**
 * Inserts fixtures
 * @param {Object} client - Client context
 * @param {Array} objects - Fixture objects to insert
 * @param {Object} options - Insertion options
 * @returns {Promise<Object>} - Mutation result
 */
const insertFixtures = async (client, objects, options = {}) => {
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

  return client.execute(mutation, { 
    objects,
    ...(postCheck && { postCheck })
  });
};

/**
 * Inserts people
 * @param {Object} client - Client context
 * @param {Array} objects - People objects to insert
 * @param {Object} options - Insertion options
 * @returns {Promise<Object>} - Mutation result
 */
const insertPeople = async (client, objects, options = {}) => {
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

  return client.execute(mutation, { 
    objects,
    ...(postCheck && { postCheck })
  });
};

/**
 * Inserts player stats
 * @param {Object} client - Client context
 * @param {Array} objects - Player stats objects to insert
 * @param {Object} options - Insertion options
 * @returns {Promise<Object>} - Mutation result
 */
const insertPlayerStats = async (client, objects, options = {}) => {
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

  return client.execute(mutation, { 
    objects,
    ...(postCheck && { postCheck })
  });
};

/**
 * Updates a fixture by ID
 * @param {Object} client - Client context
 * @param {number} id - Fixture ID
 * @param {Object} set - Fields to update
 * @param {Object} options - Update options
 * @returns {Promise<Object>} - Mutation result
 */
const updateFixtureById = async (client, id, set, options = {}) => {
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

  return client.execute(mutation, { id, set });
};

/**
 * Updates a person by ID
 * @param {Object} client - Client context
 * @param {number} id - Person ID
 * @param {Object} set - Fields to update
 * @param {Object} options - Update options
 * @returns {Promise<Object>} - Mutation result
 */
const updatePersonById = async (client, id, set, options = {}) => {
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

  return client.execute(mutation, { id, set });
};

/**
 * Updates player stats by ID
 * @param {Object} client - Client context
 * @param {number} id - Player stats ID
 * @param {Object} set - Fields to update
 * @param {Object} options - Update options
 * @returns {Promise<Object>} - Mutation result
 */
const updatePlayerStatsById = async (client, id, set, options = {}) => {
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

  return client.execute(mutation, { id, set });
};

/**
 * Deletes a fixture by ID
 * @param {Object} client - Client context
 * @param {number} id - Fixture ID
 * @returns {Promise<Object>} - Mutation result
 */
const deleteFixtureById = async (client, id) => {
  const mutation = gql`
    mutation DeleteFixtureById($id: Int32!) {
      deleteFixturesById(keyId: $id) {
        affectedRows
      }
    }
  `;

  return client.execute(mutation, { id });
};

/**
 * Deletes a person by ID
 * @param {Object} client - Client context
 * @param {number} id - Person ID
 * @returns {Promise<Object>} - Mutation result
 */
const deletePersonById = async (client, id) => {
  const mutation = gql`
    mutation DeletePersonById($id: Int32!) {
      deletePeopleById(keyId: $id) {
        affectedRows
      }
    }
  `;

  return client.execute(mutation, { id });
};

/**
 * Deletes player stats by ID
 * @param {Object} client - Client context
 * @param {number} id - Player stats ID
 * @returns {Promise<Object>} - Mutation result
 */
const deletePlayerStatsById = async (client, id) => {
  const mutation = gql`
    mutation DeletePlayerStatsById($id: Int32!) {
      deletePlayerstatsById(keyId: $id) {
        affectedRows
      }
    }
  `;

  return client.execute(mutation, { id });
};

/**
 * Deletes player stats by fixture and person
 * @param {Object} client - Client context
 * @param {number} fixtureId - Fixture ID
 * @param {number} personId - Person ID
 * @returns {Promise<Object>} - Mutation result
 */
const deletePlayerStatsByFixtureAndPerson = async (client, fixtureId, personId) => {
  const mutation = gql`
    mutation DeletePlayerStatsByFixtureAndPerson($fixtureId: Int32!, $personId: Int32!) {
      deletePlayerstatsByFixtureIdAndPersonId(keyFixtureId: $fixtureId, keyPersonId: $personId) {
        affectedRows
      }
    }
  `;

  return client.execute(mutation, { fixtureId, personId });
};

// Export all functions
module.exports = {
  // Re-export client functions
  createHasuraClient,
  
  // Domain-specific operations
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
