import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../admin";

const userCollection = "users_v1";
export const userDocument = (id: string) => `${userCollection}/${id}`;
const slackUsersCollection = (userId: string) =>
  `${userDocument(userId)}/slack_users_v1`;
const slackUserDocument = (userId: string, slackUserId: string) =>
  `${slackUsersCollection(userId)}/${slackUserId}`;

type User = {
  id: string; // firebase user id
  email?: string;
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

type SlackUser = {
  id: string; // slack user id
  user_id: string;
  slack_team_id: string;
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
    slackUser.created_at instanceof Timestamp &&
    slackUser.last_updated_at instanceof Timestamp
  );
};

export const createUser = async ({
  id,
  email,
}: {
  id: string;
  email?: string;
}): Promise<void> => {
  const user: User = {
    id,
    email,
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now(),
  };
  await firestore.doc(userDocument(id)).create(user);
};

export const deleteUser = async (id: string) => {
  const userDocRef = firestore.doc(userDocument(id));

  // Delete all subcollections of the user document
  const collections = await userDocRef.listCollections();
  const deletePromises = collections.map(async (collection) => {
    const docs = await collection.listDocuments();
    return Promise.all(docs.map((doc) => doc.delete()));
  });
  await Promise.all(deletePromises);

  await userDocRef.delete();
};

export const createSlackUser = async ({
  userId,
  slackUserId,
  slackTeamId,
}: {
  userId: string;
  slackUserId: string;
  slackTeamId: string;
}): Promise<SlackUser> => {
  const slackUser: SlackUser = {
    id: slackUserId,
    user_id: userId,
    slack_team_id: slackTeamId,
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now(),
  };
  await firestore.doc(slackUserDocument(userId, slackUserId)).create(slackUser);
  return slackUser;
};

export const getSlackUser = async ({
  userId,
  slackUserId,
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
  slackUserId,
}: {
  userId: string;
  slackUserId: string;
}): Promise<void> => {
  await firestore.doc(slackUserDocument(userId, slackUserId)).delete();
};
