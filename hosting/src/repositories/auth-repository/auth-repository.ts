import { FirebaseError } from "@firebase/util";
import {
  onAuthStateChanged as _onAuthStateChanged,
  signInWithEmail as _signInWithEmail
} from "../../helpers/firebase-auth-helper";
import { callFirebaseFunction } from "../../helpers/firebase-functions-helper";
import { getQueryParam } from "../../helpers/query-param-helper";
import { handleSigninError } from "./error-message";

export const onAuthStateChanged = _onAuthStateChanged;

type SignInResult = {
  success: boolean;
  errorMessage: string | null; // null if success is true
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<SignInResult> => {
  try {
    await _signInWithEmail(email, password);
    return {
      success: true,
      errorMessage: null
    };
  } catch (error) {
    console.error(error);
    if (error instanceof FirebaseError) {
      return {
        success: false,
        errorMessage: handleSigninError(error)
      };
    }
    return {
      success: false,
      errorMessage: "認証に失敗しました。しばらく時間をおいて再度お試しください"
    };
  }
};

export const authenticateWithCode = async () => {
  const authenticationCode = getQueryParam("code");
  if (typeof authenticationCode !== "string") {
    return;
  }

  await callFirebaseFunction("v1-slack-verify_code", {
    code: authenticationCode
  });
};
