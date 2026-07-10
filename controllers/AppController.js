import dbClient from '../utils/db.mjs';
import redisClient from '../utils/redis.mjs';

export const getStatus = function (req, res) {
  res
    .status(200)
    .json({ 'redis': redisClient.isAlive(), 'db': dbClient.isAlive() });
};

export const getStats = async function (req, res) {
  const nbUsers = await dbClient.nbUsers();
  const nbFiles = await dbClient.nbFiles();

  res.status(200).json({ users: nbUsers, files: nbFiles });
};
