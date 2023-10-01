import { Alert, Box, Button, Card, Container, Typography } from "@mui/material";
import React from "react";
import { AppleLoginButton } from "react-social-login-buttons";
import { APP_DYNAMIC_LINK } from "../../utils/env";
import { useAuthenticationPageViewModel } from "./view-model";

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
          alignItems="center" // 横方向の中央寄せ
          justifyContent="center" // 縦方向の中央寄せ
          padding={4}
        >
          {viewModel.model.authenticated ? (
            <div>
              <Typography variant="body1" gutterBottom>
                認証が完了しました！
              </Typography>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: 20 }}
              >
                <a href={APP_DYNAMIC_LINK}>アプリを開く</a>
              </Button>
            </div>
          ) : (
            <div>
              <Typography variant="h6" gutterBottom>
                Sora
              </Typography>
              <Typography variant="body1" gutterBottom>
                ログインしてSoraに追加するSNSアカウントの認証を行います。
              </Typography>
              <AppleLoginButton
                onClick={viewModel.actions.signInWithApple}
                style={{ marginTop: 20 }}
              />
              {viewModel.model.errorMessage && (
                <Alert severity="error" style={{ marginTop: 16 }}>
                  {viewModel.model.errorMessage}
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
