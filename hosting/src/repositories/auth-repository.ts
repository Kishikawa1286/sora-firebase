import {
  onAuthStateChanged as _onAuthStateChanged,
  signInWithApple as _signInWithApple
} from "../helpers/firebase-auth-helper";
import { callFirebaseFunction } from "../helpers/firebase-functions-helper";

export const onAuthStateChanged = _onAuthStateChanged;

export const signInWithApple = _signInWithApple;

export const authenticateChannel = async () => {
  await callFirebaseFunction("v1-authenticate_channel");
};
