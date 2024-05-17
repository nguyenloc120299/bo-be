import { botTele } from "../app";

export const ID_CHAT = `-2142948240`;




export const testBot = async () => {
  await botTele.sendMessage(ID_CHAT, `TEST`);
};

export const sendMessage = async (content: string) => {
  await botTele.sendMessage(ID_CHAT, content);
};