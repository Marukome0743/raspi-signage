import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  Grid,
  Paper,
  Typography,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "../../src/supabase/client"
import type { AccountData, Content } from "../../src/supabase/database.types"
import {
  getAccountDataClient,
  getContentsDataClient,
} from "../../utilities/getContentDataClient"
import { updateAccountData } from "../../utilities/setContentData"
import { useOrderContext } from "./OrderContext"

function AccountSettingManagementComponent(): React.JSX.Element {
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

  const [error, setError] = useState<string>("")
  const [errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(false)

  const { uid, setProgress, setCoverageArea } = useOrderContext()
  const router = useRouter()

  useEffect(() => {
    if (!sessionStorage.getItem("uid") && !uid) {
      router.push("/dashboard/Login")
    }
    async function getAccountInfoData(): Promise<void> {
      const u_id = sessionStorage.getItem("uid") || uid
      if (!u_id) {
        return
      }
      const userData = await getAccountDataClient(u_id)
      const contents = await getContentsDataClient("contents")
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
  }, [router.push, uid])

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
      setCoverageArea(list)
      setUpdateDisplay(false)
    } catch (e) {
      console.log(e)
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
    .map((_area: string) => {
      const list = contentList.filter((content) => content.area_id === _area)
      return list[0]?.area_name
    })
    .filter((item): item is string => !!item)

  useEffect(() => {
    const handleBeforeUnload = (): void => {
      supabase.auth.signOut()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return (
    <Box>
      <Typography>アカウント詳細管理</Typography>
      {!displayFlg ? (
        <Typography>データ取得中</Typography>
      ) : (
        <>
          <Typography style={{ width: "50%", lineHeight: "35px" }}>
            ユーザー名： {user?.userName}
          </Typography>
          <Box style={{ display: "flex", flexDirection: "column" }}>
            <Paper
              sx={{ height: 1 / 5, m: 1 }}
              key={"key"}
              style={{ position: "relative" }}
            >
              <Grid container>
                {updateDisplay ? (
                  <Button
                    variant="contained"
                    sx={{ m: 1 }}
                    onClick={() => setUpdateDisplay(false)}
                  >
                    閉じる
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    sx={{ m: 1 }}
                    onClick={() => setUpdateDisplay(true)}
                  >
                    編集
                  </Button>
                )}
              </Grid>
              <Grid>
                {updateDisplay ? (
                  <>
                    <Grid container>
                      <Grid
                        size={8}
                        container
                        direction="column"
                        style={{
                          minWidth: "550px",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "20px",
                        }}
                      >
                        <Grid
                          style={{
                            display: "flex",
                            height: "45px",
                            padding: "5px",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography style={{ lineHeight: "35px" }}>
                            ユーザー名：{" "}
                          </Typography>
                          <input
                            type="text"
                            style={{ width: "50%" }}
                            name={"userName"}
                            placeholder={user?.userName ?? ""}
                            disabled={userNameFlg}
                            onInput={(e: React.FormEvent<HTMLInputElement>) =>
                              setUserName((e.target as HTMLInputElement).value)
                            }
                          />
                        </Grid>
                        <FormControlLabel
                          label={"変更しない"}
                          labelPlacement="start"
                          control={
                            <Checkbox
                              name={"userNameFlg"}
                              checked={userNameFlg}
                              onChange={(_e) => setUserNameFlg(!userNameFlg)}
                              style={{ width: "20px" }}
                            />
                          }
                          style={{ marginRight: "0px" }}
                        />
                      </Grid>
                      <Grid
                        size={8}
                        container
                        direction="column"
                        style={{
                          minWidth: "550px",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "20px",
                        }}
                      >
                        <Grid
                          style={{
                            display: "flex",
                            height: "45px",
                            padding: "5px",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography style={{ lineHeight: "35px" }}>
                            パスワード（現在のパスワード）：{" "}
                          </Typography>
                          <input
                            type="password"
                            style={{ width: "50%" }}
                            name={"nowPassword"}
                            placeholder={"現在のパスワード"}
                            disabled={passwordFlg}
                            onInput={(e: React.FormEvent<HTMLInputElement>) =>
                              setNowPassword(
                                (e.target as HTMLInputElement).value,
                              )
                            }
                          />
                        </Grid>
                        <FormControlLabel
                          label={"変更しない"}
                          labelPlacement="start"
                          control={
                            <Checkbox
                              name={"passwordFlg"}
                              checked={passwordFlg}
                              onChange={(_e) => setPasswordFlg(!passwordFlg)}
                              style={{ width: "20px" }}
                            />
                          }
                          style={{ marginRight: "0px" }}
                        />
                      </Grid>
                      <Grid
                        size={8}
                        container
                        direction="column"
                        style={{
                          minWidth: "550px",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "20px",
                        }}
                      >
                        <Grid
                          style={{
                            display: "flex",
                            height: "45px",
                            padding: "5px",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography style={{ lineHeight: "35px" }}>
                            新しいパスワード：{" "}
                          </Typography>
                          <input
                            type="password"
                            style={{ width: "50%" }}
                            name={"newPassword"}
                            placeholder={"新しいパスワード"}
                            disabled={passwordFlg}
                            onInput={(e: React.FormEvent<HTMLInputElement>) =>
                              setNewPassword(
                                (e.target as HTMLInputElement).value,
                              )
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        size={8}
                        container
                        direction="column"
                        style={{
                          minWidth: "550px",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "20px",
                        }}
                      >
                        <Grid
                          style={{
                            display: "flex",
                            height: "45px",
                            padding: "5px",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography style={{ lineHeight: "35px" }}>
                            新しいパスワード（再）：{" "}
                          </Typography>
                          <input
                            type="password"
                            style={{ width: "50%" }}
                            name={"newRePassword"}
                            placeholder={"新しいパスワード（再入力）"}
                            disabled={passwordFlg}
                            onInput={(e: React.FormEvent<HTMLInputElement>) =>
                              setNewRePassword(
                                (e.target as HTMLInputElement).value,
                              )
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        size={8}
                        container
                        direction="column"
                        style={{
                          minWidth: "550px",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "20px",
                        }}
                      >
                        <Grid
                          style={{
                            display: "flex",
                            height: "45px",
                            padding: "5px",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography style={{ lineHeight: "35px" }}>
                            権限：{" "}
                          </Typography>
                          <FormControlLabel
                            label={"管理者"}
                            labelPlacement="start"
                            control={
                              <input
                                type="radio"
                                style={{ width: "20%" }}
                                name={"management"}
                                value={"management"}
                                disabled={true}
                                checked={management === "management"}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) => setManagement(e.target.value)}
                              />
                            }
                            style={{ marginRight: "0px", width: "75px" }}
                          />
                          <FormControlLabel
                            label={"利用者"}
                            labelPlacement="start"
                            control={
                              <input
                                type="radio"
                                style={{ width: "20%" }}
                                name={".management"}
                                value={"user"}
                                checked={management === "user"}
                                disabled={true}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) => setManagement(e.target.value)}
                              />
                            }
                            style={{ marginRight: "0px", width: "75px" }}
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        size={8}
                        container
                        direction="column"
                        style={{
                          minWidth: "550px",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "20px",
                        }}
                      >
                        <Grid
                          style={{
                            display: "flex",
                            height: "45px",
                            padding: "5px",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography style={{ lineHeight: "35px" }}>
                            エリア設定：{" "}
                          </Typography>
                          <Grid style={{ display: "flex", flexWrap: "wrap" }}>
                            {contentList.map((content, i) => {
                              return (
                                <FormControlLabel
                                  label={content.area_name}
                                  labelPlacement="start"
                                  key={`areaName_${content.area_id}`}
                                  control={
                                    <Checkbox
                                      name={"coverageArea"}
                                      checked={coverageAreaList[i] ?? false}
                                      onChange={(_e) => onChangeCheckBox(i)}
                                      style={{ width: "20px" }}
                                    />
                                  }
                                  style={{ marginRight: "0px" }}
                                />
                              )
                            })}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Button
                      variant="contained"
                      sx={{ m: 1 }}
                      onClick={() => onClickUpdate()}
                    >
                      編集
                    </Button>
                  </>
                ) : (
                  <Grid container>
                    <Grid
                      size={8}
                      container
                      direction="column"
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                      }}
                    >
                      <Grid
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                        }}
                      >
                        <Typography style={{ lineHeight: "35px" }}>
                          ユーザー名： {user?.userName}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid
                      size={8}
                      container
                      direction="column"
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                      }}
                    >
                      <Grid
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                        }}
                      >
                        <Typography style={{ lineHeight: "35px" }}>
                          パスワード： ***********
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid
                      size={8}
                      container
                      direction="column"
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                      }}
                    >
                      <Grid
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                        }}
                      >
                        <Typography style={{ lineHeight: "35px" }}>
                          権限： {user?.management ? "管理者" : "利用者"}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid
                      size={8}
                      container
                      direction="column"
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                      }}
                    >
                      <Grid
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                        }}
                      >
                        <Typography
                          style={{
                            lineHeight: "35px",
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          エリア設定：{" "}
                          {areaList.length > 0 ? (
                            areaList.map((area) => (
                              <Grid
                                key={`areList_${area}`}
                                style={{ padding: "0 10px" }}
                              >
                                {area}
                              </Grid>
                            ))
                          ) : (
                            <Grid style={{ padding: "0 10px" }}>設定なし</Grid>
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        </>
      )}
      <Dialog open={showError} onClose={handleCloseError}>
        <DialogContent>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Typography variant="body1">対象箇所</Typography>
          <Typography variant="body1">{errorPart}</Typography>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default AccountSettingManagementComponent
