import { FirebaseError } from "@firebase/util";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  signInWithApple as _signInWithApple,
  onAuthStateChanged
} from "../../helpers/firebase-auth-helper";
import { callFirebaseFunction } from "../../helpers/firebase-functions-helper";
import { getQueryParam } from "../../helpers/query-param-helper";
import {
  cachedAtom,
  cachedSelector
} from "../../utils/templates/cached-recoil";
import { handleSigninError } from "./internal/error-message";
import { AuthRepositoryBase } from "./repository-base";
import { SignInResult } from "./types/sign-in-result";

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

const authenticateWithCode = async () => {
  const authenticationCode = getQueryParam("code");
  if (typeof authenticationCode !== "string") {
    return;
  }

  await callFirebaseFunction("v1-slack-verify_code", {
    code: authenticationCode
  });
};

const authRepository = cachedAtom<AuthRepositoryBase>({
  key: "atom-authRepository",
  default: { onAuthStateChanged, signInWithApple, authenticateWithCode }
});

export const useAuthRepository = (): AuthRepositoryBase =>
  useRecoilValue(authRepository);

// This function is used for testing.
export const useAuthRepositoryOverrider = (value: AuthRepositoryBase) => {
  const authRepositorySelector = cachedSelector({
    atom: authRepository,
    selectorKey: "selector-authRepository"
  });
  const [, setAuthRepository] = useRecoilState(authRepositorySelector);
  setAuthRepository(value);
};
