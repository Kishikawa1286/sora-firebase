import { CompletionCreateParams, singleCompletion } from "./openai";

const systemMessage =
  "AI秘書Soraとしてメッセージの内容に基づいてチャットの返信を作成してください。返信が必要な要件や頼まれている要件がある場合はその旨を返信に含めてください。";

const examples = [
  {
    userMessage:
      "明日の会議は午前10時から始まります。場所は5階の会議室です。資料は事前にメールで送りましたので、確認してください。また、午後のスケジュールが変更になりましたので、カレンダーをチェックしてください。",
    assistantMessage:
      "返信は以下のとおりです。\n- 資料は既にメールで受け取っていますので、確認いたします。\n- 午後のスケジュールの変更も承知しました。"
  }
];

export const generateChatReply = (
  message: string,
  params?: CompletionCreateParams
) =>
  singleCompletion({
    userMessage: message,
    systemMessage,
    examples,
    params
  });
