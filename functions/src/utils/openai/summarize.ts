import { singleCompletion } from "./openai";

const systemMessage =
  "メッセージの内容からタイトルを作ってください。頼まれている行動を【】に含めてください。";

const examples = [
  {
    userMessage:
      "明日の会議は午前10時から始まります。場所は5階の会議室です。資料は事前にメールで送りましたので、確認してください。",
    assistantMessage: "【資料要確認】明日の会議は10時開始"
  },
  {
    userMessage:
      "方向性と今後のスケジュール確認のため打ち合わせをお願いできればと存じます。つきましては、下記の日程でご都合のよろしい日時をご連絡いただけますでしょうか。",
    assistantMessage: "【要日程調整】方向性と期日のMTG調整"
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
