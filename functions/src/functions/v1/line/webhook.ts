import { Client } from "@line/bot-sdk";
import {
  LINE_CHANNEL_ACCESS_TOKEN,
  LINE_CHANNEL_SECRET
} from "../../../utils/env";
import { functions128MB } from "../../../utils/functions";

const lineClient = new Client({
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
});

/**
 * Hello World関数
 */
export const lineWebhook = functions128MB.https.onRequest(async (req, res) => {
  const event = req.body.events[0];
  console.log(event);
  // Hello Wolrdを送信する。
  await lineClient.replyMessage(event.replyToken, {
    type: "text",
    text: "Hello World!!!"
  });
  res.status(200).send();
});
