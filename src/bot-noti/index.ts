import { chat_id_tele } from "../config";
import { botTele } from "../app";

const ID_CHAT = chat_id_tele;
export const testBot = async () => {
  await botTele.sendMessage(ID_CHAT, `TEST`);
};

export const sendMessage = async (content: string) => {
  try {
    await botTele.sendMessage(ID_CHAT, content);
  } catch (error) {
    console.log(error);
  }
};
