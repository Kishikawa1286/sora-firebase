import { FIREBASE_HOSTING_URL } from "../../../utils/env";
import { getVerifiedSlackUser } from "../../../utils/firestore/slack-token";
import { createSlackVerificationCode } from "../../../utils/firestore/slack-verification-code";
import { generateUrlWithParams } from "../../../utils/generate-url-with-parans";
import { replyToSlackThread } from "../../../utils/slack/reply-to-thread";
import { IMMessageEvent } from "../../../utils/slack/types/message-events";

export const handleDirectMessage = async (
  accessToken: string,
  event: IMMessageEvent
): Promise<void> => {
  const { team_id: teamId } = event;
  const {
    user: slackUserId,
    channel,
    ts: timestamp,
    thread_ts: threadTimestamp
  } = event.event;

  const user = await getVerifiedSlackUser(teamId, slackUserId);
  if (user) {
    await replyToSlackThread({
      accessToken,
      channel: channel,
      threadTimestamp: threadTimestamp ?? timestamp,
      text: "いつもご利用ありがとうございます！すでに認証されています。"
    });
    return;
  }

  const verificationCode = await createSlackVerificationCode({
    slackUserId,
    slackTeamId: teamId
  });
  const verificationUrl = generateUrlWithParams(FIREBASE_HOSTING_URL, {
    code: verificationCode.code
  });

  await replyToSlackThread({
    accessToken,
    channel: channel,
    threadTimestamp: threadTimestamp ?? timestamp,
    text: `こちらの認証URLから認証を完了してください。\n\n${verificationUrl}`
  });
};
