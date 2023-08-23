import { createUser } from "../../../utils/firestore/user";
import { functions128MB } from "../../../utils/functions";

export const onCreateUser = functions128MB.auth
  .user()
  .onCreate(async (userRecord) => {
    const { uid, email } = userRecord;
    createUser({ id: uid, email });
  });
