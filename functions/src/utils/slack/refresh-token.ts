import axios from "axios";
import { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } from "../env";

type SlackOAuthResponse = {
  ok: boolean;
  access_token: string;
  token_type: "bot" | "user";
  scope: string;
  bot_user_id?: string;
  app_id: string;
  expires_in?: number;
  refresh_token?: string;
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
    expires_in?: number;
    refresh_token?: string;
    token_type: "user";
  };
  error?: string;
};

export const refreshToken = async (
  refreshToken: string
): Promise<SlackOAuthResponse> => {
  const response = await axios.post(
    "https://slack.com/api/oauth.v2.access",
    null,
    {
      params: {
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
    }
  );
  return response.data;
};
