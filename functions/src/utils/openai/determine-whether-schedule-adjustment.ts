import { singleCompletion } from "./openai";

const systemMessage = `
### Task
Analyze the content of a message to determine if it contains any links or keywords related to scheduling.

### Processing
- Scan the message for specific keywords or phrases.
- Check for keywords such as "schedule", "adjustment", "link", "calendly", "doodle", or the presence of URLs.
- Return 't' if scheduling-related keywords or links are found, and 'f' if not.
`;

const examples = [
  {
    userMessage:
      "明日の会議のための日程調整を行います。場所は5階の会議室です。",
    assistantMessage: "t"
  },
  {
    userMessage: "申し訳ございませんが、明日の会議には参加できません。",
    assistantMessage: "f"
  }
];

export const determineWhetherScheduleAdjustment = async (message: string) =>
  singleCompletion({
    userMessage: message,
    systemMessage,
    examples,
    params: {
      temperature: 0.2,
      max_tokens: 5,
      logit_bias: {
        t: 5,
        f: 5
      }
    }
  });
