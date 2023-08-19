import axios from "axios";

type SlackPublicChannelInfo = {
  ok: boolean;
  channel: {
    id: string;
    name: string;
    is_channel: boolean;
    created: number;
    creator: string;
    is_archived: boolean;
    is_general: boolean;
    name_normalized: string;
    is_read_only: boolean;
    is_shared: boolean;
    is_ext_shared: boolean;
    is_org_shared: boolean;
    is_member: boolean;
    is_private: boolean;
    is_mpim: boolean;
    last_read: string;
    topic: {
      value: string;
      creator: string;
      last_set: number;
    };
    purpose: {
      value: string;
      creator: string;
      last_set: number;
    };
    previous_names: string[];
    locale: string;
  };
  error?: string;
};

type SlackPrivateChannelInfo = {
  ok: boolean;
  channel: {
    id: string;
    created: number;
    is_im: boolean;
    is_org_shared: boolean;
    user: string;
    last_read: string;
    latest: {
      type: string;
      user: string;
      text: string;
      ts: string;
    };
    unread_count: number;
    unread_count_display: number;
    is_open: boolean;
    locale: string;
    priority: number;
    num_members?: number;
  };
  error?: string;
};

export const fetchPublicChannelInfo = async (
  accessToken: string,
  channelId: string
): Promise<SlackPublicChannelInfo> => {
  const response = await axios.get<SlackPublicChannelInfo>(
    "https://slack.com/api/conversations.info",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        channel: channelId,
      },
    }
  );
  return response.data;
};

export const fetchPrivateChannelInfo = async (
  accessToken: string,
  channelId: string
): Promise<SlackPrivateChannelInfo> => {
  const response = await axios.get<SlackPrivateChannelInfo>(
    "https://slack.com/api/conversations.info",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        channel: channelId,
      },
    }
  );
  return response.data;
};
