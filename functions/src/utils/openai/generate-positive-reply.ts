import { CompletionCreateParams, singleCompletion } from "./openai";

const systemMessage =
  "次のメッセージを受信しました。チャットでOK・肯定的に返信する文章を考えてください：";

const examples = [
  {
    userMessage:
      "明日の会議は午前10時から始まります。場所は5階の会議室です。資料は事前にメールで送りましたので、確認してください。また、午後のスケジュールが変更になりましたので、カレンダーをチェックしてください。",
    assistantMessage:
      "了解しました。明日の会議の情報と午後のスケジュール変更、ありがとうございます。資料とカレンダーを確認しておきます。よろしくお願いいたします。"
  }
];

export const generatePositiveChatReply = (
  message: string,
  params?: CompletionCreateParams
): Promise<string | null> =>
  singleCompletion({
    userMessage: message,
    systemMessage,
    examples,
    params
  });
