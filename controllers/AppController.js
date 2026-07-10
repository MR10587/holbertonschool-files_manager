import dbClient from "../utils/db.mjs";
import redisClient from "../utils/redis.mjs";

const getStatus = function (req, res) {
  if (dbClient.isAlive && redisClient.isAlive) {
    res.status(200).json({ redis: true, db: true });
  }
};

const getStats = function (req, res) {
  const nbUsers = dbClient.nbUsers;
  const nbFiles = dbClient.nbFiles;

  res.status(200).json({ users: nbUsers, files: nbFiles });
};

export default { getStats, getStatus };
