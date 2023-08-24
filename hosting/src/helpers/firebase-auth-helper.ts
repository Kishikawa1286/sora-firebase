import {
  NextOrObserver,
  OAuthProvider,
  User,
  onAuthStateChanged as _onAuthStateChanged,
  getAuth,
  signInWithRedirect
} from "firebase/auth";
import { firebaseApp } from "../utils/firebase-app";

const auth = getAuth(firebaseApp);

export const onAuthStateChanged = (nextOrObserver: NextOrObserver<User>) => {
  _onAuthStateChanged(auth, nextOrObserver);
};

export const signInWithApple = async () => {
  const provider = new OAuthProvider("apple.com");
  await signInWithRedirect(auth, provider);
};