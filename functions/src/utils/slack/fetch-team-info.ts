import { TeamInfoResponse, WebClient } from '@slack/web-api';

export const fetchTeamInfo = async (
  accessToken: string,
  teamId: string,
): Promise<TeamInfoResponse> => {
  const web = new WebClient(accessToken);
  const data = await web.team.info({ team: teamId });
  return data;
};
