// Secrets
export const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID ?? "";
export const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET ?? "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const LINE_CHANNEL_ACCESS_TOKEN =
  process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
export const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? "";

// .env.*
// We cannot use FIREBASE_ prefix because it is reserved by Firebase
export const FIREBASE_HOSTING_URL = process.env.FB_HOSTING_URL ?? "";
