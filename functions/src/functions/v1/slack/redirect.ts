import { FIREBASE_HOSTING_URL } from "../../../utils/env";
import {
  getVerifiedSlackUser,
  setSlackToken
} from "../../../utils/firestore/slack-token";
import { createSlackVerificationCode } from "../../../utils/firestore/slack-verification-code";
import { functions128MB } from "../../../utils/functions";
import { generateUrlWithParams } from "../../../utils/generate-url-with-parans";
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
      const slackUserId = data.authed_user?.id;

      if (
        !accessToken ||
        !expiresInSeconds ||
        !refreshToken ||
        !botUserId ||
        !teamId ||
        !slackUserId
      ) {
        res.status(500).send("Error: Missing data from Slack API");
        return;
      }

      await setSlackToken({
        teamId,
        accessToken,
        expiresInSeconds,
        refreshToken,
        botUserId
      });

      const user = await getVerifiedSlackUser(teamId, slackUserId);
      if (user) {
        res.status(200).redirect(`https://app.slack.com/client/${teamId}`);
        return;
      }

      const verificationCode = await createSlackVerificationCode({
        slackUserId,
        slackTeamId: teamId
      });
      const verificationUrl = generateUrlWithParams(FIREBASE_HOSTING_URL, {
        code: verificationCode.code
      });

      res.status(200).redirect(verificationUrl);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  }
);
