"use client"

import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import ErrorDialog from "@/components/dashboard/ErrorDialog"
import { useOrderContext } from "@/components/dashboard/OrderContext"
import { updateAccountData } from "@/src/services/accounts"
import { getAccountDataClient } from "@/src/services/auth"
import { getContentsDataClient } from "@/src/services/contents"
import { createClient } from "@/src/supabase/client"
import type { AccountData, Content } from "@/src/supabase/database.types"

interface AccountSettingManagementClientProps {
  uid: string | null
  error: string | null
}

export default function AccountSettingManagementClient({
  uid,
  error: serverError,
}: AccountSettingManagementClientProps): React.JSX.Element {
  const [user, setUser] = useState<AccountData | null>(null)
  const [contentList, setContentList] = useState<Content[]>([])

  const [displayFlg, setDisplayFlg] = useState<boolean>(false)
  const [updateDisplay, setUpdateDisplay] = useState<boolean>(false)

  const [userName, setUserName] = useState<string>("")
  const [userNameFlg, setUserNameFlg] = useState<boolean>(true)

  const [nowPassword, setNowPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [newRePassword, setNewRePassword] = useState<string>("")
  const [passwordFlg, setPasswordFlg] = useState<boolean>(true)
  const [management, setManagement] = useState<string>("user")
  const [coverageAreaList, setCoverageAreaList] = useState<boolean[]>([])

  const [error, setError] = useState<string>(serverError ?? "")
  const [errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(!!serverError)

  const { setProgress } = useOrderContext()

  useEffect(() => {
    async function getAccountInfoData(): Promise<void> {
      const u_id = sessionStorage.getItem("uid") || uid
      if (!u_id) {
        return
      }
      const userData = await getAccountDataClient(u_id)
      const contents = await getContentsDataClient()
      console.log(userData)
      setUser(userData)
      console.log(contents)
      setContentList(contents ?? [])
      setDisplayFlg(true)
      setManagement(userData?.management ? "management" : "user")
      const list = (contents ?? []).map(
        (item) => userData?.coverageArea.includes(item.area_id) ?? false,
      )
      setCoverageAreaList(list)
    }
    getAccountInfoData()
  }, [uid])

  const onClickUpdate = async (): Promise<void> => {
    if (!passwordFlg) {
      if (nowPassword === newPassword) {
        setError("同じパスワードが設定されています")
        setErrorPart("パスワード")
        setShowError(true)
        return
      }
      if (newPassword !== newRePassword) {
        setError("新しいパスワードに関して異なった入力がされています")
        setErrorPart("パスワード")
        setShowError(true)
        return
      }
    }
    try {
      setProgress(true)
      const list = coverageAreaList.reduce<string[]>((acc, item, i) => {
        if (item) {
          acc.push(contentList[i].area_id)
        }
        return acc
      }, [])
      const content = {
        userName: userNameFlg ? (user?.userName ?? "") : userName,
        management: management === "management",
        coverageArea: list,
      }
      if (!passwordFlg) {
        await updateAccountData(
          uid ?? "",
          content,
          user?.email ?? "",
          nowPassword,
          newPassword,
        )
      } else {
        await updateAccountData(uid ?? "", content, "", "", "")
      }
      setUpdateDisplay(false)
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

  const onChangeCheckBox = (index: number): void => {
    const list = coverageAreaList.map((item, i) => (index === i ? !item : item))
    setCoverageAreaList(list)
  }

  const areaList: string[] = (user?.coverageArea ?? [])
    .map((area: string) => {
      const list = contentList.filter((content) => content.area_id === area)
      return list[0]?.area_name
    })
    .filter((item): item is string => !!item)

  useEffect(() => {
    const handleBeforeUnload = (): void => {
      const supabase = createClient()
      supabase.auth.signOut()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        アカウント詳細管理
      </Typography>
      {!displayFlg ? (
        <Typography sx={{ color: "text.secondary" }}>データ取得中</Typography>
      ) : (
        <>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            {user?.userName}
          </Typography>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant={updateDisplay ? "outlined" : "contained"}
                onClick={() => setUpdateDisplay(!updateDisplay)}
              >
                {updateDisplay ? "閉じる" : "編集"}
              </Button>
            </Box>

            {updateDisplay ? (
              /* Edit mode */
              <Grid container spacing={2}>
                {/* Username */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      fullWidth
                      label="ユーザー名"
                      placeholder={user?.userName ?? ""}
                      disabled={userNameFlg}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setUserName(e.target.value)
                      }
                    />
                    <FormControlLabel
                      label="変更しない"
                      control={
                        <Checkbox
                          checked={userNameFlg}
                          onChange={() => setUserNameFlg(!userNameFlg)}
                          size="small"
                        />
                      }
                      sx={{ whiteSpace: "nowrap" }}
                    />
                  </Box>
                </Grid>

                {/* Current password */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      fullWidth
                      label="現在のパスワード"
                      type="password"
                      placeholder="現在のパスワード"
                      disabled={passwordFlg}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNowPassword(e.target.value)
                      }
                    />
                    <FormControlLabel
                      label="変更しない"
                      control={
                        <Checkbox
                          checked={passwordFlg}
                          onChange={() => setPasswordFlg(!passwordFlg)}
                          size="small"
                        />
                      }
                      sx={{ whiteSpace: "nowrap" }}
                    />
                  </Box>
                </Grid>

                {/* New password */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="新しいパスワード"
                    type="password"
                    placeholder="新しいパスワード"
                    disabled={passwordFlg}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPassword(e.target.value)
                    }
                  />
                </Grid>

                {/* Confirm new password */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="新しいパスワード（再入力）"
                    type="password"
                    placeholder="新しいパスワード（再入力）"
                    disabled={passwordFlg}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewRePassword(e.target.value)
                    }
                  />
                </Grid>

                {/* Role */}
                <Grid size={12}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5, color: "text.secondary" }}
                  >
                    権限
                  </Typography>
                  <RadioGroup
                    row
                    value={management}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setManagement(e.target.value)
                    }
                  >
                    <FormControlLabel
                      value="management"
                      control={<Radio size="small" disabled />}
                      label="管理者"
                    />
                    <FormControlLabel
                      value="user"
                      control={<Radio size="small" disabled />}
                      label="利用者"
                    />
                  </RadioGroup>
                </Grid>

                {/* Area */}
                <Grid size={12}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5, color: "text.secondary" }}
                  >
                    エリア設定
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {contentList.map((content, i) => (
                      <FormControlLabel
                        key={`areaName_${content.area_id}`}
                        label={content.area_name}
                        control={
                          <Checkbox
                            checked={coverageAreaList[i] ?? false}
                            onChange={() => onChangeCheckBox(i)}
                            size="small"
                          />
                        }
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid size={12}>
                  <Button variant="contained" onClick={() => onClickUpdate()}>
                    更新
                  </Button>
                </Grid>
              </Grid>
            ) : (
              /* Read-only mode */
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    ユーザー名
                  </Typography>
                  <Typography variant="body1">{user?.userName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    パスワード
                  </Typography>
                  <Typography variant="body1">***********</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    権限
                  </Typography>
                  <Typography variant="body1">
                    {user?.management ? "管理者" : "利用者"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 0.5 }}
                  >
                    エリア設定
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {areaList.length > 0 ? (
                      areaList.map((area) => (
                        <Chip
                          key={`areList_${area}`}
                          label={area}
                          size="small"
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        設定なし
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </>
      )}
      <ErrorDialog
        error={error}
        errorPart={errorPart}
        open={showError}
        onClose={handleCloseError}
      />
    </Box>
  )
}
