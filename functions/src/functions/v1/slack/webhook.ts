import {
  getSlackToken,
  refreshSlackToken,
} from "../../../utils/firestore/slack-token";
import { functions256MB } from "../../../utils/functions";
import { refreshToken } from "../../../utils/slack/refresh-token";
import { replyToSlackThread } from "../../../utils/slack/reply-to-thread";

type SlackEvent = {
  client_msg_id: string;
  type: string;
  text: string;
  user: string;
  ts: string;
  blocks: unknown[];
  team: string;
  channel: string;
  event_ts: string;
  channel_type: string;
};

type SlackAuthorization = {
  enterprise_id: null | string;
  team_id: string;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install: boolean;
};

type SlackWebhookRequestBody = {
  token: string;
  team_id: string;
  context_team_id: string;
  context_enterprise_id: null | string;
  api_app_id: string;
  event: SlackEvent;
  type: string;
  event_id: string;
  event_time: number;
  authorizations: SlackAuthorization[];
  is_ext_shared_channel: boolean;
  event_context: string;
};

export const slackWebhook = functions256MB.https.onRequest(async (req, res) => {
  try {
    // Handling URL verification
    if (req.body.type === "url_verification") {
      res.send(req.body.challenge);
      return;
    }

    const body: SlackWebhookRequestBody = req.body;

    const teamId = body.team_id; // Retrieve teamId from the Slack request

    if (!teamId) {
      res.status(400).send("Error: Missing team_id");
      return;
    }

    const tokenData = await getSlackToken(teamId);

    // Check if the token expiration time is less than 15 minutes
    const now = new Date();
    // Calculate time left in seconds
    const timeLeft =
      (tokenData.expires_at.toDate().getTime() - now.getTime()) / 1000;

    if (timeLeft <= 15 * 60) {
      // 15 minutes in seconds
      const refreshedData = await refreshToken(tokenData.refresh_token);

      const refreshedAccessToken = refreshedData.access_token;
      const refreshedRefreshToken = refreshedData.refresh_token;
      const refreshedExpiresInSeconds = refreshedData.expires_in;

      if (!refreshedRefreshToken || !refreshedExpiresInSeconds) {
        res.status(500).send("Error: Missing data for token rotation");
        return;
      }

      await refreshSlackToken({
        teamId: teamId,
        accessToken: refreshedAccessToken,
        expiresInSeconds: refreshedExpiresInSeconds,
        refreshToken: refreshedRefreshToken,
      });

      if (body.event.user !== tokenData.bot_user_id) {
        await replyToSlackThread({
          accessToken: refreshedAccessToken,
          channel: body.event.channel,
          threadTimestamp: body.event.ts,
          text: "Token refreshed",
        });
      }
    } else {
      if (body.event.user !== tokenData.bot_user_id) {
        await replyToSlackThread({
          accessToken: tokenData.access_token,
          channel: body.event.channel,
          threadTimestamp: body.event.ts,
          text: "Token is still valid",
        });
      }
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
