import { NextOrObserver, User } from "firebase/auth";
import { SignInResult } from "./types/sign-in-result";

export type AuthRepositoryBase = {
  onAuthStateChanged: (nextOrObserver: NextOrObserver<User>) => void;
  signInWithApple: () => Promise<SignInResult>;
  authenticateWithCode: () => Promise<void>;
};
