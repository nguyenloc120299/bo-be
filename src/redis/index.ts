import { any } from "joi";
import { createClient } from "redis";

const redisURL = `redis://127.0.0.1:6379`;

const client = createClient({ url: redisURL });

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

export async function keyExists(...keys: string[]) {
  return (await client.exists(keys)) ? true : false;
}

export async function setValue(
  key: string,
  value: string | number | boolean,
  expireAt: Date | null = null
) {
  if (expireAt) return client.pSetEx(key, expireAt.getTime(), `${value}`);
  else return client.set(key, `${value}`);
}

export async function getValue(key: string) {
  return client.get(key);
}

export default client;
