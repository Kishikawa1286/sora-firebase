import OpenAI from "openai";
import { OPENAI_API_KEY } from "../env";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * ユーザーメッセージとそれに対応するアシスタントメッセージの例を表します。
 */
export type CompletionExample = {
  userMessage: string;
  assistantMessage: string;
};

/**
 * OpenAIでの補完を作成するためのパラメータ。
 * これらのパラメータは、補完の生成のさまざまな側面を制御します。
 */
export type CompletionCreateParams = {
  frequency_penalty?: number | null; // 頻出トークンの使用に対するペナルティを制御します。
  logit_bias?: Record<string, number> | null; // 特定のトークンが表示される可能性を調整します。
  max_tokens?: number; // 補完の最大長を制御します。
  n?: number | null; // 生成する補完の数を制御します。
  presence_penalty?: number | null; // 新しいまたは稀なトークンの使用に対するペナルティを制御します。
  temperature?: number | null; // ランダム性を制御します。値が低いと、出力が決定論的になります。
  top_p?: number | null; // 核サンプリングを使用して多様性を制御します。
};

/**
 * 提供されたメッセージとパラメータに基づいてOpenAIを使用して補完を生成します。
 *
 * @param {string} userMessage - ユーザーからのメッセージ。
 * @param {string | undefined} systemMessage - アシスタントの動作を設定するためのオプションのシステムメッセージ。
 * @param {CompletionExample[] | undefined} examples - アシスタントの応答をガイドするためのオプションの例。
 * @param {CompletionCreateParams | undefined} params - 補完の生成を制御するためのオプションのパラメータ。
 * @return {string | null} - アシスタントの応答としての文字列。
 */
export const singleCompletion = async ({
  systemMessage,
  userMessage,
  examples,
  params,
}: {
  userMessage: string;
  systemMessage?: string;
  examples?: CompletionExample[];
  params?: CompletionCreateParams;
}): Promise<string | null> => {
  // メッセージのシーケンスを保持するための配列を準備します。
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [];

  // システムメッセージが提供されている場合は追加します。
  if (systemMessage) {
    messages.push({ role: "system", content: systemMessage });
  }

  // 例が提供されている場合、これらを使用してアシスタントの応答をガイドします。
  if (examples) {
    for (const example of examples) {
      messages.push({ role: "user", content: example.userMessage });
      messages.push({ role: "assistant", content: example.assistantMessage });
    }
  }

  // ユーザーのメッセージを追加します。
  messages.push({ role: "user", content: userMessage });

  // OpenAIから補完をリクエストします。
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // 補完のためにgpt-3.5-turboモデルを使用します。
    messages,
    ...params,
  });

  // 補完の選択肢からアシスタントの応答を抽出します。
  const { choices } = completion;
  const content = choices[choices.length - 1].message.content;

  return content;
};
