import {
  getSlackToken,
  refreshSlackToken
} from "../../../utils/firestore/slack-token";
import { refreshToken } from "../../../utils/slack/refresh-token";

export const getRefreshedAccessToken = async (
  teamId: string,
): Promise<string> => {
  const tokenData = await getSlackToken(teamId);

  // Check if the token expiration time is less than 15 minutes
  const now = new Date();
  // Calculate time left in seconds
  const timeLeft =
    (tokenData.expires_at.toDate().getTime() - now.getTime()) / 1000;

  // If the token is valid for more than 15 minutes, return the token
  if (timeLeft > 15 * 60) {
    return tokenData.access_token;
  }

  const refreshedData = await refreshToken(tokenData.refresh_token);

  const refreshedAccessToken = refreshedData.access_token;
  const refreshedRefreshToken = refreshedData.refresh_token;
  const refreshedExpiresInSeconds = refreshedData.expires_in;

  // These variables are normally not undefined, but check them for linter
  if (!refreshedRefreshToken || !refreshedExpiresInSeconds) {
    throw new Error("Missing data for token rotation");
  }

  await refreshSlackToken({
    teamId: teamId,
    accessToken: refreshedAccessToken,
    expiresInSeconds: refreshedExpiresInSeconds,
    refreshToken: refreshedRefreshToken
  });

  return refreshedAccessToken;
};
