import { useEffect } from "react";
import { atom, selector, useRecoilState } from "recoil";
import {
  signInWithApple as _signInWithApple,
  authenticateWithCode,
  handleRedirect,
  onAuthStateChanged
} from "../repositories/auth-repository/auth-repository";
import { ViewModel } from "../utils/view-model";

type AuthenticationPageViewModel = {
  authenticated: boolean;
  errorMessage: string | null;
};

const authenticatedAtom = atom<boolean>({
  key: "authenticationPageModel-authenticated",
  default: false
});

const errorMessageAtom = atom<string | null>({
  key: "authenticationPageModel-errorMessage",
  default: null
});

const authenticatedSelector = selector<boolean>({
  key: "authenticationPageViewModel-authenticated",
  get: ({ get }) => get(authenticatedAtom),
  set: ({ set }, authenticated) => set(authenticatedAtom, authenticated)
});

const errorMessageSelector = selector<string | null>({
  key: "authenticationPageViewModel-errorMessage",
  get: ({ get }) => get(errorMessageAtom),
  set: ({ set }, errorMessage) => set(errorMessageAtom, errorMessage)
});

export const useAuthenticationPageViewModel =
  (): ViewModel<AuthenticationPageViewModel> => {
    const [authenticated, setAuthenticated] = useRecoilState(
      authenticatedSelector
    );
    const [errorMessage, setErrorMessage] =
      useRecoilState(errorMessageSelector);

    useEffect(() => {
      onAuthStateChanged(async (user) => {
        if (user) {
          await authenticateWithCode();
          setAuthenticated(true);
        }
      });
      handleRedirect();
    });

    const signInWithApple = async () => {
      const result = await _signInWithApple();
      if (!result.success) {
        setErrorMessage(result.errorMessage);
        return;
      }
      setErrorMessage(null);
    };

    return {
      state: {
        authenticated,
        errorMessage
      },
      actions: {
        signInWithApple
      }
    };
  };
