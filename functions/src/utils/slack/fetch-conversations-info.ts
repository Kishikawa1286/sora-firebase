import { ConversationsInfoResponse, WebClient } from "@slack/web-api";

export const fetchConversationsInfo = async (
  accessToken: string,
  channelId: string
): Promise<ConversationsInfoResponse> => {
  const web = new WebClient(accessToken);
  const data = await web.conversations.info({
    channel: channelId,
  });
  return data;
};
