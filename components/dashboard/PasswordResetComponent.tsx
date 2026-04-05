"use client"

import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
import { resetPassword } from "@/src/services/accounts"
import { checkAccountPassKey, getAccountDataClient } from "@/src/services/auth"
import { createClient } from "@/src/supabase/client"
import type { AccountData } from "@/src/supabase/database.types"
import ErrorDialog from "./ErrorDialog"
import { useOrderContext } from "./OrderContext"

function PasswordResetComponent(): React.JSX.Element {
  const [user, setUser] = useState<AccountData | null>(null)
  const [nowPassword, setNowPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [newRePassword, setNewRePassword] = useState<string>("")

  const [error, setError] = useState<string>("")
  const [errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(false)

  const { uid, setUid, setUserName, setProgress } = useOrderContext()

  const router = useRouter()

  useEffect(() => {
    async function getInfoData() {
      console.log(uid)
      if (!uid) {
        return false
      }
      const user = await getAccountDataClient(uid)
      setUser(user)
      return user?.passFlg
    }
    const passFlg = getInfoData()
    if (!passFlg) {
      router.push("/dashboard/login")
    }
  }, [uid, router.push])

  // Handle form submission
  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()
    if (newPassword !== newRePassword) {
      return
    }
    try {
      setProgress(true) // Show spinner
      console.log(user)
      if (!user) {
        return
      }
      const check = await checkAccountPassKey(user.email)
      if (check != null) {
        await resetPassword(uid as string, user.email, nowPassword, newPassword)
        const supabase = createClient()
        await supabase.auth.signOut()
        setUid("")
        setUserName("")
        setProgress(false)
        router.push("/dashboard/login")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
    } finally {
      setProgress(false)
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
          パスワード再設定
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            type="password"
            required
            fullWidth
            id="password"
            label="現在のパスワード"
            name="nowPassword"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNowPassword(e.target.value)
            }
            autoFocus
          />
          <TextField
            margin="normal"
            type="password"
            required
            fullWidth
            id="password"
            label="新しいパスワード"
            name="newPassword"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewPassword(e.target.value)
            }
          />
          <TextField
            margin="normal"
            type="password"
            required
            fullWidth
            id="password"
            label="新しいパスワード（再入力）"
            name="newRePassword"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRePassword(e.target.value)
            }
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            パスワード再設定
          </Button>
        </Box>
      </Box>
      <ErrorDialog
        error={error}
        errorPart={errorPart}
        open={showError}
        onClose={handleCloseError}
      />
    </Container>
  )
}

export default PasswordResetComponent
