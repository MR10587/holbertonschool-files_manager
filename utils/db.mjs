import { MongoClient } from "mongodb";

const host = process.env.DB_HOST || "localhost";
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || "files_manager";

class DBClient {
  constructor() {
    this.client = new MongoClient(`mongodb://${host}:${port}/${database}`);
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    try {
      await this.client.connect();
      const collection = this.client.db(database).collection("users");
      return await collection.count();
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  async nbFiles() {
    try {
      await this.client.connect();
      const collection = this.client.db(database).collection("files");
      return await collection.count();
    } catch (error) {
      console.error(error);
      return 0;
    }
  }
}

const dbClient = new DBClient();

export default dbClient;
