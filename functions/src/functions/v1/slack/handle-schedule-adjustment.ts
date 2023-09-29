import { VerifiedSlackUser } from "../../../utils/firestore/slack-token";
import { getUserScheduleAdjustmentUrl } from "../../../utils/firestore/user";
import { determineWhetherScheduleAdjustment } from "../../../utils/openai/determine-whether-schedule-adjustment";
import { replyToSlackThread } from "../../../utils/slack/reply-to-thread";

export const handleScheduleAdjustment = async ({
  verifiedUsers,
  text,
  accessToken,
  channel,
  threadTimestamp
}: {
  verifiedUsers: VerifiedSlackUser[];
  text: string;
  accessToken: string;
  channel: string;
  threadTimestamp: string;
}): Promise<{ isScheduleAdjustment: boolean; botMessage: string }> => {
  // When there is only one verified user mentioned
  // Ignore if multiple users are mentioned
  if (verifiedUsers.length !== 1) {
    return {
      isScheduleAdjustment: false,
      botMessage: ""
    };
  }

  const verifiedUser = verifiedUsers[0];

  const isScheduleAdjestment = await determineWhetherScheduleAdjustment(text);

  if (!isScheduleAdjestment) {
    return {
      isScheduleAdjustment: false,
      botMessage: ""
    };
  }

  const scheduleAdjustmentUrl = await getUserScheduleAdjustmentUrl(
    verifiedUser.id
  );

  if (!scheduleAdjustmentUrl) {
    return {
      isScheduleAdjustment: false,
      botMessage: ""
    };
  }

  const botMessage = `こちらの日程調整リンクから日程調整できます\n${scheduleAdjustmentUrl}`;

  await replyToSlackThread({
    accessToken,
    channel,
    threadTimestamp,
    text: botMessage
  });

  return {
    isScheduleAdjustment: true,
    botMessage
  };
};
