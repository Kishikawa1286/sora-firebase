import { createSlackMessage } from "../../../utils/firestore/message";
import { createSlackSender } from "../../../utils/firestore/sender";
import {
  getSlackToken,
  getVerifiedSlackUser,
  refreshSlackToken,
  setVerifiedSlackUser,
} from "../../../utils/firestore/slack-token";
import {
  deleteSlackVerificationCode,
  searchSlackVerificationCodeByCode,
} from "../../../utils/firestore/slack-verification-code";
import { functions256MB } from "../../../utils/functions";
import { fetchConversationsInfo } from "../../../utils/slack/fetch-conversations-info";
import { fetchUserInfo } from "../../../utils/slack/fetch-users-info";
import { refreshToken } from "../../../utils/slack/refresh-token";
import { replyToSlackThread } from "../../../utils/slack/reply-to-thread";

type SlackBlock = Record<string, unknown>;

type SlackEvent = {
  client_msg_id: string;
  type: "message";
  text: string;
  user: string;
  ts: string;
  blocks: SlackBlock[];
  team: string;
  channel: string;
  event_ts: string;
  channel_type: "channel" | "group" | "im" | "mpim";
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
  type: "message";
  event_id: string;
  event_time: number;
  authorizations: SlackAuthorization[];
  is_ext_shared_channel: boolean;
  event_context: string;
};

const getRefreshedAccessToken = async (teamId: string): Promise<string> => {
  const tokenData = await getSlackToken(teamId);

  // Check if the token expiration time is less than 15 minutes
  const now = new Date();
  // Calculate time left in seconds
  const timeLeft =
    (tokenData.expires_at.toDate().getTime() - now.getTime()) / 1000;

  // If the token is valid for more than 15 minutes, return the token
  if (timeLeft > 15 * 60) {
    return tokenData.access_token;
  }

  const refreshedData = await refreshToken(tokenData.refresh_token);

  const refreshedAccessToken = refreshedData.access_token;
  const refreshedRefreshToken = refreshedData.refresh_token;
  const refreshedExpiresInSeconds = refreshedData.expires_in;

  // These variables are normally not undefined, but check them for linter
  if (!refreshedRefreshToken || !refreshedExpiresInSeconds) {
    throw new Error("Missing data for token rotation");
  }

  await refreshSlackToken({
    teamId: teamId,
    accessToken: refreshedAccessToken,
    expiresInSeconds: refreshedExpiresInSeconds,
    refreshToken: refreshedRefreshToken,
  });

  return refreshedAccessToken;
};

const handleDirectMessage = async (
  accessToken: string,
  body: SlackWebhookRequestBody
): Promise<void> => {
  const { text } = body.event;
  const verificationCodeData = await searchSlackVerificationCodeByCode(text);
  const isCodeExists = verificationCodeData !== undefined;

  if (!isCodeExists) {
    await replyToSlackThread({
      accessToken,
      channel: body.event.channel,
      threadTimestamp: body.event.ts,
      text: "Invalid verification code.",
    });

    return;
  }

  await setVerifiedSlackUser(body.team_id, verificationCodeData.app_user_id);

  await deleteSlackVerificationCode(verificationCodeData.id);

  await replyToSlackThread({
    accessToken,
    channel: body.event.channel,
    threadTimestamp: body.event.ts,
    text: "Verification code is valid.",
  });
};

const getChannelName = async (
  accessToken: string,
  channelId: string
): Promise<string | null> => {
  const response = await fetchConversationsInfo(accessToken, channelId);
  return response.channel?.name ?? null;
};

const handleChannelMessage = async (accessToken: string, event: SlackEvent) => {
  // Throw an error if it's a direct message
  if (event.channel_type === "im") {
    throw new Error("Direct messages are not supported.");
  }

  const verifiedUser = await getVerifiedSlackUser(event.team, event.user);
  if (!verifiedUser) {
    throw new Error("User is not verified.");
  }

  const userId = verifiedUser.id;

  const slackUserInfo = await fetchUserInfo(accessToken, event.user);
  if (!slackUserInfo.ok) {
    throw new Error("Failed to fetch Slack user info");
  }

  const senderId = slackUserInfo.user?.id;
  const senderName = slackUserInfo.user?.real_name;
  const slackTeamId = slackUserInfo.user?.team_id;
  const slackEmail = slackUserInfo.user?.profile?.email;
  const senderIconUrl = slackUserInfo.user?.profile?.image_original;

  if (
    !senderId ||
    !senderName ||
    !slackTeamId ||
    !slackEmail ||
    !senderIconUrl
  ) {
    throw new Error("Missing data from Slack user info");
  }

  const channelName = await getChannelName(accessToken, event.channel);

  if (!channelName) {
    throw new Error("Missing channel name");
  }

  // Create a Message Document in Firestore
  await createSlackMessage({
    userId,
    message: event.text,
    summary: "", // TODO: This summary needs to be set appropriately
    botMessage: "", // TODO: This bot message also needs to be set appropriately
    senderId,
    senderName,
    senderIconUrl,
    slackTeamId,
    slackUserId: event.user,
    slackSenderUserId: event.user,
    slackChannelId: event.channel,
    slackChannelName: channelName,
    slackThreadTs: event.ts,
  });

  // Create a Sender Document in Firestore
  await createSlackSender({
    userId,
    id: senderId,
    senderId,
    senderName,
    slackTeamId,
    slackEmail,
  });
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

    // Refresh if expired
    const accessToken = await getRefreshedAccessToken(teamId);

    if (body.event.channel_type === "im") {
      await handleDirectMessage(accessToken, body);
    } else {
      await handleChannelMessage(accessToken, body.event);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
