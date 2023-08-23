import { deleteExpiredSlackVerificationCodes } from '../../../utils/firestore/slack-verification-code';
import { functions512MB } from '../../../utils/functions';

export const clearVerificationCode = functions512MB.pubsub
  .schedule('every 6 hours')
  .onRun(async () => {
    await deleteExpiredSlackVerificationCodes();
  });
