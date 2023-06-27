import sha1 from 'sha1';
import dbClient from '../utils/db';

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
    const newUser = await dbClient.db().collection('users').insertOne({ email, password: hashesPassword });
    res.statusCode = 201;
    res.json({ id: newUser.insertedId, email });
  }
};
