import { blue } from "@mui/material/colors"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import dynamic from "next/dynamic"

const ContentsView = dynamic(
  () => import("../../components/dashboard/ManageContentsList"),
  { ssr: false },
)

export async function getServerSideProps() {
  return {
    props: {
      dashboard: true,
      areaDisplay: true,
    },
  }
}

const theme = createTheme({
  palette: {
    primary: blue,
  },
})

function ManageContents() {
  return (
    <ThemeProvider theme={theme}>
      <ContentsView />
    </ThemeProvider>
  )
}

export default ManageContents
