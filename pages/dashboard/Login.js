import { createTheme, ThemeProvider } from "@mui/material/styles"
import dynamic from "next/dynamic"

const ContentsView = dynamic(
  () => import("../../components/dashboard/LoginComponent"),
  { ssr: false },
)

export async function getServerSideProps() {
  return {
    props: {
      dashboard: true,
    },
  }
}

const theme = createTheme()

function Login() {
  return (
    <ThemeProvider theme={theme}>
      <ContentsView />
    </ThemeProvider>
  )
}

export default Login
