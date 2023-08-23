import { UsersInfoResponse, WebClient } from "@slack/web-api";

export const fetchUserInfo = async (
  accessToken: string,
  userId: string,
): Promise<UsersInfoResponse> => {
  const web = new WebClient(accessToken);
  const data = await web.users.info({ user: userId });
  return data;
};
