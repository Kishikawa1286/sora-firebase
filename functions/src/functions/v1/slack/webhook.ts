import { createSlackMessage } from "../../../utils/firestore/message";
import { setSlackSender } from "../../../utils/firestore/sender";
import {
  getVerifiedSlackUser,
  setVerifiedSlackUser,
  VerifiedSlackUser
} from "../../../utils/firestore/slack-token";
import {
  deleteSlackVerificationCode,
  searchSlackVerificationCodeByCode
} from "../../../utils/firestore/slack-verification-code";
import { setSlackUser } from "../../../utils/firestore/user";
import { functions256MB } from "../../../utils/functions";
import { summarize } from "../../../utils/openai/summarize";
import { extractSlackMentions } from "../../../utils/slack/extract-mentions";
import { fetchChannelName } from "../../../utils/slack/fetch-conversations-info";
import { fetchTeamInfo } from "../../../utils/slack/fetch-team-info";
import { fetchUserInfo } from "../../../utils/slack/fetch-users-info";
import { replyToSlackThread } from "../../../utils/slack/reply-to-thread";
import { getRefreshedAccessToken } from "./get-refreshed-access-token";

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

const handleDirectMessage = async (
  accessToken: string,
  body: SlackWebhookRequestBody
): Promise<void> => {
  const { text } = body.event;
  const verificationCodeData = await searchSlackVerificationCodeByCode(text);
  const isCodeExists = verificationCodeData !== undefined;
  if (!isCodeExists) {
    return;
  }

  const teamInfoRes = await fetchTeamInfo(accessToken, body.team_id);
  const { team } = teamInfoRes;
  if (!team) {
    throw new Error("Failed to fetch Slack team info");
  }
  const { domain, name, icon } = team;
  if (!domain || !name || !icon) {
    throw new Error("Missing data from Slack team info");
  }
  const teamIconUrl = icon.image_original;
  if (!teamIconUrl) {
    throw new Error("Missing team icon URL");
  }

  await setVerifiedSlackUser(body.team_id, verificationCodeData.app_user_id);

  await deleteSlackVerificationCode(verificationCodeData.id);

  await setSlackUser({
    userId: verificationCodeData.app_user_id,
    slackUserId: body.event.user,
    slackTeamId: body.team_id,
    slackTeamAvatarBaseUrl: team.avatar_base_url,
    slackTeamDiscoverable: team.discoverable,
    slackTeamDomain: domain,
    slackTeamIconUrl: teamIconUrl,
    slackTeamName: name,
    language: verificationCodeData.language
  });

  await replyToSlackThread({
    accessToken,
    channel: body.event.channel,
    threadTimestamp: body.event.ts,
    text: "認証されました！"
  });
};

const handleChannelMessage = async (accessToken: string, event: SlackEvent) => {
  // Throw an error if it's a direct message
  if (event.channel_type === "im") {
    throw new Error("Direct messages are not supported.");
  }

  const mentionedUserIds = extractSlackMentions(event.text);
  const verifiedUsers = (
    await Promise.all(
      mentionedUserIds.map((slackUserId) =>
        getVerifiedSlackUser(event.team, slackUserId)
      )
    )
  ).filter((user) => user !== null) as VerifiedSlackUser[];

  const senderInfo = await fetchUserInfo(accessToken, event.user);
  if (!senderInfo.ok) {
    throw new Error("Failed to fetch Slack user info");
  }

  const senderId = senderInfo.user?.id;
  const senderName = senderInfo.user?.real_name;
  const slackTeamId = senderInfo.user?.team_id;
  const senderSlackEmail = senderInfo.user?.profile?.email;
  const senderIconUrl = senderInfo.user?.profile?.image_original;

  if (
    !senderId ||
    !senderName ||
    !slackTeamId ||
    !senderSlackEmail ||
    !senderIconUrl
  ) {
    throw new Error("Missing data from Slack user info");
  }

  const channelName = await fetchChannelName(accessToken, event.channel);

  if (!channelName) {
    throw new Error("Missing channel name");
  }

  const teamInfoRes = await fetchTeamInfo(accessToken, event.team);
  const { team } = teamInfoRes;
  if (!team) {
    throw new Error("Failed to fetch Slack team info");
  }
  const { domain, name, icon } = team;
  if (!domain || !name || !icon) {
    throw new Error("Missing data from Slack team info");
  }
  const teamIconUrl = icon.image_original;
  if (!teamIconUrl) {
    throw new Error("Missing team icon URL");
  }

  const summary = await summarize(event.text);

  if (!summary) {
    throw new Error("Failed to summarize");
  }

  const botMessage = `あなたのメッセージと以下の要約を送信しました。\n\n ${summary}`;

  await replyToSlackThread({
    accessToken,
    channel: event.channel,
    threadTimestamp: event.ts,
    text: botMessage
  });

  await Promise.all(
    // For all mentioned verified users
    verifiedUsers.map(async (user) => {
      const userId = user.id; // Firebase User ID
      // Create a Message Document in Firestore
      await createSlackMessage({
        userId,
        message: event.text,
        summary,
        botMessage,
        senderId,
        senderName,
        senderIconUrl,
        slackTeamId,
        slackTeamDomain: domain,
        slackTeamIconUrl: teamIconUrl,
        slackTeamName: name,
        slackUserId: event.user,
        slackSenderUserId: event.user,
        slackChannelId: event.channel,
        slackChannelName: channelName,
        slackThreadTs: event.ts
      });

      // Update the Sender Document in Firestore
      await setSlackSender({
        userId,
        id: senderId,
        senderName,
        slackTeamId,
        slackTeamDomain: domain,
        slackTeamIconUrl: teamIconUrl,
        slackTeamName: name,
        slackEmail: senderSlackEmail,
        iconUrl: senderIconUrl
      });
    })
  );
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
