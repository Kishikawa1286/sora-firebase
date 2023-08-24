import { FirebaseError } from "@firebase/util";
import {
  onAuthStateChanged as _onAuthStateChanged,
  signInWithApple as _signInWithApple
} from "../helpers/firebase-auth-helper";
import { callFirebaseFunction } from "../helpers/firebase-functions-helper";
import { getQueryParam } from "../helpers/query-param-helper";
import { handleSigninError } from "./auth-repository/error-message";

export const onAuthStateChanged = _onAuthStateChanged;

type SignInResult = {
  success: boolean;
  errorMessage: string | null; // null if success is true
};

const signInWithApple = async (): Promise<SignInResult> => {
  try {
    await _signInWithApple();
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

export const authenticateSlackUserWithApple =
  async (): Promise<SignInResult> => {
    try {
      const result = await signInWithApple();

      if (!result.success) {
        // Process error caused by Firebase Auth
        return result;
      }

      const authenticationCode = getQueryParam("code");
      if (typeof authenticationCode !== "string") {
        return {
          success: false,
          errorMessage: "認証に失敗しました。再度URLを発行してください"
        };
      }

      await callFirebaseFunction("v1-slack-verify_code", {
        code: authenticationCode
      });

      return result;
      // Process error not caused by Firebase Auth, e.g. network error
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return {
          success: false,
          errorMessage: error.message
        };
      }
      return {
        success: false,
        errorMessage:
          "認証に失敗しました。しばらく時間をおいて再度お試しください"
      };
    }
  };
