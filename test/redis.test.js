const assert = require('assert');
const { createClient } = require('redis');
const { promisify } = require('util');
const redisClient = require('../utils/redis');

describe('RedisClient', () => {

  it('should check if the client is alive', () => {
    assert.strictEqual(
      redisClient.isAlive(),
      redisClient.check
    );
  });

  it('Test get a value from Redis', async () => {
    const mockGet = promisify(() => 'test value');
    redisClient.get = mockGet;

    const result = await redisClient.get('key');

    assert.strictEqual(
      result,
      'test value'
    );
  });

  it('Test set a value in Redis', async () => {
    const mockSetex = promisify(() => {});
    redisClient.client.setex = mockSetex;

    await redisClient.set('key', 'value', 60);

    assert.strictEqual(
      redisClient.client.setex.calledWith('key', 60, 'value'),
      true
    );
  });

  it('Test delete a value from Redis', async () => {
    const mockDel = promisify(() => {});
    redisClient.client.del = mockDel;

    await redisClient.del('key');

    assert.strictEqual(
      redisClient.client.del.calledWith('key'),
      true
    );
  });
});
