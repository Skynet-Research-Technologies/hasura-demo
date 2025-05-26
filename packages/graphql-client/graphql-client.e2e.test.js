const {
  createHasuraClient,
  getFixtures,
  insertFixtures,
  updateFixtureById,
  deleteFixtureById,
  getPeople,
  insertPeople,
  getPlayerStats,
  insertPlayerStats,
  getRequestHistory
} = require('./index');

const testConfig = {
  url: process.env.HASURA_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql',
};

describe('HasuraGraphQLClient E2E Tests', () => {
  let client;

  beforeAll(() => {
    client = createHasuraClient(testConfig);
  });

  describe('Fixtures API', () => {
    let createdFixtureId;

    test('should insert a new fixture', async () => {
      const fixtureDate = new Date();
      fixtureDate.setDate(fixtureDate.getDate() + 7);

      const fixtureObject = {
        homeTeamId: 1,
        awayTeamId: 2,
        sportId: 1,
        fixtureDate: fixtureDate.toISOString(),
        venue: 'Test Stadium',
        status: 'scheduled'
      };

      const result = await insertFixtures(client, [fixtureObject]);

      expect(result).toBeDefined();
      expect(result.insertFixtures).toBeDefined();
      expect(result.insertFixtures.affectedRows).toBe(1);
      expect(result.insertFixtures.returning).toHaveLength(1);

      createdFixtureId = result.insertFixtures.returning[0].id;
      expect(createdFixtureId).toBeDefined();
      const history = client.getRequestHistory();
      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].type).toBe('mutation');
      expect(history[0].success).toBe(true);
    });

    test('should fetch fixtures', async () => {
      const result = await getFixtures(client, {
        limit: 5,
        orderBy: [{ fixtureDate: 'Desc' }]
      });

      expect(result).toBeDefined();
      expect(result.fixtures).toBeDefined();
      expect(Array.isArray(result.fixtures)).toBe(true);
    });

    test('should fetch a specific fixture by ID', async () => {
      if (!createdFixtureId) {
        console.warn('Skipping fixture by ID test as no fixture was created');
        return;
      }

      const result = await getFixtures(client, {
        where: { id: { _eq: createdFixtureId } }
      });

      expect(result).toBeDefined();
      expect(result.fixtures).toBeDefined();
      expect(result.fixtures).toHaveLength(1);
      expect(result.fixtures[0].id).toBe(createdFixtureId);
    });

    test('should update a fixture by ID', async () => {
      if (!createdFixtureId) {
        console.warn('Skipping fixture update test as no fixture was created');
        return;
      }

      const updatedVenue = 'Updated Stadium Name';
      const updatedStatus = 'in_progress';

      const updateResult = await updateFixtureById(client, createdFixtureId, {
        venue: { set: updatedVenue },
        status: { set: updatedStatus }
      });

      expect(updateResult).toBeDefined();
      expect(updateResult.updateFixturesById).toBeDefined();
      expect(updateResult.updateFixturesById.affectedRows).toBe(1);
      expect(updateResult.updateFixturesById.returning).toHaveLength(1);
      expect(updateResult.updateFixturesById.returning[0].venue).toBe(updatedVenue);
      expect(updateResult.updateFixturesById.returning[0].status).toBe(updatedStatus);
      const fetchResult = await getFixtures(client, {
        where: { id: { _eq: createdFixtureId } }
      });

      expect(fetchResult.fixtures[0].venue).toBe(updatedVenue);
      expect(fetchResult.fixtures[0].status).toBe(updatedStatus);
    });

    test('should delete a fixture by ID', async () => {
      if (!createdFixtureId) {
        console.warn('Skipping fixture deletion test as no fixture was created');
        return;
      }

      const deleteResult = await deleteFixtureById(client, createdFixtureId);

      expect(deleteResult).toBeDefined();
      expect(deleteResult.deleteFixturesById).toBeDefined();
      expect(deleteResult.deleteFixturesById.affectedRows).toBe(1);
      const fetchResult = await getFixtures(client, {
        where: { id: { _eq: createdFixtureId } }
      });

      expect(fetchResult.fixtures).toHaveLength(0);
    });
  });

  describe('People API', () => {
    let createdPersonId;

    test('should insert a new person', async () => {
      const personObject = {
        name: 'Test Player',
        teamId: 1
      };

      const result = await insertPeople(client, [personObject]);

      expect(result).toBeDefined();
      expect(result.insertPeople).toBeDefined();
      expect(result.insertPeople.affectedRows).toBe(1);
      expect(result.insertPeople.returning).toHaveLength(1);
      createdPersonId = result.insertPeople.returning[0].id;
      expect(createdPersonId).toBeDefined();
    });

    test('should fetch people', async () => {
      const result = await getPeople(client, { limit: 5 });

      expect(result).toBeDefined();
      expect(result.people).toBeDefined();
      expect(Array.isArray(result.people)).toBe(true);
    });

    test('should fetch a specific person by ID', async () => {
      // Skip if no person was created
      if (!createdPersonId) {
        console.warn('Skipping person by ID test as no person was created');
        return;
      }

      const result = await getPeople(client, {
        where: { id: { _eq: createdPersonId } }
      });

      expect(result).toBeDefined();
      expect(result.people).toBeDefined();
      expect(result.people).toHaveLength(1);
      expect(result.people[0].id).toBe(createdPersonId);
    });
  });

  describe('PlayerStats API', () => {
    let createdFixtureId, createdPersonId, createdStatsId;

    beforeAll(async () => {
      // Create a fixture and person to use for player stats
      const fixtureDate = new Date();
      const fixtureResult = await insertFixtures(client, [{
        homeTeamId: 1,
        awayTeamId: 2,
        sportId: 1,
        fixtureDate: fixtureDate.toISOString(),
        venue: 'Test Stadium',
        status: 'completed'
      }]);
      createdFixtureId = fixtureResult.insertFixtures.returning[0].id;

      const personResult = await insertPeople(client, [{
        name: 'Stats Test Player',
        teamId: 1
      }]);
      createdPersonId = personResult.insertPeople.returning[0].id;
    });

    test('should insert player stats', async () => {
      // Skip if fixture or person creation failed
      if (!createdFixtureId || !createdPersonId) {
        console.warn('Skipping player stats test as prerequisite data creation failed');
        return;
      }

      const statsObject = {
        fixtureId: createdFixtureId,
        personId: createdPersonId,
        goals: 2,
        assists: 1,
        yellowCards: 1,
        redCards: 0,
        minutesPlayed: 90,
        rating: 8.5,
        stats: { passes: 45, tackles: 3 }
      };

      const result = await insertPlayerStats(client, [statsObject]);

      expect(result).toBeDefined();
      expect(result.insertPlayerstats).toBeDefined();
      expect(result.insertPlayerstats.affectedRows).toBe(1);
      expect(result.insertPlayerstats.returning).toHaveLength(1);

      createdStatsId = result.insertPlayerstats.returning[0].id;
      expect(createdStatsId).toBeDefined();
    });

    test('should fetch player stats', async () => {
      const result = await getPlayerStats(client, { limit: 5 });

      expect(result).toBeDefined();
      expect(result.playerstats).toBeDefined();
      expect(Array.isArray(result.playerstats)).toBe(true);
    });

    test('should fetch specific player stats by fixture and person IDs', async () => {
      // Skip if prerequisite data creation failed
      if (!createdFixtureId || !createdPersonId) {
        console.warn('Skipping specific player stats test as prerequisite data creation failed');
        return;
      }

      const result = await getPlayerStats(client, {
        where: {
          fixtureId: { _eq: createdFixtureId },
          personId: { _eq: createdPersonId }
        }
      });

      expect(result).toBeDefined();
      expect(result.playerstats).toBeDefined();
      expect(result.playerstats.length).toBeGreaterThan(0);
      expect(result.playerstats[0].fixtureId).toBe(createdFixtureId);
      expect(result.playerstats[0].personId).toBe(createdPersonId);
    });
  });
});
