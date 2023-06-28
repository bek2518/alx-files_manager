import sha1 from 'sha1';
import { v4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

module.exports = class AuthController {
  static async getConnect(req, res) {
    const authorization = req.header('Authorization');
    const basic = authorization.split(' ')[1];
    const emailPassword = (Buffer.from(basic, 'base64').toString()).split(':');
    const email = emailPassword[0];
    const password = emailPassword[1];
    const hashesPassword = sha1(password);

    const user = await dbClient.db.collection('users').findOne({ email, password: hashesPassword });
    if (!user) {
      res.statusCode = 401;
      res.json({ error: 'Unauthorized' });
      return;
    }

    const token = v4();
    const key = `auth_${token}`;

    await redisClient.set(key, user._id.toString(), 24 * 60 * 60);

    res.statusCode = 200;
    res.send({ token });
  }

  static async getDisconnect(req, res) {
    const xToken = req.header('X-Token');
    const token = `auth_${xToken}`;
    const userId = await redisClient.get(token);

    if (!userId) {
      res.statusCode = 401;
      res.json({ error: 'Unauthorized' });
      return;
    }
    await redisClient.del(token);
    res.statusCode = 204;
    res.json({});
  }
};
