import redisClient from '../utils/redis';
import dbClient from '../utils/db';

module.exports = class AppController {
  static getStatus(req, res) {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      res.statusCode = 200;
      res.json({ redis: true, db: true });
    }
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    res.statusCode = 200;
    res.json({ users, files });
  }
};
