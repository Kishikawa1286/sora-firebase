import { Client } from "@line/bot-sdk";
import { WebhookEvent } from "@line/bot-sdk/lib/types";
import {
  LINE_CHANNEL_ACCESS_TOKEN,
  LINE_CHANNEL_SECRET
} from "../../../utils/env";
import { functions128MB } from "../../../utils/functions";

/**
 * Hello World関数
 */
export const lineWebhook = functions128MB.https.onRequest(async (req, res) => {
  const client = new Client({
    channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: LINE_CHANNEL_SECRET
  });

  await Promise.all(
    req.body.events.map((event: WebhookEvent) =>
      replyWebhookEvent(event, client)
    )
  );

  res.status(200).send();
});

const replyWebhookEvent = (event: WebhookEvent, client: Client) => {
  if (event.type !== "message" || event.message.type !== "text") return;

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: event.message.text
  });
};
