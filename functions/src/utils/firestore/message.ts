import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../admin";
import { randomString } from "../random-string";
import { userDocument } from "./user";

export type MessageType = "slack";

const messagesCollection = (userId: string) =>
  `${userDocument(userId)}/messages_v1`;
const messageDocument = (userId: string, messageId: string) =>
  `${messagesCollection(userId)}/${messageId}`;
const slackMessageCollection = (userId: string, messageId: string) =>
  `${messageDocument(userId, messageId)}/slack_message_v1`;
const slackMessageDocument = (
  userId: string,
  messageId: string,
  slackMessageId: string
) => `${slackMessageCollection(userId, messageId)}/${slackMessageId}`;

type Message = {
  id: string;
  user_id: string;
  type: MessageType;
  message: string;
  summary: string;
  bot_message: string;
  reply: string;
  sender_id: string;
  sender_name: string;
  sender_icon_url?: string;
  image_urls: string[];
  file_attached: boolean;
  replied: boolean;
  archived: boolean;
  read: boolean;
  is_schedule_aadjustment: boolean;
  positive_reply: string;
  negative_reply: string;
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

const isMessage = (data: unknown): data is Message => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const message = data as Message;
  return (
    typeof message.id === "string" &&
    typeof message.user_id === "string" &&
    typeof message.type === "string" &&
    typeof message.message === "string" &&
    typeof message.summary === "string" &&
    typeof message.bot_message === "string" &&
    typeof message.reply === "string" &&
    typeof message.sender_id === "string" &&
    typeof message.sender_name === "string" &&
    (typeof message.sender_icon_url === "string" ||
      message.sender_icon_url === undefined) &&
    message.image_urls instanceof Array &&
    message.image_urls.every((url) => typeof url === "string") &&
    typeof message.file_attached === "boolean" &&
    typeof message.replied === "boolean" &&
    typeof message.archived === "boolean" &&
    typeof message.read === "boolean" &&
    typeof message.is_schedule_aadjustment === "boolean" &&
    typeof message.positive_reply === "string" &&
    typeof message.negative_reply === "string" &&
    message.created_at instanceof Timestamp &&
    message.last_updated_at instanceof Timestamp
  );
};

type SlackMessage = {
  id: string;
  user_id: string;
  message_id: string;
  message: string;
  summary: string;
  bot_message: string;
  sender_id: string; // firestore document id
  sender_name: string;
  sender_icon_url?: string;
  image_urls: string[];
  file_attached: boolean;
  slack_team_id: string;
  slack_team_domain: string;
  slack_team_icon_url?: string;
  slack_team_name: string;
  slack_user_id: string;
  slack_sender_user_id: string;
  slack_channel_id: string;
  slack_channel_name: string;
  slack_thread_ts: string;
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

const isSlackMessage = (data: unknown): data is SlackMessage => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const slackMessage = data as SlackMessage;
  return (
    typeof slackMessage.id === "string" &&
    typeof slackMessage.user_id === "string" &&
    typeof slackMessage.message_id === "string" &&
    typeof slackMessage.message === "string" &&
    typeof slackMessage.summary === "string" &&
    typeof slackMessage.bot_message === "string" &&
    typeof slackMessage.sender_id === "string" &&
    typeof slackMessage.sender_name === "string" &&
    (typeof slackMessage.sender_icon_url === "string" ||
      slackMessage.sender_icon_url === undefined) &&
    slackMessage.image_urls instanceof Array &&
    slackMessage.image_urls.every((url) => typeof url === "string") &&
    typeof slackMessage.file_attached === "boolean" &&
    typeof slackMessage.slack_team_id === "string" &&
    typeof slackMessage.slack_team_domain === "string" &&
    (typeof slackMessage.slack_team_icon_url === "string" ||
      slackMessage.slack_team_icon_url === undefined) &&
    typeof slackMessage.slack_team_name === "string" &&
    typeof slackMessage.slack_user_id === "string" &&
    typeof slackMessage.slack_sender_user_id === "string" &&
    typeof slackMessage.slack_channel_id === "string" &&
    typeof slackMessage.slack_channel_name === "string" &&
    typeof slackMessage.slack_thread_ts === "string" &&
    slackMessage.created_at instanceof Timestamp &&
    slackMessage.last_updated_at instanceof Timestamp
  );
};

export const getMessage = async (
  userId: string,
  messageId: string
): Promise<Message | null> => {
  const snapshot = await firestore
    .doc(messageDocument(userId, messageId))
    .get();
  if (!snapshot.exists) {
    return null;
  }
  const data = snapshot.data();
  if (!isMessage(data)) {
    return null;
  }
  return data;
};

export const onReply = async ({
  userId,
  messageId,
  reply
}: {
  userId: string;
  messageId: string;
  reply: string;
}): Promise<void> => {
  const messageRef = firestore.doc(messageDocument(userId, messageId));
  const messageDoc = await messageRef.get();
  if (!messageDoc.exists) {
    throw new Error("Message not found");
  }
  await messageRef.update({
    reply,
    replied: true,
    last_updated_at: Timestamp.now()
  });
};

export const createSlackMessage = async ({
  userId,
  message,
  summary,
  botMessage,
  senderId,
  senderName,
  senderIconUrl,
  imageUrls,
  fileAttached,
  slackTeamId,
  slackTeamDomain,
  slackTeamIconUrl,
  slackTeamName,
  slackUserId,
  slackSenderUserId,
  slackChannelId,
  slackChannelName,
  slackThreadTs,
  positiveReply,
  negativeReply
}: {
  userId: string;
  message: string;
  summary: string;
  botMessage: string;
  senderId: string;
  senderName: string;
  senderIconUrl?: string;
  imageUrls?: string[];
  fileAttached?: boolean;
  slackTeamId: string;
  slackTeamDomain: string;
  slackTeamIconUrl?: string;
  slackTeamName: string;
  slackUserId: string;
  slackSenderUserId: string;
  slackChannelId: string;
  slackChannelName: string;
  slackThreadTs: string;
  positiveReply: string;
  negativeReply: string;
}): Promise<SlackMessage> => {
  const messageId = randomString(20);
  const id = randomString(20);
  const messageData: Message = {
    id: messageId,
    user_id: userId,
    type: "slack",
    message,
    summary,
    bot_message: botMessage,
    reply: "",
    sender_id: senderId,
    sender_name: senderName,
    sender_icon_url: senderIconUrl,
    image_urls: imageUrls ?? [],
    file_attached: fileAttached ?? false,
    replied: false,
    archived: false,
    read: false,
    // TODO: is_schedule_aadjustment
    is_schedule_aadjustment: false,
    positive_reply: positiveReply,
    negative_reply: negativeReply,
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now()
  };
  const slackMessage: SlackMessage = {
    id,
    user_id: userId,
    message_id: messageId,
    message,
    summary,
    bot_message: botMessage,
    sender_id: senderId,
    sender_name: senderName,
    sender_icon_url: senderIconUrl,
    image_urls: imageUrls ?? [],
    file_attached: fileAttached ?? false,
    slack_team_id: slackTeamId,
    slack_team_domain: slackTeamDomain,
    slack_team_icon_url: slackTeamIconUrl,
    slack_team_name: slackTeamName,
    slack_user_id: slackUserId,
    slack_sender_user_id: slackSenderUserId,
    slack_channel_id: slackChannelId,
    slack_channel_name: slackChannelName,
    slack_thread_ts: slackThreadTs,
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now()
  };

  const filteredMessageData = Object.entries(messageData)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== undefined)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
  const filteredSlackMessage = Object.entries(slackMessage)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== undefined)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  await firestore
    .doc(messageDocument(userId, messageId))
    .create(filteredMessageData);
  await firestore
    .doc(slackMessageDocument(userId, messageId, id))
    .create(filteredSlackMessage);
  return slackMessage;
};

export const getSlackMessage = async (
  userId: string,
  messageId: string
): Promise<SlackMessage | null> => {
  const snapshot = await firestore
    .collection(slackMessageCollection(userId, messageId))
    .get();
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  const data = doc.data();
  if (!isSlackMessage(data)) {
    return null;
  }
  return data;
};
