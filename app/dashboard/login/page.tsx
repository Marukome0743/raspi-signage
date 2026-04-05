"use client"

import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import Snackbar from "@mui/material/Snackbar"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
import ErrorDialog from "@/components/dashboard/ErrorDialog"
import { useOrderContext } from "@/components/dashboard/OrderContext"
import { getAccountLoginData } from "@/src/services/auth"

interface SnackbarStatus {
  open: boolean
  type: string
  message: string
}

export default function LoginPage(): React.JSX.Element {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [status, setStatus] = useState<SnackbarStatus>({
    open: false,
    type: "",
    message: "",
  })

  const [error, setError] = useState<string>("")
  const [errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(false)

  const { setIsAdmin, setUid, setUserName, setCoverageArea, setProgress } =
    useOrderContext()

  const router = useRouter()

  const handleClose = (
    _: React.SyntheticEvent | Event,
    reason?: string,
  ): void => {
    if (reason === "clickaway") {
      return
    }
    setStatus({ ...status, open: false })
  }

  // Handle form submission
  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()
    const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,}$/
    const isValidEmail = regex.test(email)
    if (!isValidEmail) {
      setError("メールアドレスの形式が異なっています")
      setErrorPart("メールアドレス欄")
      setShowError(true)
      return
    }
    setProgress(true) // Show spinner
    try {
      const user = await getAccountLoginData(email, password)
      if (user != null) {
        setUid(user.uid)
        console.log(user)
        if (user.passFlg) {
          router.push("/dashboard/password-reset")
          return
        }
        setUserName(user.userName)
        setCoverageArea(user.coverageArea)
        if (user.management) {
          setIsAdmin(true)
        }

        router.push("/dashboard")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
      setError("ログイン失敗しました。メールアドレスかパスワードが異なります")
      setErrorPart("ログイン")
      setShowError(true)
    } finally {
      setProgress(false) // Hide spinner
    }
  }

  const handleCloseError = (): void => {
    setShowError(false)
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          ログイン
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="e-mail"
            name="email"
            autoComplete="email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            ログイン
          </Button>
          <Grid container>
            <Grid size="grow">
              <Link
                href="#"
                variant="body2"
                onClick={() => {
                  setStatus({
                    open: true,
                    type: "error",
                    message: `管理者に問い合わせてください`,
                  })
                }}
              >
                パスワードを忘れた?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Snackbar
        open={status.open}
        onClose={handleClose}
        autoHideDuration={3000}
        message={status.message}
        style={{ position: "relative" }}
      />
      <ErrorDialog
        error={error}
        errorPart={errorPart}
        open={showError}
        onClose={handleCloseError}
      />
    </Container>
  )
}
