import {
  getSlackEvent,
  slackEventCollection
} from "../../../utils/firestore/slack-event";
import { getSlackToken } from "../../../utils/firestore/slack-token";
import { functions512MB } from "../../../utils/functions";
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
      await handleDirectMessage(accessToken, messageEvent);
    } else if (isChannelsMessageEvent(messageEvent)) {
      await handleChannelMessage(accessToken, messageEvent);
    } else if (isGroupsMessageEvent(messageEvent)) {
      await handleChannelMessage(accessToken, messageEvent);
    }
  });