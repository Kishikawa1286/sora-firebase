import { deleteUser } from "../../../utils/firestore/user";
import { functions128MB } from "../../../utils/functions";

export const onDeleteUser = functions128MB.auth
  .user()
  .onDelete(async (userRecord) => {
    const { uid } = userRecord;
    await deleteUser(uid);
  });
