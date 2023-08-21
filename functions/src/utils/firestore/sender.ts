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
  description: string;
  type: MessageType;
  group_ids: string[];
  icon_url?: string;
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

type SlackSender = {
  id: string; // slack user id
  sender_id: string; // `slack:${id}`
  sender_name: string;
  description: string;
  icon_url: string;
  slack_team_id: string;
  slack_team_domain: string;
  slack_team_icon_url: string;
  slack_team_name: string
  slack_email: string;
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

const senderId = (type: MessageType, id: string) => `${type}:${id}`;

const setSender = async ({
  userId,
  id,
  senderName,
  type,
  iconUrl
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
    last_updated_at: Timestamp.now()
  };
  await firestore.doc(senderDocument(userId, id)).set(sender);
};

export const setSlackSender = async ({
  userId,
  id,
  senderName,
  slackTeamId,
  slackTeamDomain,
  slackTeamIconUrl,
  slackTeamName,
  slackEmail,
  iconUrl
}: {
  userId: string;
  id: string;
  senderName: string;
  slackTeamId: string;
  slackTeamDomain: string;
  slackTeamIconUrl: string;
  slackTeamName: string;
  slackEmail: string;
  iconUrl: string;
}): Promise<SlackSender> => {
  await setSender({
    id: senderId("slack", id),
    userId,
    senderName,
    type: "slack",
    iconUrl
  });
  const slackSender: SlackSender = {
    id,
    sender_id: senderId("slack", id),
    sender_name: senderName,
    slack_team_id: slackTeamId,
    slack_team_domain: slackTeamDomain,
    slack_team_icon_url: slackTeamIconUrl,
    slack_team_name: slackTeamName,
    slack_email: slackEmail,
    icon_url: iconUrl,
    description: "",
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now()
  };
  await firestore.doc(slackSenderDocument(userId, id)).set(slackSender);
  return slackSender;
};
