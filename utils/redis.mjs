import redis from "redis";


class RedisClient {
    constructor() {
        this.client = redis.createClient();
    
        this.client.on("error", (err) => {
          console.error(err);
        });
      }
    

    isAlive() {
        return this.client.connected;
    }
    
    async get(key) {
        return await this.client.get(key);
    }
    
    async set(key, value, duration) {
        await this.client.set(key, value, {
            EX: duration
        });
    }
    
    async del(key) {
        await this.client.del(key);
    }
}

const redisClient = new RedisClient();

export default redisClient;
