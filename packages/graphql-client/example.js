const {
  createHasuraClient,
  getFixtures,
  getPeople,
  getPlayerStats,
  insertFixtures,
  updateFixtureById,
  deleteFixtureById,
  getRequestHistory
} = require('./index');
const config = require('./config');

async function main() {
  try {
    console.log('Initializing GraphQL client...');
    const client = createHasuraClient();

    console.log('\n--- Example 1: Basic Queries ---');

    console.log('Fetching fixtures (with ordering)...');
    const fixtures = await getFixtures(client, {
      limit: 3,
      orderBy: [{ fixtureDate: 'Desc' }]
    });
    console.log(JSON.stringify(fixtures, null, 2));

    console.log('\nFetching people (with custom fields)...');
    const people = await getPeople(client, {
      limit: 3,
      fields: `
        id
        name
      `
    });
    console.log(JSON.stringify(people, null, 2));

    console.log('\nFetching player stats (with filtering)...');
    const playerStats = await getPlayerStats(client, {
      limit: 3,
      where: {
        goals: { _gt: 0 }
      }
    });
    console.log(JSON.stringify(playerStats, null, 2));

    console.log('\n--- Example 2: CRUD Operations ---');
    const shouldRunMutations = process.argv.includes('--run-mutations');

    if (shouldRunMutations) {
      console.log('\nCreating a new fixture...');
      const fixtureDate = new Date();
      fixtureDate.setDate(fixtureDate.getDate() + 7);
      const newFixture = await insertFixtures(client, [{
        homeTeamId: 1,
        awayTeamId: 2,
        sportId: 1,
        fixtureDate: fixtureDate.toISOString(),
        venue: 'Example Stadium',
        status: 'scheduled'
      }]);
      console.log(JSON.stringify(newFixture, null, 2));

      const createdFixtureId = newFixture.insertFixtures.returning[0].id;

      console.log(`\nUpdating fixture ${createdFixtureId}...`);
      const updatedFixture = await updateFixtureById(client, createdFixtureId, {
        venue: { set: 'Updated Stadium' },
        status: { set: 'rescheduled' }
      });
      console.log(JSON.stringify(updatedFixture, null, 2));

      console.log(`\nDeleting fixture ${createdFixtureId}...`);
      const deleteResult = await deleteFixtureById(client, createdFixtureId);
      console.log(JSON.stringify(deleteResult, null, 2));
    } else {
      console.log('\nSkipping mutation examples. Run with --run-mutations to execute them.');
    }

    // Example 3: Show request history
    console.log('\n--- Example 3: Request History ---');
    const history = getRequestHistory(client);
    console.log(`Made ${history.length} requests:`);
    history.forEach((req, i) => {
      console.log(`${i + 1}. ${req.type} - Success: ${req.success}, Time: ${req.timestamp}, Duration: ${req.duration}ms`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.errors) {
      console.error('GraphQL Errors:', error.response.errors);
    }
  }
}

// Command line argument parsing
if (process.argv.includes('--help')) {
  console.log(`
Usage: node example.js [options]

Options:
  --run-mutations    Execute create, update, and delete operations (default: read-only)
  --help             Show this help message
  `);
  process.exit(0);
}

// Run the example
main();
