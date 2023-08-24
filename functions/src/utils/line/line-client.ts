import { Client } from "@line/bot-sdk";
import { LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET } from "../env";

export const lineClient = new Client({
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
});
