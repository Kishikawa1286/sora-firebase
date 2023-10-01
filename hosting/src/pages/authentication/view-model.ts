import { useEffect } from "react";
import { useAuthRepository } from "../../repositories/auth/repository";
import { useModel } from "../../utils/templates/model";
import { ViewModel } from "../../utils/templates/view-model";
import { AuthenticationPageModel } from "./model";

export const useAuthenticationPageViewModel =
  (): ViewModel<AuthenticationPageModel> => {
    const authRepository = useAuthRepository();

    const { model, setterOf } = useModel<AuthenticationPageModel>({
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
