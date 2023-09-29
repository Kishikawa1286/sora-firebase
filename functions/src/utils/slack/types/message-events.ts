export type SlackMessageEvent =
  | AppHomeMessageEvent
  | ChannelsMessageEvent
  | GroupsMessageEvent
  | IMMessageEvent
  | MPIMMessageEvent;

export const isSlackMessageEvent = (
  event: unknown
): event is SlackMessageEvent => {
  if (typeof event !== "object" || event === null) {
    return false;
  }
  const e = event as SlackMessageEvent;
  return (
    e.type === "event_callback" &&
    e.event.type === "message" &&
    (e.event.channel_type === "app_home" ||
      e.event.channel_type === "channel" ||
      e.event.channel_type === "group" ||
      e.event.channel_type === "im" ||
      e.event.channel_type === "mpim")
  );
};

// See: https://api.slack.com/types/file
export type SlackFile = {
  name: string;
  mimetype: string;
  url_private_download: string;
};

// See: https://api.slack.com/events/message.app_home
export type AppHomeMessageEvent = {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    type: "message";
    user: string;
    text: string;
    ts: string;
    thread_ts?: string;
    channel: string;
    event_ts: string;
    channel_type: "app_home";
    files?: SlackFile[];
  };
  type: "event_callback";
  authed_teams: string[];
  event_id: string;
  event_time: number;
};

export const isAppHomeMessageEvent = (
  event: SlackMessageEvent
): event is AppHomeMessageEvent => event.event.channel_type === "app_home";

// See: https://api.slack.com/events/message.channels
export type ChannelsMessageEvent = {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    type: "message";
    channel: string;
    user: string;
    text: string;
    ts: string;
    thread_ts?: string;
    event_ts: string;
    channel_type: "channel";
    files?: SlackFile[];
  };
  type: "event_callback";
  authed_teams: string[];
  event_id: string;
  event_time: number;
};

export const isChannelsMessageEvent = (
  event: SlackMessageEvent
): event is ChannelsMessageEvent => event.event.channel_type === "channel";

// See: https://api.slack.com/events/message.groups
export type GroupsMessageEvent = {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    type: "message";
    channel: string;
    user: string;
    text: string;
    ts: string;
    thread_ts?: string;
    event_ts: string;
    channel_type: "group";
    files?: SlackFile[];
  };
  type: "event_callback";
  authed_teams: string[];
  event_id: string;
  event_time: number;
};

export const isGroupsMessageEvent = (
  event: SlackMessageEvent
): event is GroupsMessageEvent => event.event.channel_type === "group";

// See: https://api.slack.com/events/message.im
export type IMMessageEvent = {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    type: "message";
    channel: string;
    user: string;
    text: string;
    ts: string;
    thread_ts?: string;
    event_ts: string;
    channel_type: "im";
    files?: SlackFile[];
  };
  type: "event_callback";
  authed_teams: string[];
  event_id: string;
  event_time: number;
};

export const isIMMessageEvent = (
  event: SlackMessageEvent
): event is IMMessageEvent => event.event.channel_type === "im";

// See: https://api.slack.com/events/message.mpim
export type MPIMMessageEvent = {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    type: "message";
    channel: string;
    user: string;
    text: string;
    ts: string;
    thread_ts?: string;
    event_ts: string;
    channel_type: "mpim";
    files?: SlackFile[];
  };
  type: "event_callback";
  authed_teams: string[];
  event_id: string;
  event_time: number;
};

export const isMPIMMessageEvent = (
  event: SlackMessageEvent
): event is MPIMMessageEvent => event.event.channel_type === "mpim";
