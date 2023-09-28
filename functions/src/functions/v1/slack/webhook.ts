import { saveSlackEvent } from "../../../utils/firestore/slack-event";
import { getSlackToken } from "../../../utils/firestore/slack-token";
import { functions256MB } from "../../../utils/functions";
import { isSlackMessageEvent } from "../../../utils/slack/types/message-events";

export const slackWebhook = functions256MB.https.onRequest(async (req, res) => {
  try {
    // Handling URL verification
    if (req.body.type === "url_verification") {
      res.status(200).send(req.body.challenge);
      return;
    }

    const { body } = req;
    if (!isSlackMessageEvent(body)) {
      res.status(200).send("Success");
      return;
    }

    const { team_id: teamId, event } = body;
    const { user: slackUserId } = event;
    const tokenData = await getSlackToken(teamId);
    if (slackUserId === tokenData.bot_user_id) {
      return;
    }

    await saveSlackEvent(body);

    res.status(200).send("Success");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
