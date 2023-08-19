import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../admin";
import { MessageType } from "./message";
import { userDocument } from "./user";

const senderCollection = (userId: string) =>
  `${userDocument(userId)}/senders_v1`;
const senderDocument = (userId: string, senderId: string) =>
  `${senderCollection(userId)}/${senderId}`;
const slackSendersCollection = (userId: string) =>
  `${userDocument(userId)}/slack_senders_v1`;
const slackSenderDocument = (userId: string, slackSenderId: string) =>
  `${slackSendersCollection(userId)}/${slackSenderId}`;

// Assumed to create sender group to put together same person's messages
type Sender = {
  id: string;
  sender_name: string;
  icon_url: string;
  description: string;
  type: MessageType;
  group_ids: string[];
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

type SlackSender = {
  id: string; // slack user id
  sender_id: string;
  sender_name: string;
  slack_team_id: string;
  slack_email: string;
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

const createSender = async ({
  userId,
  id,
  senderName,
  type,
  iconUrl,
}: {
  userId: string;
  id: string;
  senderName: string;
  type: MessageType;
  iconUrl?: string;
}) => {
  const sender: Sender = {
    id,
    sender_name: senderName,
    icon_url: iconUrl ?? "",
    description: "",
    type,
    group_ids: [],
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now(),
  };
  await firestore.doc(senderDocument(userId, id)).create(sender);
};

export const createSlackSender = async ({
  userId,
  id,
  senderId,
  senderName,
  slackTeamId,
  slackEmail,
}: {
  userId: string;
  id: string;
  senderId: string;
  senderName: string;
  slackTeamId: string;
  slackEmail: string;
}): Promise<SlackSender> => {
  await createSender({
    userId,
    id: senderId,
    senderName,
    type: "slack",
  });
  const slackSender: SlackSender = {
    id,
    sender_id: senderId,
    sender_name: senderName,
    slack_team_id: slackTeamId,
    slack_email: slackEmail,
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now(),
  };
  await firestore.doc(slackSenderDocument(userId, id)).create(slackSender);
  return slackSender;
};
