import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { authRepositoryState } from "../../repositories/auth-repository/auth-repository";
import { ViewModel } from "../../utils/templates/view-model";
import { AuthenticationPageModel, useAuthenticationPageModel } from "./model";

export const useAuthenticationPageViewModel =
  (): ViewModel<AuthenticationPageModel> => {
    const authRepository = useRecoilValue(authRepositoryState);
    if (!authRepository) {
      throw new Error("AuthRepository has not been initialized.");
    }

    const { model, setterOf } = useAuthenticationPageModel({
      name: "authenticationPage",
      default: {
        authenticated: false,
        errorMessage: null
      }
    });

    useEffect(() => {
      authRepository.onAuthStateChanged(async (user) => {
        if (user) {
          await authRepository.authenticateWithCode();
          setterOf.authenticated(true);
        }
      });
    });

    const signInWithApple = async () => {
      const result = await authRepository.signInWithApple();
      if (!result.success) {
        setterOf.errorMessage(result.errorMessage);
        return;
      }
      setterOf.errorMessage(null);
    };

    return {
      model,
      actions: {
        signInWithApple
      }
    };
  };
