"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValue = exports.setValue = exports.keyExists = void 0;
const redis_1 = require("redis");
const redisURL = `redis://127.0.0.1:6379`;
const client = (0, redis_1.createClient)({ url: redisURL });
client.on("connect", () => console.info("Cache is connecting"));
client.on("ready", () => console.info("Cache is ready"));
client.on("end", () => console.info("Cache disconnected"));
client.on("reconnecting", () => console.info("Cache is reconnecting"));
client.on("error", (e) => console.error(e));
(async () => {
    await client.connect();
})();
// If the Node process ends, close the Cache connection
process.on("SIGINT", async () => {
    await client.disconnect();
});
async function keyExists(...keys) {
    return (await client.exists(keys)) ? true : false;
}
exports.keyExists = keyExists;
async function setValue(key, value, expireAt = null) {
    if (expireAt)
        return client.pSetEx(key, expireAt.getTime(), `${value}`);
    else
        return client.set(key, `${value}`);
}
exports.setValue = setValue;
async function getValue(key) {
    return client.get(key);
}
exports.getValue = getValue;
exports.default = client;
//# sourceMappingURL=index.js.map