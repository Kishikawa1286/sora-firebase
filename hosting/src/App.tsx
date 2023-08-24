import { Container, ThemeProvider, createTheme } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark"
  }
});

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
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
      ></Container>
    </ThemeProvider>
  );
};

export default App;
