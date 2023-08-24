import { setVerifiedSlackUser } from "../../../utils/firestore/slack-token";
import { searchSlackVerificationCodeByCode } from "../../../utils/firestore/slack-verification-code";
import { setSlackUser } from "../../../utils/firestore/user";
import { functions256MB } from "../../../utils/functions";
import { fetchSlackAccessToken } from "../../../utils/slack/fetch-access-token";
import { fetchTeamInfo } from "../../../utils/slack/fetch-team-info";

// TODO: define exception type
export const verifySlackCode = functions256MB.https.onCall(
  async ({ code }: { code: string }, context) => {
    const appUserId = context.auth?.uid;

    if (!appUserId) {
      throw new Error("Unauthenticated");
    }

    if (typeof code !== "string") {
      throw new Error("Missing parameter code");
    }

    const verificationCodeData = await searchSlackVerificationCodeByCode(code);

    if (!verificationCodeData) {
      throw new Error("Verification code not found");
    }

    const { slack_user_id: slackUserId, slack_team_id: teamId } =
      verificationCodeData;

    const accessTokenData = await fetchSlackAccessToken(code);

    const { access_token: accessToken } = accessTokenData;

    if (!accessToken) {
      throw new Error("Missing data from Slack API");
    }

    const teamInfoRes = await fetchTeamInfo(accessToken, teamId);
    if (!teamInfoRes.ok) {
      throw new Error("Failed to fetch team info from Slack API");
    }
    const { team } = teamInfoRes;
    if (!team) {
      throw new Error("Missing data from Slack API");
    }
    const { domain, name, icon } = team;
    if (!domain || !name || !icon) {
      throw new Error("Missing data from Slack API");
    }
    const teamIconUrl = icon.image_132;
    if (!teamIconUrl) {
      throw new Error("Missing team icon URL");
    }

    await setVerifiedSlackUser(teamId, appUserId, slackUserId);

    await setSlackUser({
      userId: appUserId,
      slackUserId: slackUserId,
      slackTeamId: teamId,
      slackTeamAvatarBaseUrl: team.avatar_base_url,
      slackTeamDiscoverable: team.discoverable,
      slackTeamDomain: domain,
      slackTeamIconUrl: teamIconUrl,
      slackTeamName: name,
      language: verificationCodeData.language
    });
  }
);
