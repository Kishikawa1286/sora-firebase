import { createSlackMessage } from "../../../utils/firestore/message";
import { setSlackSender } from "../../../utils/firestore/sender";
import {
  getSlackToken,
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
import { generateNegativeChatReply } from "../../../utils/openai/generate-negative-reply";
import { generatePositiveChatReply } from "../../../utils/openai/generate-positive-reply";
import { summarize } from "../../../utils/openai/summarize";
import { extractSlackMentions } from "../../../utils/slack/extract-mentions";
import { fetchChannelName } from "../../../utils/slack/fetch-conversations-info";
import { fetchTeamInfo } from "../../../utils/slack/fetch-team-info";
import { fetchUserInfo } from "../../../utils/slack/fetch-users-info";
import { replyToSlackThread } from "../../../utils/slack/reply-to-thread";
import {
  ChannelsMessageEvent,
  GroupsMessageEvent,
  IMMessageEvent,
  isChannelsMessageEvent,
  isGroupsMessageEvent,
  isIMMessageEvent,
  isMessageEvent
} from "../../../utils/slack/types/message-events";
import { getRefreshedAccessToken } from "./get-refreshed-access-token";

const handleDirectMessage = async (
  accessToken: string,
  event: IMMessageEvent
): Promise<void> => {
  const { team_id: teamId } = event;
  const { text, user: slackUserId, channel, ts: timestamp } = event.event;
  const verificationCodeData = await searchSlackVerificationCodeByCode(text);
  const isCodeExists = verificationCodeData !== null;
  if (!isCodeExists) {
    return;
  }

  const teamInfoRes = await fetchTeamInfo(accessToken, teamId);
  const { team } = teamInfoRes;
  if (!team) {
    throw new Error(
      `Failed to fetch Slack team info\n${JSON.stringify(teamInfoRes).replace(
        "\n",
        " "
      )}}`
    );
  }
  const { domain, name, icon } = team;
  if (!domain || !name || !icon) {
    throw new Error(
      `Failed to fetch Slack team info\n${JSON.stringify(teamInfoRes).replace(
        "\n",
        " "
      )}}`
    );
  }
  const teamIconUrl = icon.image_132;
  if (!teamIconUrl) {
    throw new Error("Missing team icon URL");
  }

  await setVerifiedSlackUser(
    teamId,
    verificationCodeData.app_user_id,
    slackUserId
  );

  await deleteSlackVerificationCode(verificationCodeData.id);

  await setSlackUser({
    userId: verificationCodeData.app_user_id,
    slackUserId: slackUserId,
    slackTeamId: teamId,
    slackTeamAvatarBaseUrl: team.avatar_base_url,
    slackTeamDiscoverable: team.discoverable,
    slackTeamDomain: domain,
    slackTeamIconUrl: teamIconUrl,
    slackTeamName: name,
    language: verificationCodeData.language
  });

  await replyToSlackThread({
    accessToken,
    channel: channel,
    threadTimestamp: timestamp,
    text: "認証されました！"
  });
};

const handleChannelMessage = async (
  accessToken: string,
  event: ChannelsMessageEvent | GroupsMessageEvent
) => {
  const { team_id: teamId } = event;
  const { text, user: slackUserId, channel, ts: timestamp } = event.event;

  const mentionedUserIds = extractSlackMentions(text);
  const verifiedUsers = (
    await Promise.all(
      mentionedUserIds.map((slackUserId) =>
        getVerifiedSlackUser(teamId, slackUserId)
      )
    )
  ).filter((user) => user !== null) as VerifiedSlackUser[];

  if (verifiedUsers.length === 0) {
    return;
  }

  const senderInfo = await fetchUserInfo(accessToken, slackUserId);
  if (!senderInfo.ok) {
    throw new Error(
      `Missing data from Slack user info\n${JSON.stringify(senderInfo).replace(
        "\n",
        " "
      )}`
    );
  }

  const senderSlackUserId = senderInfo.user?.id;
  const senderSlackName = senderInfo.user?.real_name;
  const senderSlackIconUrl = senderInfo.user?.profile?.image_512;

  if (!senderSlackUserId || !senderSlackName) {
    throw new Error(
      `Missing data from Slack user info\n${JSON.stringify(senderInfo).replace(
        "\n",
        " "
      )}`
    );
  }

  const channelName = await fetchChannelName(accessToken, channel);

  if (!channelName) {
    throw new Error("Missing channel name");
  }

  const teamInfoRes = await fetchTeamInfo(accessToken, teamId);
  const { team } = teamInfoRes;
  if (!team) {
    throw new Error(
      `Failed to fetch Slack team info\n${JSON.stringify(teamInfoRes).replace(
        "\n",
        " "
      )}}`
    );
  }
  const {
    domain: slackTeamDomain,
    name: slackTeamName,
    icon: slackTeamIcon
  } = team;
  const slackTeamIconUrl = slackTeamIcon?.image_132;
  if (!slackTeamDomain || !slackTeamName) {
    throw new Error(
      `Failed to fetch Slack team info\n${JSON.stringify(teamInfoRes).replace(
        "\n",
        " "
      )}}`
    );
  }

  const summary = await summarize(text);
  const positiveReply = await generatePositiveChatReply(text);
  const negativeReply = await generateNegativeChatReply(text);

  if (!summary || !positiveReply || !negativeReply) {
    throw new Error("Failed to summarize");
  }

  const botMessage = `あなたのメッセージと以下の要約を送信しました。\n\n ${summary} `;

  await replyToSlackThread({
    accessToken,
    channel: channel,
    threadTimestamp: timestamp,
    text: botMessage
  });

  await Promise.all(
    // For all mentioned verified users
    verifiedUsers.map(async (user) => {
      const userId = user.id; // Firebase User ID
      // Update the Sender Document in Firestore
      const slackSender = await setSlackSender({
        userId,
        id: senderSlackUserId,
        senderName: senderSlackName,
        slackTeamId: teamId,
        slackTeamDomain,
        slackTeamIconUrl,
        slackTeamName,
        iconUrl: senderSlackIconUrl
      });

      // Create a Message Document in Firestore
      await createSlackMessage({
        userId,
        message: text,
        summary,
        botMessage,
        senderId: slackSender.sender_id,
        senderName: senderSlackName,
        senderIconUrl: senderSlackIconUrl,
        slackTeamId: teamId,
        slackTeamDomain,
        slackTeamIconUrl,
        slackTeamName,
        slackUserId,
        slackSenderUserId: senderSlackUserId,
        slackChannelId: channel,
        slackChannelName: channelName,
        slackThreadTs: timestamp,
        positiveReply,
        negativeReply
      });
    })
  );
};

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

    const { user: slackUserId } = event;
    const tokenData = await getSlackToken(teamId);
    if (slackUserId === tokenData.bot_user_id) {
      res.status(200).send("Success");
      return;
    }

    const accessToken = await getRefreshedAccessToken(teamId);

    if (isIMMessageEvent(body)) {
      const mentionedUserIds = extractSlackMentions(event.text);
      const verifiedUsers = (
        await Promise.all(
          mentionedUserIds.map((slackUserId) =>
            getVerifiedSlackUser(teamId, slackUserId)
          )
        )
      ).filter((user) => user !== null) as VerifiedSlackUser[];
      console.log(verifiedUsers);

      await handleDirectMessage(accessToken, body);
    } else if (isChannelsMessageEvent(body)) {
      await handleChannelMessage(accessToken, body);
    } else if (isGroupsMessageEvent(body)) {
      await handleChannelMessage(accessToken, body);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
