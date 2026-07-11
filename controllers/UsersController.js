import crypto from 'crypto';
import mongodb from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const { ObjectId } = mongodb;

export const postNew = async (req, res) => {
  const usersCollection = dbClient.db.collection('users');
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const user = await usersCollection.findOne({ email });

  if (user) {
    return res.status(400).json({ error: 'Already exist' });
  }

  const hashedPassword = crypto
    .createHash('sha1')
    .update(password)
    .digest('hex');

  const newUser = await usersCollection.insertOne({
    email,
    password: hashedPassword,
  });

  return res.status(201).json({
    id: newUser.insertedId.toString(),
    email,
  });
};

export const getMe = async (req, res) => {
  const usersCollection = dbClient.db.collection('users');
  const token = req.header('X-Token');

  const userId = await redisClient.get(`auth_${token}`);

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const user = await usersCollection.findOne({
    _id: new ObjectId(userId),
  });

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  return res.status(200).json({
    email: user.email,
    id: user._id.toString(),
  });
};
