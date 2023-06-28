const assert = require('assert');
const { MongoClient } = require('mongodb');
const dbClient = require('../utils/db');

describe('DBClient', () => {
  it('Tests if the client is alive', () => {
    assert.strictEqual(
      dbClient.isAlive(),
      true
    );
  });

  it('Tests the number of users', async () => {
    const mockCollection = { countDocuments: () => Promise.resolve(5) };
    dbClient.client.db = () => mockCollection;

    const result = await dbClient.nbUsers();

    assert.strictEqual(
      mockCollection.countDocuments.called,
      true
    );
    assert.strictEqual(
      result,
      5
    );
  });

  it('Tests the number of files', async () => {
    const mockCollection = { countDocuments: () => Promise.resolve(10) };
    dbClient.client.db = () => mockCollection;

    const result = await dbClient.nbFiles();

    assert.strictEqual(
      mockCollection.countDocuments.called,
      true
    );
    assert.strictEqual(
      result,
      10
    );
  });
});
