"use client"

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
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Typography variant="body1">対象箇所</Typography>
        <Typography variant="body1">{errorPart}</Typography>
      </DialogContent>
    </Dialog>
  )
}
