const { GraphQLClient, gql } = require('graphql-request');
const config = require('./config');

/**
 * Creates a Hasura GraphQL client context
 * @param {Object} options - Client configuration options
 * @returns {Object} - Client context object
 */
const createHasuraClient = (options = {}) => {
  // Prepare headers
  const headers = {
    ...(options.headers || {}),
    ...((options.adminSecret || config.adminSecret) && { 
      'x-hasura-admin-secret': options.adminSecret || config.adminSecret
    }),
    ...((options.jwtToken || config.jwtToken) && { 
      'Authorization': `Bearer ${options.jwtToken || config.jwtToken}` 
    }),
  };
  
  // Request history tracking
  const requestHistory = [];
  const maxHistorySize = options.maxHistorySize || config.maxHistorySize;
  
  // Configuration for creating clients
  const clientConfig = {
    url: options.url || config.endpoint,
    headers
  };
  
  return {
    // Execute function embedded directly in the context
    execute: async (query, variables = {}) => {
      const client = new GraphQLClient(clientConfig.url, { headers: clientConfig.headers });
      const startTime = Date.now();
      
      try {
        const result = await client.request(query, variables);
        const endTime = Date.now();
        
        // Add to history
        requestHistory.unshift({
          type: query.trim().startsWith('mutation') ? 'mutation' : 'query',
          variables,
          duration: endTime - startTime,
          timestamp: new Date().toISOString(),
          success: true
        });
        
        if (requestHistory.length > maxHistorySize) {
          requestHistory.pop();
        }
        
        return result;
      } catch (error) {
        requestHistory.unshift({
          type: query.trim().startsWith('mutation') ? 'mutation' : 'query',
          variables,
          error: error.message,
          timestamp: new Date().toISOString(),
          success: false
        });
        
        if (requestHistory.length > maxHistorySize) {
          requestHistory.pop();
        }
        
        throw error;
      }
    },
    
    // Authentication methods
    setJwtToken: (token) => {
      clientConfig.headers.Authorization = `Bearer ${token}`;
      return this;
    },
    
    setAdminSecret: (secret) => {
      clientConfig.headers['x-hasura-admin-secret'] = secret;
      return this;
    },
    
    // History management
    getRequestHistory: () => [...requestHistory],
    
    clearRequestHistory: () => {
      requestHistory.length = 0;
      return this;
    }
  };
};

// Export GraphQL related items for use in other modules
module.exports = {
  gql,
  createHasuraClient
};
