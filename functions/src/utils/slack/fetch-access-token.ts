import { OauthV2AccessResponse, WebClient } from '@slack/web-api';
import { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } from '../../utils/env';

export const fetchSlackAccessToken = async (
  code: string,
): Promise<OauthV2AccessResponse> => {
  const web = new WebClient();

  const data = await web.oauth.v2.access({
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
    code: code,
  });

  if (!data.ok) {
    throw new Error('Error: data.ok is not true');
  }

  return data;
};
