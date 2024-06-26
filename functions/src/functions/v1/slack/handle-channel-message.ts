import {
  createSlackMessage,
  getSlackMessagesByThreadTimestamp,
  onReply
} from "../../../utils/firestore/message";
import { setSlackSender } from "../../../utils/firestore/sender";
import {
  VerifiedSlackUser,
  getVerifiedSlackUser
} from "../../../utils/firestore/slack-token";
import { generateNegativeChatReply } from "../../../utils/openai/generate-negative-reply";
import { generatePositiveChatReply } from "../../../utils/openai/generate-positive-reply";
import { summarize } from "../../../utils/openai/summarize";
import { addSlackReaction } from "../../../utils/slack/add-reaction";
import { extractSlackMentions } from "../../../utils/slack/extract-mentions";
import { fetchChannelName } from "../../../utils/slack/fetch-conversations-info";
import { fetchTeamInfo } from "../../../utils/slack/fetch-team-info";
import { fetchUserInfo } from "../../../utils/slack/fetch-users-info";
import {
  ChannelsMessageEvent,
  GroupsMessageEvent
} from "../../../utils/slack/types/message-events";
import { handleSlackFiles } from "./handle-files";
import { handleScheduleAdjustment } from "./handle-schedule-adjustment";

export const handleChannelMessage = async (
  accessToken: string,
  event: ChannelsMessageEvent | GroupsMessageEvent
) => {
  const { team_id: teamId } = event;
  const {
    text,
    user: slackUserId,
    channel,
    ts: timestamp,
    thread_ts: threadTimestamp,
    files
  } = event.event;

  if (threadTimestamp !== undefined) {
    const threadMessages = await getSlackMessagesByThreadTimestamp(
      teamId,
      channel,
      threadTimestamp
    );
    await Promise.all(
      threadMessages.map(async (message) => {
        await onReply({
          userId: message.user_id,
          messageId: message.id,
          reply: message.reply === "" ? text : message.reply
        });
      })
    );
  }

  const mentionedUserIds = extractSlackMentions(text);
  const verifiedUsers = (
    await Promise.all(
      mentionedUserIds.map((userId) => getVerifiedSlackUser(teamId, userId))
    )
  ).filter((user) => user !== null) as VerifiedSlackUser[];

  if (verifiedUsers.length === 0) {
    return;
  }

  await addSlackReaction({
    accessToken,
    channel: channel,
    threadTimestamp: timestamp,
    reactionName: "dog"
  });

  const { isScheduleAdjustment, botMessage } = await handleScheduleAdjustment({
    verifiedUsers,
    text,
    accessToken,
    channel,
    threadTimestamp: threadTimestamp ?? timestamp
  });

  const { imageUrls, nonImageFiles } = await handleSlackFiles({
    files,
    accessToken
  });

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
        imageUrls,
        nonImageFileNames: nonImageFiles.map((file) => file.name),
        isScheduleAdjustment,
        slackTeamDomain,
        slackTeamIconUrl,
        slackTeamName,
        slackUserId,
        slackSenderUserId: senderSlackUserId,
        slackChannelId: channel,
        slackChannelName: channelName,
        slackTs: timestamp,
        slackThreadTs: threadTimestamp,
        positiveReply,
        negativeReply,
        event: event
      });
    })
  );
};
