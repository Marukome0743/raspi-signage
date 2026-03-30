import type { AlertColor, AlertProps } from "@mui/material/Alert"
import MuiAlert from "@mui/material/Alert"
import type { SnackbarCloseReason } from "@mui/material/Snackbar"
import Snackbar from "@mui/material/Snackbar"
import { forwardRef } from "react"

interface CustomizedSnackbarsProps {
  open: boolean
  handleClose: (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => void
  type: AlertColor
  message: string
}

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert elevation={6} variant="filled" ref={ref} {...props} />
})
Alert.displayName = "Alert"

const CustomizedSnackbars: React.FC<CustomizedSnackbarsProps> = ({
  open,
  handleClose,
  type,
  message,
}) => {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={type}>
        {message}
      </Alert>
    </Snackbar>
  )
}

export default CustomizedSnackbars
