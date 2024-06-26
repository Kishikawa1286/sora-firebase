import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../admin";
import { deleteAllSubcollections } from "./delete-all-subcollections";

const userCollection = "users_v1";
export const userDocument = (id: string) => `${userCollection}/${id}`;
const slackUsersCollection = (userId: string) =>
  `${userDocument(userId)}/slack_users_v1`;
const slackUserDocument = (userId: string, slackUserId: string) =>
  `${slackUsersCollection(userId)}/${slackUserId}`;

type User = {
  id: string; // firebase user id
  email?: string;
  schedule_adjustment_url?: string;
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

export const isUser = (data: unknown): data is User => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const user = data as User;
  return (
    typeof user.id === "string" &&
    (typeof user.email === "string" || user.email === undefined) &&
    (typeof user.schedule_adjustment_url === "string" ||
      user.schedule_adjustment_url === undefined) &&
    user.created_at instanceof Timestamp &&
    user.last_updated_at instanceof Timestamp
  );
};

type SlackUser = {
  id: string; // slack user id
  user_id: string;
  slack_team_id: string;
  slack_team_avatar_base_url?: string;
  slack_team_discoverable?: string;
  slack_team_domain: string;
  slack_team_icon_url?: string;
  slack_team_name: string;
  language: string;
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

const isSlackUser = (data: unknown): data is SlackUser => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const slackUser = data as SlackUser;
  return (
    typeof slackUser.id === "string" &&
    typeof slackUser.user_id === "string" &&
    typeof slackUser.slack_team_id === "string" &&
    typeof slackUser.slack_team_avatar_base_url === "string" &&
    typeof slackUser.slack_team_discoverable === "string" &&
    typeof slackUser.slack_team_domain === "string" &&
    (typeof slackUser.slack_team_icon_url === "string" ||
      slackUser.slack_team_icon_url === undefined) &&
    typeof slackUser.slack_team_name === "string" &&
    typeof slackUser.language === "string" &&
    slackUser.created_at instanceof Timestamp &&
    slackUser.last_updated_at instanceof Timestamp
  );
};

export const createUser = async ({
  id,
  email
}: {
  id: string;
  email?: string;
}): Promise<void> => {
  const user: User = {
    id,
    email,
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now()
  };

  const filteredUser = Object.entries(user)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== undefined)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  await firestore.doc(userDocument(id)).create(filteredUser);
};

export const getUserScheduleAdjustmentUrl = async (
  userId: string
): Promise<string | null> => {
  const doc = await firestore.doc(userDocument(userId)).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data();
  if (!isUser(data)) {
    return null;
  }
  return data.schedule_adjustment_url ?? null;
};

export const setUserScheduleAdjustmentUrl = async ({
  userId,
  scheduleAdjustmentUrl
}: {
  userId: string;
  scheduleAdjustmentUrl: string;
}): Promise<void> => {
  await firestore.doc(userDocument(userId)).update({
    schedule_adjustment_url: scheduleAdjustmentUrl,
    last_updated_at: Timestamp.now()
  });
};

export const deleteUser = async (id: string) => {
  const userDocRef = firestore.doc(userDocument(id));
  await deleteAllSubcollections(userDocRef);
  await userDocRef.delete();
};

export const setSlackUser = async ({
  userId,
  slackUserId,
  slackTeamId,
  slackTeamAvatarBaseUrl,
  slackTeamDiscoverable,
  slackTeamDomain,
  slackTeamIconUrl,
  slackTeamName,
  language
}: {
  userId: string;
  slackUserId: string;
  slackTeamId: string;
  slackTeamAvatarBaseUrl?: string;
  slackTeamDiscoverable?: string;
  slackTeamDomain: string;
  slackTeamIconUrl?: string;
  slackTeamName: string;
  language: string;
}): Promise<SlackUser> => {
  const slackUser: SlackUser = {
    id: slackUserId,
    user_id: userId,
    slack_team_id: slackTeamId,
    slack_team_avatar_base_url: slackTeamAvatarBaseUrl,
    slack_team_discoverable: slackTeamDiscoverable,
    slack_team_domain: slackTeamDomain,
    slack_team_icon_url: slackTeamIconUrl,
    slack_team_name: slackTeamName,
    language,
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now()
  };

  const filteredSlackUser = Object.entries(slackUser)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== undefined)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  await firestore
    .doc(slackUserDocument(userId, slackUserId))
    .set(filteredSlackUser);
  return slackUser;
};

export const getSlackUser = async ({
  userId,
  slackUserId
}: {
  userId: string;
  slackUserId: string;
}): Promise<SlackUser | null> => {
  const doc = await firestore.doc(slackUserDocument(userId, slackUserId)).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data();
  if (!isSlackUser(data)) {
    return null;
  }
  return data;
};

export const deleteSlackUser = async ({
  userId,
  slackUserId
}: {
  userId: string;
  slackUserId: string;
}): Promise<void> => {
  await firestore.doc(slackUserDocument(userId, slackUserId)).delete();
};
