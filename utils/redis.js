import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.check = true;
    this.client.on('error', (err) => {
      console.log(err);
      this.check = false;
    });
    this.client.on('connect', () => {
      this.check = true;
    });

    this.get = promisify(this.client.get).bind(this.client);
  }

  isAlive() {
    return this.check;
  }

  async get(stringKey) {
    const value = await this.get(stringKey);
    return value;
  }

  async set(stringKey, value, duration) {
    await this.client.setex(stringKey, duration, value);
  }

  async del(stringKey) {
    await this.client.del(stringKey);
  }
}

const redisClient = new RedisClient();
export default redisClient;
