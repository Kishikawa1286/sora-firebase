import { createSlackVerificationCode } from '../../../utils/firestore/slack-verification-code';
import { functions128MB } from '../../../utils/functions';

export const createVerificationCode = functions128MB.https.onCall(
  async (data, context): Promise<string> => {
    const appUserId = context.auth?.uid;

    if (!appUserId) {
      throw new Error('Error: Missing appUserId');
    }

    const verificationCode = await createSlackVerificationCode(appUserId);

    return verificationCode.code;
  },
);
