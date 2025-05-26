const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  endpoint: process.env.HASURA_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql',
  adminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  jwtToken: process.env.HASURA_JWT_TOKEN,
  maxHistorySize: parseInt(process.env.MAX_REQUEST_HISTORY_SIZE || '10', 10)
};
