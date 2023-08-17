import axios from "axios";
import { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } from "../../utils/env";

// See: https://api.slack.com/authentication/oauth-v2

type SlackResponse = {
  ok: boolean;
  access_token: string;
  token_type: string;
  scope: string;
  bot_user_id: string;
  app_id: string;
  refresh_token?: string;
  expires_in?: number;
  team: {
    name: string;
    id: string;
  };
  enterprise?: {
    name: string;
    id: string;
  };
  authed_user?: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
};

type FormattedResponse = {
  accessToken: string;
  botUserId: string;
  appId: string;
  teamName: string;
  teamId: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  enterpriseName?: string;
  enterpriseId?: string;
  authedUserId?: string;
  authedUserScope?: string;
  authedUserAccessToken?: string;
};

export const fetchSlackAccessToken = async (
  code: string
): Promise<FormattedResponse> => {
  const response = await axios.post(
    "https://slack.com/api/oauth.v2.access",
    null,
    {
      params: {
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code: code,
      },
    }
  );

  const data: SlackResponse = response.data;
  console.log(data);

  if (data.ok) {
    const formatted: FormattedResponse = {
      accessToken: data.access_token,
      botUserId: data.bot_user_id,
      appId: data.app_id,
      teamName: data.team.name,
      teamId: data.team.id,
      refreshToken: data.refresh_token,
      expiresInSeconds: data.expires_in,
      enterpriseName: data.enterprise?.name,
      enterpriseId: data.enterprise?.id,
      authedUserId: data.authed_user?.id,
      authedUserScope: data.authed_user?.scope,
      authedUserAccessToken: data.authed_user?.access_token,
    };

    return formatted;
  }
  throw new Error(`Error: data.ok is ${data.ok}`);
};
