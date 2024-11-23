require('dotenv').config();

module.exports = {
    port: Number(process.env.PORT),
    redisIsOn: Boolean(process.env.REDIS_ON),
}