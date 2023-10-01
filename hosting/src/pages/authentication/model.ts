import { useModel } from "../../utils/templates/model";

export type AuthenticationPageModel = {
  authenticated: boolean;
  errorMessage: string | null;
};

export const useAuthenticationPageModel = ({
  name,
  default: defaultModel
}: {
  name: string;
  default: AuthenticationPageModel;
}) => useModel({ name, default: defaultModel });
