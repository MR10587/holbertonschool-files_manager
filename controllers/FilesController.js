import dbClient from "../utils/db";
import redisClient from "../utils/redis";

const postUpload = async (req, res) => {
  const filesCollection = dbClient.db.collection("files");
  const token = req.header("X-Token");

  const user = await redisClient.get(`auth_${token}`);

  if (!user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const types = ["folder", "image", "file"];

  const { name, type, parentId, isPublic, data } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Missing name",
    });
  }

  if (!type || !types.includes(type)) {
    return res.status(400).json({
      error: "Missing type",
    });
  }

  if (type != folder && !data) {
    return res.status(400).json({
      error: "Missing  data",
    });
  }

  if (parentId) {
    if (!filesCollection.findOne(parentId)) {
      return res.status(400).json({
        error: "Parent not found",
      });
    } else if (filesCollection.findOne(parentId).type != "folder") {
      return res.status(400).json({
        error: "Parent is not a folder",
      });
    }
  }

  filesCollection.insertOne({
    
  })
};
