import { saveSlackEvent } from "../../../utils/firestore/slack-event";
import { functions256MB } from "../../../utils/functions";
import { replyToSlackThread } from "../../../utils/slack/reply-to-thread";
import { isMessageEvent } from "../../../utils/slack/types/message-events";
import { getRefreshedAccessToken } from "./get-refreshed-access-token";

export const slackWebhook = functions256MB.https.onRequest(async (req, res) => {
  try {
    // Handling URL verification
    if (req.body.type === "url_verification") {
      res.status(200).send(req.body.challenge);
      return;
    }

    const { body } = req;
    if (!isMessageEvent(body)) {
      res.status(200).send("Success");
      return;
    }

    const { team_id: teamId, event } = body;
    const { channel, ts: timestamp } = event;

    await saveSlackEvent(body);

    const accessToken = await getRefreshedAccessToken(teamId);

    await replyToSlackThread({
      accessToken,
      channel: channel,
      threadTimestamp: timestamp,
      text: "Soraがメッセージを処理しています。"
    });

    res.status(200).send("Success");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
