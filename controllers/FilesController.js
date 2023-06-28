import { ObjectID } from 'mongodb';
import { v4 } from 'uuid';
import { promises } from 'fs';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

module.exports = class FilesController {
  static async postUpload(req, res) {
    const xToken = req.header('X-Token');
    const token = `auth_${xToken}`;
    const userId = await redisClient.get(token);

    const user = await dbClient.db.collection('users').findOne({ _id: new ObjectID(userId) });

    if (!user) {
      res.statusCode = 401;
      res.json({ error: 'Unauthorized' });
      return;
    }

    const { name } = req.body;
    const { type } = req.body;
    const parentId = req.body.parentId || 0;
    const isPublic = req.body.isPublic || false;
    const { data } = req.body;

    if (!name) {
      res.statusCode = 400;
      res.json({ error: 'Missing name' });
      return;
    }

    if (!type) {
      res.statusCode = 400;
      res.json({ error: 'Missing type' });
      return;
    }

    if (!data && type !== 'folder') {
      res.statusCode = 400;
      res.json({ error: 'Missing data' });
      return;
    }

    if (parentId) {
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectID(parentId) });
      if (!file) {
        res.statusCode = 400;
        res.json({ error: 'Parent not found' });
        return;
      }

      if (file.type !== 'folder') {
        res.statusCode = 400;
        res.json({ error: 'Parent is not a folder' });
        return;
      }
    }
    if (type === 'folder') {
      await dbClient.db.collection('files').insertOne({
        userId, name, type, parentId, isPublic,
      }).then((result) => {
        res.statusCode = 201;
        res.json({
          id: result.insertedId, userId, name, type, parentId, isPublic,
        });
      });
    } else {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const localPath = `${folderPath}/${v4()}`;
      const file = Buffer.from(data, 'base64');

      try {
        await promises.mkdir(folderPath);
      } catch (err) {
        console.log(err);
      }

      try {
        await promises.writeFile(localPath, file, 'utf-8');
      } catch (err) {
        console.log(err);
      }
      await dbClient.db.collection('files').insertOne({
        userId, name, type, isPublic, parentId, localPath,
      }).then((result) => {
        res.statusCode = 201;
        res.json({
          id: result.insertedId, userId, name, type, isPublic, parentId, localPath,
        });
      });
    }
  }

  static async getShow(req, res) {
    const xToken = req.header('X-Token');
    const token = `auth_${xToken}`;
    const userId = await redisClient.get(token);

    const user = await dbClient.db.collection('users').findOne({ _id: new ObjectID(userId) });

    if (!user) {
      res.statusCode = 401;
      res.json({ error: 'Unauthorized' });
      return;
    }

    const parentId = req.params.id;

    const file = await dbClient.db.collection('files').findOne({ _id: new ObjectID(parentId), userId });
    if (!file) {
      res.statusCode = 404;
      res.json({ error: 'Not found' });
      return;
    }
    res.statusCode = 200;
    res.json(file);
  }

  static async getIndex(req, res) {
    const xToken = req.header('X-Token');
    const token = `auth_${xToken}`;
    const userId = await redisClient.get(token);

    const user = await dbClient.db.collection('users').findOne({ _id: new ObjectID(userId) });

    if (!user) {
      res.statusCode = 401;
      res.json({ error: 'Unauthorized' });
      return;
    }

    const { parentId } = req.query;
    const page = req.query.page || 0;

    let filter = {};
    if (parentId) {
      filter = { parentId, userId };
    } else {
      filter = { userId };
    }
    const files = await dbClient.db.collection('files')
      .aggregate([
        { $match: filter },
        { $sort: { _id: -1 } },
        { $skip: parseInt(page.toString(), 10) * 20 },
        { $limit: 20 },
        {
          $project: {
            _id: 0,
            id: '$_id',
            userId: '$userId',
            name: '$name',
            type: '$type',
            isPublic: '$isPublic',
            parentId: {
              $cond: { if: { $eq: ['$parentId', '0'] }, then: 0, else: '$parentId' },
            },
          },
        },
      ]).toArray();
    res.status(200).json(files);
  }
};
