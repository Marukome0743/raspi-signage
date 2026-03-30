"use client"

import { blue } from "@mui/material/colors"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import ManageContentsView from "../../../components/dashboard/ManageContentsList"

const theme = createTheme({
  palette: {
    primary: blue,
  },
})

export default function ManageContentsPage(): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <ManageContentsView />
    </ThemeProvider>
  )
}
