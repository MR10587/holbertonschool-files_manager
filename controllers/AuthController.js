import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export const getConnect = async (req, res) => {
  const usersCollection = dbClient.db.collection('users');

  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const baseToDecode = authHeader.split(' ')[1];
  let decodedString = Buffer.from(baseToDecode, 'base64').toString('utf8');

  const [email, password] = decodedString.split(':');

  if (!email || !password) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const hashedPassword = crypto
    .createHash('sha1')
    .update(password)
    .digest('hex');

  const user = await usersCollection.findOne({
    email,
    password: hashedPassword,
  });

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = uuidv4();

  await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

  return res.status(200).json({
    token,
  });
};

export const getDisconnect = async (req, res) => {
  const token = req.header('X-Token');

  const user = await redisClient.get(`auth_${token}`);

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  await redisClient.del(`auth_${token}`);

  return res.sendStatus(204);
};
