import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../admin";

const slackTokensCollection = "slack_tokens_v1";
const slackTokenDocument = (teamId: string) =>
  `${slackTokensCollection}/${teamId}`;

const expirationDate = (expiresInSeconds: number): Date => {
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + expiresInSeconds);
  return expirationDate;
};

export const setSlackToken = async ({
  accessToken,
  refreshToken,
  teamId,
  expiresInSeconds,
  botUserId,
}: {
  accessToken: string;
  refreshToken: string;
  teamId: string;
  expiresInSeconds: number;
  botUserId: string;
}): Promise<void> => {
  const expiresAt = expirationDate(expiresInSeconds);
  const slackToken: SlackToken = {
    id: teamId,
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Timestamp.fromDate(expiresAt),
    bot_user_id: botUserId,
    subscribing_user_ids: [],
    created_at: Timestamp.fromDate(new Date()),
    last_updated_at: Timestamp.fromDate(new Date()),
  };
  await firestore.doc(slackTokenDocument(teamId)).set(slackToken);
};

export const refreshSlackToken = async ({
  accessToken,
  refreshToken,
  teamId,
  expiresInSeconds,
}: {
  accessToken: string;
  refreshToken: string;
  teamId: string;
  expiresInSeconds: number;
}): Promise<void> => {
  const expiresAt = expirationDate(expiresInSeconds);
  await firestore.doc(slackTokenDocument(teamId)).update({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    last_updated_at: new Date(),
  });
};

type SlackToken = {
  id: string; // teamId
  access_token: string;
  refresh_token: string;
  expires_at: Timestamp;
  bot_user_id: string;
  subscribing_user_ids: string[];
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

const isSlackToken = (data: unknown): data is SlackToken => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const slackToken = data as SlackToken;
  return (
    typeof slackToken.id === "string" &&
    typeof slackToken.access_token === "string" &&
    typeof slackToken.refresh_token === "string" &&
    typeof slackToken.bot_user_id === "string" &&
    Array.isArray(slackToken.subscribing_user_ids) &&
    slackToken.subscribing_user_ids.every((id) => typeof id === "string") &&
    slackToken.expires_at instanceof Timestamp &&
    slackToken.created_at instanceof Timestamp &&
    slackToken.last_updated_at instanceof Timestamp
  );
};

export const getSlackToken = async (teamId: string): Promise<SlackToken> => {
  const document = await firestore.doc(slackTokenDocument(teamId)).get();
  const data = document.data();
  if (!isSlackToken(data)) {
    throw new Error("Invalid Slack token");
  }
  return data;
};
