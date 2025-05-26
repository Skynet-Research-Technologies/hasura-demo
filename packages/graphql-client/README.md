# Hasura DDN GraphQL Client

A Node.js GraphQL client for interacting with Hasura DDN GraphQL server. This client provides methods to query and mutate data in the Fixtures, People, and PlayerStats tables.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root of the package directory based on the `.env.example` template:

```
# Hasura GraphQL Endpoint
HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql

# Admin Secret (if required)
# HASURA_GRAPHQL_ADMIN_SECRET=your_admin_secret

# JWT Token (if using JWT authentication)
# HASURA_JWT_TOKEN=your_jwt_token

# Client options
# MAX_REQUEST_HISTORY_SIZE=10
```

## Usage

### Basic Queries

```javascript
const {
  createHasuraClient,
  getFixtures,
  getPeople,
  getPlayerStats
} = require('@hasura-demo/graphql-client');

// Create a client context
const ctx = createHasuraClient();

// Query fixtures with ordering
async function getFixtures() {
  try {
    const result = await getFixtures(ctx, { 
      limit: 10,
      orderBy: [{ fixtureDate: 'Desc' }]
    });
    console.log(result.fixtures);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Query with custom field selection
async function getPeopleWithCustomFields() {
  try {
    const result = await getPeople(ctx, { 
      limit: 5,
      fields: `
        id
        name
      `
    });
    console.log(result.people);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### CRUD Operations

```javascript
// Create
async function createFixture() {
  try {
    const fixtureDate = new Date();
    fixtureDate.setDate(fixtureDate.getDate() + 7); // A fixture for next week
    
    const result = await insertFixtures(ctx, [{
      homeTeamId: 1,
      awayTeamId: 2,
      sportId: 1,
      fixtureDate: fixtureDate.toISOString(),
      venue: 'Stadium Name',
      status: 'scheduled'
    }]);
    
    const fixtureId = result.insertFixtures.returning[0].id;
    console.log('Created fixture ID:', fixtureId);
    return fixtureId;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Update
async function updateFixture(id) {
  try {
    const result = await updateFixtureById(ctx, id, {
      venue: { set: 'Updated Stadium' },
      status: { set: 'rescheduled' }
    });
    
    console.log('Updated fixture:', result.updateFixturesById.returning[0]);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Delete
async function deleteFixture(id) {
  try {
    const result = await deleteFixtureById(ctx, id);
    console.log('Delete result:', result.deleteFixturesById.affectedRows);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Authentication

```javascript
const { createHasuraClient, setJwtToken, setAdminSecret } = require('@hasura-demo/graphql-client');

// Using JWT token
const ctx = createHasuraClient();
setJwtToken(ctx, 'your_jwt_token');

// Using admin secret
const ctx = createHasuraClient();
setAdminSecret(ctx, 'your_admin_secret');
```

## Running the Example

```bash
# Run in read-only mode (only queries)
node example.js

# Run with mutations (create, update, delete operations)
node example.js --run-mutations

# Show help
node example.js --help
```

## Running Tests

```bash
npm test
```

The tests are end-to-end tests that require a running Hasura instance with the appropriate schema. Make sure your Hasura server is running and accessible before running the tests.

## API Reference

### Client Configuration

- `createHasuraClient(options)`: Create a new client context
  - `options.url`: GraphQL endpoint URL
  - `options.headers`: Custom headers
  - `options.adminSecret`: Hasura admin secret
  - `options.jwtToken`: JWT token for authentication
  - `options.maxHistorySize`: Maximum size of request history

### Authentication Methods

- `setJwtToken(ctx, token)`: Set JWT token for authentication
- `setAdminSecret(ctx, secret)`: Set admin secret for authentication

### Query Methods

- `getFixtures(ctx, options)`: Query fixtures with optional filtering, ordering, and field selection
- `getPeople(ctx, options)`: Query people with optional filtering, ordering, and field selection
- `getPlayerStats(ctx, options)`: Query player stats with optional filtering, ordering, and field selection

### Mutation Methods

- `insertFixtures(ctx, objects, options)`: Insert new fixtures
- `insertPeople(ctx, objects, options)`: Insert new people
- `insertPlayerStats(ctx, objects, options)`: Insert new player stats
- `updateFixtureById(ctx, id, set, options)`: Update a fixture by ID
- `updatePersonById(ctx, id, set, options)`: Update a person by ID
- `updatePlayerStatsById(ctx, id, set, options)`: Update player stats by ID
- `deleteFixtureById(ctx, id)`: Delete a fixture by ID
- `deletePersonById(ctx, id)`: Delete a person by ID
- `deletePlayerStatsById(ctx, id)`: Delete player stats by ID
- `deletePlayerStatsByFixtureAndPerson(ctx, fixtureId, personId)`: Delete player stats by fixture and person IDs

### Utility Methods

- `execute(ctx, query, variables)`: Execute a raw GraphQL query or mutation
- `getRequestHistory(ctx)`: Get the request history
- `clearRequestHistory(ctx)`: Clear the request history

Each method returns a Promise that resolves to the GraphQL response.
