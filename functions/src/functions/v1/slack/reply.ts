import { getSlackMessage, onReply } from '../../../utils/firestore/message';
import { functions128MB } from '../../../utils/functions';
import { replyToSlackThread } from '../../../utils/slack/reply-to-thread';
import { getRefreshedAccessToken } from './get-refreshed-access-token';

type SlackReplyData = {
  message_id: string;
  reply: string;
};

export const slackReply = functions128MB.https.onCall(
  async (data: SlackReplyData, context) => {
    if (!context.auth) {
      throw new Error('Unauthenticated');
    }

    const userId = context.auth.uid;

    const { message_id, reply } = data;
    const messageId = message_id;

    const accessToken = await getRefreshedAccessToken(userId);
    const message = await getSlackMessage(userId, messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    await onReply({
      userId,
      messageId,
      reply,
    });

    await replyToSlackThread({
      accessToken,
      channel: message.slack_channel_id,
      threadTimestamp: message.slack_thread_ts,
      text: reply,
    });
  },
);
