import {
  getSlackEvent,
  slackEventCollection
} from "../../../utils/firestore/slack-event";
import {
  VerifiedSlackUser,
  getSlackToken,
  getVerifiedSlackUser
} from "../../../utils/firestore/slack-token";
import { functions512MB } from "../../../utils/functions";
import { extractSlackMentions } from "../../../utils/slack/extract-mentions";
import {
  isChannelsMessageEvent,
  isGroupsMessageEvent,
  isIMMessageEvent
} from "../../../utils/slack/types/message-events";
import { getRefreshedAccessToken } from "./get-refreshed-access-token";
import { handleChannelMessage } from "./handle-channel-message";
import { handleDirectMessage } from "./handle-direct-message";

export const onSaveSlackEvent = functions512MB.firestore
  .document(`${slackEventCollection}/{eventId}`)
  .onCreate(async (_snapshot, context) => {
    const { eventId } = context.params;

    const messageEvent = await getSlackEvent(eventId);
    if (!messageEvent) {
      throw new Error("messageEvent is null");
    }

    const { team_id: teamId, event } = messageEvent;

    const { user: slackUserId } = event;
    const tokenData = await getSlackToken(teamId);
    if (slackUserId === tokenData.bot_user_id) {
      return;
    }

    const accessToken = await getRefreshedAccessToken(teamId);

    if (isIMMessageEvent(messageEvent)) {
      const mentionedUserIds = extractSlackMentions(event.text);
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

      await handleDirectMessage(accessToken, messageEvent);
    } else if (isChannelsMessageEvent(messageEvent)) {
      await handleChannelMessage(accessToken, messageEvent);
    } else if (isGroupsMessageEvent(messageEvent)) {
      await handleChannelMessage(accessToken, messageEvent);
    }
  });
