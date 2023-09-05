import { WebClient } from "@slack/web-api";

export const joinConversation = async (
  accessToken: string,
  channelId: string
): Promise<void> => {
  const web = new WebClient(accessToken);
  await web.conversations.join({ channel: channelId });
};
