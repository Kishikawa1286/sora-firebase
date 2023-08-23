import { Timestamp } from 'firebase-admin/firestore';
import { firestore } from '../admin';
import { randomString } from '../random-string';

const slackVerificationCodesCollection = 'slack_verification_codes_v1';
const slackVerificationCodeDocument = (id: string) =>
  `${slackVerificationCodesCollection}/${id}`;

type SlackVerificationCode = {
  id: string;
  app_user_id: string;
  code: string;
  expires_at: Timestamp;
  language: string;
  created_at: Timestamp;
  last_updated_at: Timestamp;
};

const isSlackVerificationCode = (
  data: unknown,
): data is SlackVerificationCode => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const slackVerificationCode = data as SlackVerificationCode;
  return (
    typeof slackVerificationCode.id === 'string' &&
    typeof slackVerificationCode.app_user_id === 'string' &&
    typeof slackVerificationCode.code === 'string' &&
    slackVerificationCode.expires_at instanceof Timestamp &&
    typeof slackVerificationCode.language === 'string' &&
    slackVerificationCode.created_at instanceof Timestamp &&
    slackVerificationCode.last_updated_at instanceof Timestamp
  );
};

export const createSlackVerificationCode = async (
  appUserId: string,
): Promise<SlackVerificationCode> => {
  const id = randomString(20);
  const code = randomString(16);
  // Expires in 24 hours
  const expiresAt = Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24);
  const slackVerificationCode: SlackVerificationCode = {
    id,
    app_user_id: appUserId,
    code,
    expires_at: expiresAt,
    language: 'jp',
    created_at: Timestamp.now(),
    last_updated_at: Timestamp.now(),
  };
  await firestore
    .doc(slackVerificationCodeDocument(id))
    .create(slackVerificationCode);
  return slackVerificationCode;
};

export const searchSlackVerificationCodeByCode = async (
  code: string,
): Promise<SlackVerificationCode | null> => {
  const snapshot = await firestore
    .collection(slackVerificationCodesCollection)
    .where('code', '==', code)
    .get();
  if (snapshot.empty) {
    console.log(`Slack verification code not found: ${code}`);
    return null;
  }
  const data = snapshot.docs[0].data();
  if (!isSlackVerificationCode(data)) {
    throw new Error('Invalid Slack verification code');
  }
  return data;
};

export const deleteSlackVerificationCode = async (
  id: string,
): Promise<void> => {
  await firestore.doc(slackVerificationCodeDocument(id)).delete();
};

export const deleteExpiredSlackVerificationCodes = async (): Promise<void> => {
  const snapshot = await firestore
    .collection(slackVerificationCodesCollection)
    .where('expires_at', '<', Timestamp.now())
    .get();
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
};
