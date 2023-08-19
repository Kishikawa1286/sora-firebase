import OpenAI from "openai";
import { OPENAI_API_KEY } from "../env";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

type CompletionExample = {
  userMessage: string;
  assistantMessage: string;
};

export type CompletionCreateParams = {
  frequency_penalty?: number | null;
  logit_bias?: Record<string, number> | null;
  max_tokens?: number;
  n?: number | null;
  presence_penalty?: number | null;
  temperature?: number | null;
  top_p?: number | null;
};

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
}) => {
  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [];

  // Add system message if provided
  if (systemMessage) {
    messages.push({ role: "system", content: systemMessage });
  }

  // Add examples if provided
  if (examples) {
    for (const example of examples) {
      messages.push({ role: "user", content: example.userMessage });
      messages.push({ role: "assistant", content: example.assistantMessage });
    }
  }

  // Add the user message
  messages.push({ role: "user", content: userMessage });

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    ...params,
  });
  const { choices } = completion;
  const content = choices[choices.length - 1].message.content;

  return content;
};
