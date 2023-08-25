import { WebhookEvent } from "@line/bot-sdk/lib/types";
import axios from "axios";
import { logger } from "firebase-functions/v1";
import { LINE_CHANNEL_ACCESS_TOKEN } from "../../../utils/env";
import { functions128MB } from "../../../utils/functions";

export const lineWebhook = functions128MB.https.onRequest(async (req, res) => {
  // logger.info("called lineWebhook function");
  // logger.info("request body", req.body);
  // logger.info("request body events", req.body.events);
  try {
    await Promise.all(
      req.body.events.map((event: WebhookEvent) => replyWebhookEvent(event))
    );

    res.status(200).send();
  } catch (e) {
    logger.error(e);
  }
});

const replyWebhookEvent = async (event: WebhookEvent) => {
  // logger.info("event", event);
  // logger.info("event type", event.type);
  // logger.info("event source type", event.source.type);

  if (
    event.type !== "message" ||
    event.message.type !== "text" ||
    event.source.type !== "group"
  ) {
    return;
  }

  const groupId = event.source.groupId;
  const userId = event.source.userId;
  const apiUrl = `https://api.line.me/v2/bot/group/${groupId}/summary`;
  const headers = {
    Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
  };

  if (!userId) return;
  axios
    .get(apiUrl, { headers })
    .then((response) => {
      const groupSummary = response.data;
      console.log(groupSummary);
      // ここで取得したグループのサマリー情報を利用できます
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
