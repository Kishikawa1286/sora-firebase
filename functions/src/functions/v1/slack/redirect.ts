import { setSlackToken } from "../../../utils/firestore/slack-token";
import { functions128MB } from "../../../utils/functions";
import { fetchSlackAccessToken } from "../../../utils/slack/fetch-access-token";

export const slackRedirect = functions128MB.https.onRequest(
  async (req, res) => {
    const code = req.query.code; // Temporal access code provided by Slack

    if (typeof code !== "string") {
      res.status(400).send("Error: Missing code parameter");
      return;
    }

    try {
      const data = await fetchSlackAccessToken(code);

      const accessToken = data.access_token;
      const expiresInSeconds = data.expires_in;
      const refreshToken = data.refresh_token;
      const botUserId = data.bot_user_id;
      const teamId = data.team?.id;

      if (
        !accessToken ||
        !expiresInSeconds ||
        !refreshToken ||
        !botUserId ||
        !teamId
      ) {
        res.status(500).send("Error: Missing data from Slack API");
        return;
      }

      await setSlackToken({
        teamId,
        accessToken,
        expiresInSeconds,
        refreshToken,
        botUserId,
      });

      res.status(200).redirect(`https://app.slack.com/client/${teamId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);
