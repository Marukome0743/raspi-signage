import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

export default function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" gutterBottom>
        404
      </Typography>
      <Typography>ページが見つかりませんでした</Typography>
    </Box>
  )
}
