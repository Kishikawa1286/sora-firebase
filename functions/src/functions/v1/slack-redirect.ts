import { setSlackToken } from "../../utils/firestore/slack-token";
import { functions128MB } from "../../utils/functions";
import { fetchSlackAccessToken } from "../../utils/slack/fetch-access-token";

export const slackRedirect = functions128MB.https.onRequest(
  async (req, res) => {
    const code = req.query.code; // Temporal access code provided by Slack

    if (typeof code !== "string") {
      res.status(400).send("Error: Missing code parameter");
      return;
    }

    try {
      // Retrieve access token via Slack API
      const data = await fetchSlackAccessToken(code);

      const { teamId, accessToken, botUserId, expiresInSeconds, refreshToken } =
        data;

      if (!expiresInSeconds || !refreshToken) {
        res.status(500).send("Error: Missing data for token rotation");
        return;
      }

      await setSlackToken({
        teamId,
        accessToken,
        expiresInSeconds,
        refreshToken,
        botUserId,
      });

      res.status(200).send("Success! Token saved.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);
