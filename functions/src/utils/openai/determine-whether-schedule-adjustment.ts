import { singleCompletion } from "./openai";

const prompt = (message: string): string => `### Task
メッセージの内容を分析して、スケジューリングに関連するキーワードやリンクが含まれているかどうかを判断してください。スケジューリングに関連するキーワードやリンクが見つかった場合は 't' 一文字を、見つからなかった場合は 'f' 一文字を出力してください。

### Instructions
1. メッセージの中の特定のキーワードやフレーズをスキャンします。
2. "schedule", "adjustment", "link", "calendly", "doodle" などのキーワードやURLの存在をチェックします。

### Examples
Input:
\`\`\`
明日 MTG どうですか？
\`\`\`
↓
t

Input:
\`\`\`
昨日は良かったですね！
\`\`\`
↓
f

### Input

\`\`\`
${message}
\`\`\``;

export const determineWhetherScheduleAdjustment = async (
  message: string
): Promise<boolean> => {
  const content = await singleCompletion({
    userMessage: prompt(message),
    params: {
      temperature: 0.2
    }
  });

  if (content === null) {
    return false;
  }

  if (content !== "t") {
    return false;
  }

  return true;
};
