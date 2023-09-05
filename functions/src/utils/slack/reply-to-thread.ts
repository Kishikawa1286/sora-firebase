import { WebClient } from "@slack/web-api";

export const replyToSlackThread = async ({
  accessToken,
  channel,
  threadTimestamp,
  text
}: {
  accessToken: string;
  channel: string;
  threadTimestamp: string;
  text: string;
}): Promise<void> => {
  const web = new WebClient(accessToken);

  try {
    const response = await web.chat.postMessage({
      channel: channel,
      text: text,
      thread_ts: threadTimestamp
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
