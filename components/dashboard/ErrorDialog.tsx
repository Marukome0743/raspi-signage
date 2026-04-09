"use client"

import ReportProblemIcon from "@mui/icons-material/ReportProblem"
import { Box, Button } from "@mui/material"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import Typography from "@mui/material/Typography"

interface ErrorDialogProps {
  error: string
  errorPart: string
  open: boolean
  onClose: () => void
}

export default function ErrorDialog({
  error,
  errorPart,
  open,
  onClose,
}: ErrorDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ textAlign: "center", py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <ReportProblemIcon sx={{ fontSize: 48, color: "error.main" }} />
        </Box>
        <Typography variant="h6" sx={{ mb: 1, color: "error.main" }}>
          {error}
        </Typography>
        {errorPart && (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            対象箇所: {errorPart}
          </Typography>
        )}
        <Button variant="outlined" onClick={onClose}>
          閉じる
        </Button>
      </DialogContent>
    </Dialog>
  )
}
