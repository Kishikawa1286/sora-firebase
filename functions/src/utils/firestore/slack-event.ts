import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../admin";
import { isMessageEvent, MessageEvent } from "../slack/types/message-events";

export const slackEventCollection = "slack_events_v1";
const slackEventDocument = (eventId: string) =>
  `${slackEventCollection}/${eventId}`;

type SlackEvent = {
  id: string;
  json: string;
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

export const saveSlackEvent = async (
  event: MessageEvent
): Promise<{ exists: boolean }> => {
  const id = `${event.team_id}:${event.event.channel}:${event.event.ts}`;

  const ref = firestore.doc(slackEventDocument(id));

  if ((await ref.get()).exists) {
    return { exists: true };
  }

  const slackEvent: SlackEvent = {
    id,
    json: JSON.stringify(event),
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now()
  };

  await firestore.doc(slackEventDocument(id)).create(slackEvent);

  return { exists: false };
};

export const getSlackEvent = async (
  id: string
): Promise<MessageEvent | null> => {
  const slackEventDoc = await firestore.doc(slackEventDocument(id)).get();
  if (!slackEventDoc.exists) {
    return null;
  }

  const slackEvent = slackEventDoc.data();
  if (!slackEvent) {
    return null;
  }

  const event = JSON.parse(slackEvent.json);

  if (!isMessageEvent(event)) {
    return null;
  }

  return event;
};
