import { WebhookEvent } from "@line/bot-sdk/lib/types";
import { functions128MB } from "../../../utils/functions";
import { lineClient } from "../../../utils/line/line-client";

export const lineWebhook = functions128MB.https.onRequest(async (req, res) => {
  await Promise.all(
    req.body.events.map((event: WebhookEvent) => replyWebhookEvent(event))
  );

  res.status(200).send();
});
const replyWebhookEvent = async (event: WebhookEvent) => {
  if (
    event.type !== "message" ||
    event.message.type !== "text" ||
    event.source.type !== "group"
  ) {
    return;
  }

  const groupId = event.source.groupId;
  const userId = event.source.userId;
  if (!userId) return;

  const memberProfile = await lineClient.getGroupMemberProfile(groupId, userId);
  console.log(memberProfile);
  lineClient.replyMessage(event.replyToken, {
    type: "text",
    text: JSON.stringify(memberProfile)
  });
};
