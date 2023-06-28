import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Queue('userQueue');

module.exports = class UsersController {
  static async postNew(req, res) {
    const { email } = req.body;
    const { password } = req.body;

    if (!email) {
      res.statusCode = 400;
      res.json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      res.statusCode = 400;
      res.json({ error: 'Missing password' });
      return;
    }

    const existingEmail = await dbClient.db.collection('users').findOne({ email });
    if (existingEmail) {
      res.statusCode = 400;
      res.json({ error: 'Already exist' });
      return;
    }

    const hashesPassword = sha1(password);
    const newUser = await dbClient.db.collection('users').insertOne({ email, password: hashesPassword });
    res.statusCode = 201;
    res.json({ id: newUser.insertedId, email });
    userQueue.add({ userId: newUser.insertedId });
  }

  static async getMe(req, res) {
    const xToken = req.header('X-Token');
    const token = `auth_${xToken}`;
    const userId = await redisClient.get(token);

    const user = await dbClient.db.collection('users').findOne({ _id: new ObjectID(userId) });

    if (!user) {
      res.statusCode = 401;
      res.json({ error: 'Unauthorized' });
      return;
    }
    res.statusCode = 200;
    res.json({ id: userId, email: user.email });
  }
};
