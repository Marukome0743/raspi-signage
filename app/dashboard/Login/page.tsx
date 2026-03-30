"use client"

import { createTheme, ThemeProvider } from "@mui/material/styles"
import LoginComponent from "../../../components/dashboard/LoginComponent"

const theme = createTheme()

export default function LoginPage(): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <LoginComponent />
    </ThemeProvider>
  )
}
