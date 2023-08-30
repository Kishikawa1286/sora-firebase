import { WebClient } from "@slack/web-api";

export const addSlackReaction = async ({
  accessToken,
  channel,
  threadTimestamp,
  reactionName
}: {
  accessToken: string;
  channel: string;
  threadTimestamp: string;
  reactionName: string;
}): Promise<void> => {
  const web = new WebClient(accessToken);

  try {
    const response = await web.reactions.add({
      name: reactionName,
      channel,
      timestamp: threadTimestamp
    });

    if (!response.ok) {
      console.log(
        `Error sending message:, ${JSON.stringify(response.error).replace(
          "\n",
          " "
        )}`
      );
      return;
    }

    console.log("Message sent successfully:");
  } catch (error) {
    console.log("Error sending message to Slack:", error);
  }
};
