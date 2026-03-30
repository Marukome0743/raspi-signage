"use client"

import { createTheme, ThemeProvider } from "@mui/material/styles"
import PasswordResetComponent from "../../../components/dashboard/PasswordResetComponent"

const theme = createTheme()

export default function PasswordResetPage(): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <PasswordResetComponent />
    </ThemeProvider>
  )
}
