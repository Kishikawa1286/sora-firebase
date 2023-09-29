import { CompletionCreateParams, singleCompletion } from "./openai";

const systemMessage =
  "次のメッセージを受信しました。チャットで丁寧にNO・否定的に返信する文章を考えてください：";

const examples = [
  {
    userMessage:
      "明日の会議は午前10時から始まります。場所は5階の会議室です。資料は事前にメールで送りましたので、確認してください。また、午後のスケジュールが変更になりましたので、カレンダーをチェックしてください。",
    assistantMessage:
      "申し訳ございませんが、明日の会議には参加できません。資料と午後のスケジュール変更についても確認いたします。何か代わりに対応が必要であれば、お知らせください。よろしくお願い申し上げます。"
  }
];

export const generateNegativeChatReply = (
  message: string,
  params?: CompletionCreateParams
): Promise<string | null> =>
  singleCompletion({
    userMessage: message,
    systemMessage,
    examples,
    params
  });
