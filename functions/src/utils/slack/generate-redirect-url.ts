export const generateSlackRedirectUrl = ({
  slack_team_domain,
  slack_channel_id,
  slack_ts,
  slack_thread_ts
}: {
  slack_team_domain: string;
  slack_channel_id: string;
  slack_ts: string;
  slack_thread_ts?: string | undefined;
}): string => {
  if (slack_thread_ts) {
    return `https://${slack_team_domain}.slack.com/archives/${slack_channel_id}/p${slack_ts}?thread_ts=${slack_thread_ts}&cid=${slack_channel_id}`;
  }
  return `https://${slack_team_domain}.slack.com/archives/${slack_channel_id}/p${slack_ts}`;
};
