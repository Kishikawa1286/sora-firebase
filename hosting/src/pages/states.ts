import { useEffect } from "react";
import { atom, selector, useRecoilState } from "recoil";
import {
  signInWithEmail as _signInWithEmail,
  authenticateWithCode,
  onAuthStateChanged
} from "../repositories/auth-repository/auth-repository";
import { ViewModel } from "../utils/view-model";

type AuthenticationPageViewModel = {
  authenticated: boolean;
  email: string;
  password: string;
  errorMessage: string | null;
};

const authenticatedAtom = atom<boolean>({
  key: "authenticationPageModel-authenticated",
  default: false
});

const emailAtom = atom<string>({
  key: "authenticationPageModel-email",
  default: ""
});

const passwordAtom = atom<string>({
  key: "authenticationPageModel-password",
  default: ""
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

const emailSelector = selector<string>({
  key: "authenticationPageViewModel-email",
  get: ({ get }) => get(emailAtom),
  set: ({ set }, email) => set(emailAtom, email)
});

const passwordSelector = selector<string>({
  key: "authenticationPageViewModel-password",
  get: ({ get }) => get(passwordAtom),
  set: ({ set }, password) => set(passwordAtom, password)
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
    const [email, setEmail] = useRecoilState(emailSelector);
    const [password, setPassword] = useRecoilState(passwordSelector);
    const [errorMessage, setErrorMessage] =
      useRecoilState(errorMessageSelector);

    useEffect(() => {
      onAuthStateChanged(async (user) => {
        if (user) {
          await authenticateWithCode();
          setAuthenticated(true);
        }
      });
    });

    const signInWithEmail = async () => {
      const result = await _signInWithEmail(email, password);
      if (!result.success) {
        setErrorMessage(result.errorMessage);
        return;
      }
      setErrorMessage(null);
    };

    return {
      state: {
        authenticated,
        email,
        password,
        errorMessage
      },
      actions: {
        signInWithEmail,
        setEmail,
        setPassword
      }
    };
  };
