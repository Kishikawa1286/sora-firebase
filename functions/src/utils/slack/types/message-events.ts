export type MessageEvent = AppHomeMessageEvent |
  ChannelsMessageEvent | GroupsMessageEvent |
  IMMessageEvent | MPIMMessageEvent;

export const isMessageEvent = (event: unknown): event is MessageEvent => {
  if (typeof event !== "object" || event === null) {
    return false;
  }
  const e = event as MessageEvent;
  return e.type === "event_callback" && e.event.type === "message" &&
    (
      e.event.channel_type === "app_home" ||
      e.event.channel_type === "channel" ||
      e.event.channel_type === "group" ||
      e.event.channel_type === "im" ||
      e.event.channel_type === "mpim"
    );
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
    channel: string;
    event_ts: string;
    channel_type: "app_home";
  };
  type: "event_callback";
  authed_teams: string[];
  event_id: string;
  event_time: number;
};

export const isAppHomeMessageEvent = (event: MessageEvent): event is AppHomeMessageEvent => event.event.channel_type === "app_home";

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
    event_ts: string;
    channel_type: "channel";
  };
  type: "event_callback";
  authed_teams: string[];
  event_id: string;
  event_time: number;
};

export const isChannelsMessageEvent = (event: MessageEvent): event is ChannelsMessageEvent => event.event.channel_type === "channel";

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
    event_ts: string;
    channel_type: "group";
  };
  type: "event_callback";
  authed_teams: string[];
  event_id: string;
  event_time: number;
};

export const isGroupsMessageEvent = (event: MessageEvent): event is GroupsMessageEvent => event.event.channel_type === "group";

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
    event_ts: string;
    channel_type: "im";
  };
  type: "event_callback";
  authed_teams: string[];
  event_id: string;
  event_time: number;
};

export const isIMMessageEvent = (event: MessageEvent): event is IMMessageEvent => event.event.channel_type === "im";

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
    event_ts: string;
    channel_type: "mpim";
  };
  type: "event_callback";
  authed_teams: string[];
  event_id: string;
  event_time: number;
};

export const isMPIMMessageEvent = (event: MessageEvent): event is MPIMMessageEvent => event.event.channel_type === "mpim";
