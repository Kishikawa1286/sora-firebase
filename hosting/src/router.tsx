import { createBrowserRouter } from "react-router-dom";
import AuthenticationPage from "./pages/authentication/view";

export const router = createBrowserRouter([
  {
    path: "*",
    element: <AuthenticationPage />
  }
]);
