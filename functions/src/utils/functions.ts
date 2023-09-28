import * as f from "firebase-functions";

process.env.TZ = "Asia/Tokyo";

// TODO: Use different secrets depending on the function
const secrets = ["SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET", "OPENAI_API_KEY"];

export const functions8GB = f
  .runWith({ secrets, memory: "8GB" })
  .region("asia-northeast1");
export const functions4GB = f
  .runWith({ secrets, memory: "4GB" })
  .region("asia-northeast1");
export const functions2GB = f
  .runWith({ secrets, memory: "2GB" })
  .region("asia-northeast1");
export const functions1GB = f
  .runWith({ secrets, memory: "1GB" })
  .region("asia-northeast1");
export const functions512MB = f
  .runWith({ secrets, memory: "512MB" })
  .region("asia-northeast1");
export const functions256MB = f
  .runWith({ secrets, memory: "256MB" })
  .region("asia-northeast1");
export const functions128MB = f
  .runWith({ secrets, memory: "128MB" })
  .region("asia-northeast1");
