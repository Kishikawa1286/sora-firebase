import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography
} from "@mui/material";
import React from "react";
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
          alignItems="center" // 横方向の中央寄せ
          justifyContent="center" // 縦方向の中央寄せ
          padding={4}
        >
          {viewModel.state.authenticated ? (
            <div>
              <Typography variant="body1" gutterBottom>
                認証が完了しました！
              </Typography>
            </div>
          ) : (
            <div>
              <Typography variant="h6" gutterBottom>
                Sora
              </Typography>
              <Typography variant="body1" gutterBottom>
                ログインしてSoraに追加するSNSアカウントの認証を行います。
              </Typography>
              <TextField
                variant="outlined"
                margin="dense"
                required
                fullWidth
                label="メールアドレス"
                value={viewModel.state.email}
                onChange={(e) => viewModel.actions.setEmail(e.target.value)}
              />
              <TextField
                variant="outlined"
                margin="dense"
                required
                fullWidth
                label="パスワード"
                type="password"
                value={viewModel.state.password}
                onChange={(e) => viewModel.actions.setPassword(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={viewModel.actions.signInWithEmail}
                style={{ marginTop: 20 }}
              >
                メールでサインイン
              </Button>
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
