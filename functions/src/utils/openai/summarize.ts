import { singleCompletion } from "./openai";

const systemMessage =
  "メッセージの内容を2行の箇条書きで返してください。1行目は要約、2行目は受け取ったメッセージに対して次にすべき行動を返してください。";

const examples = [
  {
    userMessage:
      "明日の会議は午前10時から始まります。場所は5階の会議室です。資料は事前にメールで送りましたので、確認してください。",
    assistantMessage: "- 明日の会議は10時開始\n- 資料を確認"
  },
  {
    userMessage:
      "方向性と今後のスケジュール確認のため打ち合わせをお願いできればと存じます。つきましては、下記の日程でご都合のよろしい日時をご連絡いただけますでしょうか。",
    assistantMessage: "- 打ち合わせのお願い\n- 日程の調整"
  }
];

export const summarize = (message: string) =>
  singleCompletion({
    userMessage: message,
    systemMessage,
    examples,
    params: {
      max_tokens: 25
    }
  });
