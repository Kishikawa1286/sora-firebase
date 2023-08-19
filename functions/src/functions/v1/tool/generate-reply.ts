import { functions128MB } from "../../../utils/functions";
import { generateChatReply } from "../../../utils/openai/generate-reply";

type GenerateReplyData = {
  type: "chat" | "email";
  text: string;
};

export const generateReply = functions128MB.https.onCall(
  async (data: GenerateReplyData, context): Promise<string> => {
    if (!context.auth) {
      throw new Error("Unauthenticated");
    }

    const { text } = data;

    const reply = await generateChatReply(text);

    if (!reply) {
      throw new Error("Failed to generate reply");
    }

    return reply;
  }
);
