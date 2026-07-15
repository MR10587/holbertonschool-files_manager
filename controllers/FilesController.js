import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import mongodb from "mongodb";

import dbClient from "../utils/db";
import redisClient from "../utils/redis";

const { ObjectId } = mongodb;

const FOLDER_PATH = process.env.FOLDER_PATH || "/tmp/files_manager";

export const postUpload = async (req, res) => {
  const token = req.header("X-Token");
  const userId = await redisClient.get(`auth_${token}`);

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const { name, type, parentId = 0, isPublic = false, data } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Missing name",
    });
  }

  if (!type || !["folder", "file", "image"].includes(type)) {
    return res.status(400).json({
      error: "Missing type",
    });
  }

  if (type !== "folder" && !data) {
    return res.status(400).json({
      error: "Missing data",
    });
  }

  const filesCollection = dbClient.db.collection("files");

  if (parentId !== 0) {
    const parent = await filesCollection.findOne({
      _id: new ObjectId(parentId),
    });

    if (!parent) {
      return res.status(400).json({
        error: "Parent not found",
      });
    }

    if (parent.type !== "folder") {
      return res.status(400).json({
        error: "Parent is not a folder",
      });
    }
  }

  if (type === "folder") {
    const doc = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    const result = await filesCollection.insertOne(doc);

    return res.status(201).json({
      id: result.insertedId.toString(),
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
  }

  await fs.mkdir(FOLDER_PATH, { recursive: true });

  const filename = uuidv4();
  const localPath = path.join(FOLDER_PATH, filename);

  const fileBuffer = Buffer.from(data, "base64");

  await fs.writeFile(localPath, fileBuffer);

  const doc = {
    userId,
    name,
    type,
    isPublic,
    parentId,
    localPath,
  };

  const result = await filesCollection.insertOne(doc);

  return res.status(201).json({
    id: result.insertedId.toString(),
    userId,
    name,
    type,
    isPublic,
    parentId,
  });
};

export const getShow = async (req, res) => {
  const token = req.header("X-Token");
  const user = await redisClient.get(`auth_${token}`);
  const id = req.params.id;
  const filesCollection = dbClient.db.collection("files");

  if (!user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const file = await filesCollection.findOne({ id });

  if (!file) {
    return res.status(404).json({
      error: 'Not found'
    });
  }

  return res.status(200).json(file)
};

export const getIndex = async(req, res) => {
  const token = req.header("X-Token");
  const user = await redisClient.get(`auth_${token}`);
  const filesCollection = dbClient.db.collection("files");
  let parentId = req.query.parentId;
  const pages = req.query.pages;

  if (!user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  if (!parentId) {
    parentId = 0;
  }

  return await filesCollection.findOne({ parentId }) || [];
}
