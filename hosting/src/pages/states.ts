import { atom, selector, useRecoilState } from "recoil";
import {
  authenticateSlackUserWithApple,
  onAuthStateChanged
} from "../repositories/auth-repository";
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
  set: async ({ set }) =>
    onAuthStateChanged((user) => {
      set(authenticatedAtom, user !== null);
    })
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

    const signInWithApple = async () => {
      const result = await authenticateSlackUserWithApple();
      if (!result.success) {
        setErrorMessage(result.errorMessage);
        return;
      }
      setAuthenticated(true);
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
