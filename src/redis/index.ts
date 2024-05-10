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
  value: any,
  expireMinutes: number | null = null
) {
  if (expireMinutes)
    return client.pSetEx(
      key,
      new Date(Date.now() + expireMinutes * 60 * 1000).getTime(),
      `${value}`
    );
  else return client.set(key, `${value}`);
}

export async function getValue(key: string) {
  try {
    let value = await client.get(key);

    if (!value) {
      return null;
    }

    if (typeof value !== "string") {
      console.error(`Invalid data stored in Redis for key '${key}'.`);
      return null;
    }

    return value;
  } catch (error) {
    console.error("Error while getting value from Redis:", error);
    return null;
  }
}

export default client;
