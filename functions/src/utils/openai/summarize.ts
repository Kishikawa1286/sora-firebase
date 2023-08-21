import { CompletionCreateParams, singleCompletion } from "./openai";

const systemMessage =
  "メッセージの内容を箇条書きで要約してください。返信が必要な要件や頼まれている要件がある場合は、その旨を要約に含めてください。送信者の名前やメールアドレス、日付などの情報は要約に含めないでください。";

const examples = [
  {
    userMessage:
      "明日の会議は午前10時から始まります。場所は5階の会議室です。資料は事前にメールで送りましたので、確認してください。また、午後のスケジュールが変更になりましたので、カレンダーをチェックしてください。",
    assistantMessage:
      "- 明日10時から会議\n- 場所: 5階の会議室\n- 資料はメールで送信済み\n- 午後のスケジュール変更あり\n- タスク\n  - 資料の確認\n  - カレンダーの確認"
  },
  {
    userMessage:
      "来週の月曜日に新しいプロジェクトのキックオフミーティングが予定されています。時間は午後3時から5時までです。場所はオンラインで、Zoomのリンクは後ほど共有します。事前にプロジェクトの概要を読んでおいてください。また、質問があれば事前にメールで送ってください。",
    assistantMessage:
      "- 来週の月曜日にキックオフミーティング\n- 時間: 午後3時から5時\n- 場所: オンライン (Zoomリンクは後ほど)\n- タスク\n  - プロジェクトの概要の確認\n  - 質問があれば事前にメールで送信"
  }
];

export const summarize = (message: string, params?: CompletionCreateParams) =>
  singleCompletion({
    userMessage: message,
    systemMessage,
    examples,
    params
  });
