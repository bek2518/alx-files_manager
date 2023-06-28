import { promises } from 'fs';
import { ObjectID } from 'mongodb';
import Queue from 'bull/lib/queue';
import imageThumbnail from 'image-thumbnail';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');

fileQueue.process(async (job, done) => {
  const { fileId } = job.data;
  const { userId } = job.data;

  if (!fileId) {
    done(new Error('Missing fileId'));
  }
  if (!userId) {
    done(new Error('Missing userId'));
  }

  const file = await dbClient.db.collection('files').findOne({ _id: new ObjectID(fileId), userId });
  if (!file) {
    done(new Error('File not found'));
  }

  const { localPath } = file;

  let image = await imageThumbnail(localPath, 500);
  let newPath = `${localPath}_500`;
  await promises.writeFile(newPath, image);

  image = await imageThumbnail(localPath, 250);
  newPath = `${localPath}_250`;
  await promises.writeFile(newPath, image);

  image = await imageThumbnail(localPath, 100);
  newPath = `${localPath}_100`;
  await promises.writeFile(newPath, image);
  done();
});

userQueue.process(async (job, done) => {
  const { userId } = job.data;
  if (!userId) {
    done(new Error('Missing userId'));
  }
  const user = await dbClient.db.collection('users').findOne({ _id: new ObjectID(userId) });
  if (!user) {
    done(new Error('User not found'));
  }
  console.log(`Welcome ${user.email}!`);
});
