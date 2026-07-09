import { createClient } from "redis";

class RedisClient {
    constructor() {
        this.client = createClient();
        this.client.on("error", err => console.log(err));
        this.client.connect().catch(console.error);
    }

    isAlive() {
        return this.client.isOpen
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
        await this.client.del(key)
    }
}

const redisClient = RedisClient();

export default redisClient;
