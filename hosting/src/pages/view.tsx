import { Alert, Box, Card, Container, Typography } from "@mui/material";
import React from "react";
import { AppleLoginButton } from "react-social-login-buttons";
import { useAuthenticationPageViewModel } from "./states";

const AuthenticationPage: React.FC<object> = () => {
  const viewModel = useAuthenticationPageViewModel();

  return (
    <Container
      component="main"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        maxWidth: "none"
      }}
    >
      <Card elevation={3} style={{ padding: 16, width: "100%", maxWidth: 400 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={4}
        >
          {viewModel.state.authenticated ? (
            <div>
              <Typography variant="h6" gutterBottom>
                認証されました
              </Typography>
            </div>
          ) : (
            <div>
              <Typography variant="h6" gutterBottom>
                Sora
              </Typography>
              <AppleLoginButton
                text="Appleでサインイン"
                onClick={viewModel.actions.signInWithApple}
              />
              {viewModel.state.errorMessage && (
                <Alert severity="error" style={{ marginTop: 16 }}>
                  {viewModel.state.errorMessage}
                </Alert>
              )}
            </div>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default AuthenticationPage;
