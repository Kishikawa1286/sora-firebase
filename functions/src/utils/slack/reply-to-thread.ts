import axios from "axios";

export const replyToSlackThread = async ({
  accessToken,
  channel,
  threadTimestamp,
  text,
}: {
  accessToken: string;
  channel: string;
  threadTimestamp: string;
  text: string;
}): Promise<void> => {
  try {
    const response = await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: channel,
        text: text,
        thread_ts: threadTimestamp,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.ok) {
      console.log("Message sent successfully:", response.data);
      return;
    }
    console.error("Error sending message:", response.data.error);
  } catch (error) {
    console.error("Error sending message to Slack:", error);
  }
};
