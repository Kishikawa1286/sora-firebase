import { setUserScheduleAdjustmentUrl } from "../../../utils/firestore/user";
import { functions128MB } from "../../../utils/functions";

type SetScheduleAdjustmentUrlData = {
  schedule_adjustment_url: string;
};

export const setScheduleAdjustmentUrl = functions128MB.https.onCall(
  async (data: SetScheduleAdjustmentUrlData, context) => {
    if (!context.auth) {
      throw new Error("Unauthenticated");
    }

    const userId = context.auth.uid;
    const { schedule_adjustment_url: scheduleAdjustmentUrl } = data;

    await setUserScheduleAdjustmentUrl({ userId, scheduleAdjustmentUrl });
  }
);
