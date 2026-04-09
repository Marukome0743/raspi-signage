"use client"

import CancelIcon from "@mui/icons-material/Cancel"
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import ErrorDialog from "@/components/dashboard/ErrorDialog"
import { useOrderContext } from "@/components/dashboard/OrderContext"
import {
  createAccountData,
  deleteAccountData,
  updateAccountData,
} from "@/src/services/accounts"
import {
  getContentsDataClient,
  mapContentToListItem,
} from "@/src/services/contents"
import { getUserAccountList } from "@/src/services/users"
import type {
  ContentListItem,
  UserAccount,
} from "@/src/supabase/database.types"

interface UserEditState {
  userName: string
  userNameFlg: boolean
  management: string
  coverageArea: boolean[]
  delete: boolean
  uid?: string
}

interface UserAccountManagementClientProps {
  initialUserList: UserAccount[] | null
  initialContentList: ContentListItem[] | null
  error: string | null
}

export default function UserAccountManagementClient({
  initialUserList,
  initialContentList,
  error: serverError,
}: UserAccountManagementClientProps): React.JSX.Element {
  const [userList, setUserList] = useState<UserAccount[]>(initialUserList ?? [])
  const [contentList, setContentList] = useState<ContentListItem[]>(
    initialContentList ?? [],
  )
  const [displayFlg, setDisplayFlg] = useState<boolean>(
    !!(initialUserList && initialContentList),
  )
  const [createDisplay, setCreateDisplay] = useState<boolean>(false)

  const [email, setEmail] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [management, setManagement] = useState<string>("user")
  const [area, setArea] = useState<boolean[]>([])

  const [users, setUsers] = useState<UserEditState[]>(() => {
    if (initialUserList && initialContentList) {
      return initialUserList.map((item) => {
        const list = initialContentList.map((content) =>
          item.coverageArea?.includes(content.areaId),
        )
        return {
          userName: item.userName,
          userNameFlg: true,
          management: item.management ? "management" : "user",
          coverageArea: list,
          delete: item.delete,
        }
      })
    }
    return []
  })

  const [error, setError] = useState<string>(serverError ?? "")
  const [_errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(!!serverError)

  const [detailDisplay, setDetailDisplay] = useState<boolean[]>(() =>
    (initialUserList ?? []).map(() => false),
  )
  const [settingDisplay, setSettingDisplay] = useState<boolean[]>(() =>
    (initialUserList ?? []).map(() => false),
  )

  const { setProgress } = useOrderContext()

  useEffect(() => {
    if (initialUserList && initialContentList) {
      return
    }
    async function getInfoData(): Promise<void> {
      const getUserList = await getUserAccountList()
      const contents = await getContentsDataClient()
      const mappedContents: ContentListItem[] =
        contents.map(mapContentToListItem)
      setUserList(getUserList ?? [])
      setContentList(mappedContents)
      setDisplayFlg(true)
      const displayList: boolean[] = []
      const areaList: boolean[] = []
      setUsers(
        (getUserList ?? []).map((item) => {
          const list = mappedContents.map((content) =>
            item.coverageArea?.includes(content.areaId),
          )
          return {
            userName: item.userName,
            userNameFlg: true,
            management: item.management ? "management" : "user",
            coverageArea: list,
            delete: item.delete,
          }
        }),
      )
      mappedContents.forEach(() => {
        displayList.push(false)
        areaList.push(false)
      })
      setDetailDisplay(displayList)
      setSettingDisplay(displayList)
      setArea(areaList)
    }
    getInfoData()
  }, [initialUserList, initialContentList])

  useEffect(() => {
    const areaList = contentList.map(() => false)
    setEmail("")
    setUserName("")
    setPassword("")
    setArea(areaList)
  }, [contentList])

  const handleDetail = (index: number): void => {
    const list = detailDisplay.map((display, i) =>
      i === index ? !display : display,
    )
    setDetailDisplay(list)
  }
  const handleSetting = (index: number): void => {
    const list = settingDisplay.map((display, i) =>
      i === index ? !display : display,
    )
    setUsers(
      users.map((item, i) => {
        if (index !== i) {
          return item
        }
        const areaList = contentList.map((content) =>
          userList[index].coverageArea?.includes(content.areaId),
        )
        return {
          ...userList[i],
          userNameFlg: true,
          coverageArea: areaList,
          management: userList[index].management ? "management" : "user",
        }
      }),
    )
    setSettingDisplay(list)
  }

  const onClickCreate = async (): Promise<void> => {
    try {
      setProgress(true)
      const list = area.reduce<string[]>((acc, item, index) => {
        if (item) {
          acc.push(contentList[index].areaId)
        }
        return acc
      }, [])
      const user = {
        email: email,
        userName: userName,
        management: management === "management",
        coverageArea: list,
        passFlg: true,
        delete: false,
      }
      await createAccountData(email, password, user)
      setCreateDisplay(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
    } finally {
      setProgress(false)
    }
  }

  const onClickUpdate = async (index: number): Promise<void> => {
    try {
      setProgress(true)
      const list = users[index].coverageArea.reduce<string[]>(
        (acc, item, i) => {
          if (item) {
            acc.push(contentList[i].areaId)
          }
          return acc
        },
        [],
      )
      const user = {
        userName: users[index].userNameFlg
          ? userList[index].userName
          : users[index].userName,
        management: users[index].management === "management",
        coverageArea: list,
      }

      await updateAccountData(users[index].uid ?? "", user, "", "", "")
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

  const onClickRemove = async (index: number): Promise<void> => {
    try {
      setProgress(true)
      await deleteAccountData(userList[index].uid)
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
    } finally {
      setProgress(false)
    }
  }

  // Toggle admin/user role
  const handleOptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setManagement(event.target.value)
  }

  const handleSettingOptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ): void => {
    setUsers(
      users.map((item, i) => {
        return {
          ...item,
          management: index === i ? event.target.value : item.management,
        }
      }),
    )
  }

  // Area settings (create)
  const onChangeCheckBox = (index: number): void => {
    const list = area.map((item, i) => (index === i ? !item : item))
    setArea(list)
  }

  // Area settings (edit)
  const onSettingChangeCheckBox = (index: number, i: number): void => {
    setUsers(
      users.map((item, j) => {
        return {
          ...item,
          coverageArea:
            index === j
              ? item.coverageArea.map((body, k) => (i === k ? !body : body))
              : item.coverageArea,
        }
      }),
    )
  }

  const onSettingChangeUserName = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ): void => {
    setUsers(
      users.map((item, i) => {
        if (index !== i) {
          return item
        }
        return {
          ...users[i],
          userName: e.target.value,
        }
      }),
    )
  }

  const onSettingUserNameCheckBox = (index: number): void => {
    setUsers(
      users.map((item, i) => {
        if (index !== i) {
          return item
        }
        return {
          ...users[i],
          userNameFlg: !users[i].userNameFlg,
        }
      }),
    )
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        アカウント一覧管理
      </Typography>
      {!displayFlg ? (
        <Typography sx={{ color: "text.secondary" }}>データ取得中</Typography>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Button
              variant={createDisplay ? "outlined" : "contained"}
              onClick={() => setCreateDisplay(!createDisplay)}
            >
              {createDisplay ? "閉じる" : "アカウント追加"}
            </Button>
          </Box>

          {/* Create form */}
          {createDisplay && (
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                新規アカウント追加
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="メールアドレス（ログイン用）"
                    placeholder="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="パスワード"
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="ユーザー名"
                    placeholder="名前"
                    value={userName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUserName(e.target.value)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5, color: "text.secondary" }}
                  >
                    権限
                  </Typography>
                  <RadioGroup
                    row
                    value={management}
                    onChange={handleOptionChange}
                  >
                    <FormControlLabel
                      value="management"
                      control={<Radio size="small" />}
                      label="管理者"
                    />
                    <FormControlLabel
                      value="user"
                      control={<Radio size="small" />}
                      label="利用者"
                    />
                  </RadioGroup>
                </Grid>
                <Grid size={12}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5, color: "text.secondary" }}
                  >
                    エリア設定
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {contentList.map((content, index) => (
                      <FormControlLabel
                        key={`area_check${content.areaId}`}
                        label={content.areaName}
                        control={
                          <Checkbox
                            name={`area[${index}]`}
                            checked={area[index]}
                            onChange={() => onChangeCheckBox(index)}
                            size="small"
                          />
                        }
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid size={12}>
                  <Button
                    disabled={
                      email === "" || userName === "" || password === ""
                    }
                    variant="contained"
                    onClick={onClickCreate}
                  >
                    追加
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* User list */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {userList.map((user, index) => {
              const areas: string[] = user.coverageArea
                .map((areaItem: string) => {
                  const list = contentList.filter(
                    (content) => content.areaId === areaItem,
                  )
                  return list[0]?.areaName
                })
                .filter((item): item is string => !!item)
              return (
                <Paper
                  elevation={0}
                  key={`key${user.uid}`}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    position: "relative",
                    "&:hover": {
                      borderColor: "primary.main",
                      transition: "border-color 0.2s",
                    },
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: 2,
                      pr: 5,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500, flex: 1 }}
                    >
                      {user.userName}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {!settingDisplay[index] && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDetail(index)}
                        >
                          {detailDisplay[index] ? "閉じる" : "詳細"}
                        </Button>
                      )}
                      {!detailDisplay[index] && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleSetting(index)}
                        >
                          {settingDisplay[index] ? "閉じる" : "編集"}
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {/* Detail view */}
                  {detailDisplay[index] && (
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        権限:{" "}
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ color: "text.primary" }}
                        >
                          {user.management ? "管理者" : "利用者"}
                        </Typography>
                      </Typography>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mb: 0.5 }}
                        >
                          エリア設定:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {areas.length > 0 ? (
                            areas.map((areaItem) => (
                              <Chip
                                key={`areaList_${areaItem}`}
                                label={areaItem}
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

                  {/* Edit view */}
                  {settingDisplay[index] && (
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TextField
                              fullWidth
                              label="ユーザー名"
                              placeholder={user.userName}
                              disabled={users[index]?.userNameFlg}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) => onSettingChangeUserName(e, index)}
                            />
                            <FormControlLabel
                              label="変更しない"
                              control={
                                <Checkbox
                                  checked={users[index]?.userNameFlg}
                                  onChange={() =>
                                    onSettingUserNameCheckBox(index)
                                  }
                                  size="small"
                                />
                              }
                              sx={{ whiteSpace: "nowrap" }}
                            />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography
                            variant="body2"
                            sx={{ mb: 0.5, color: "text.secondary" }}
                          >
                            権限
                          </Typography>
                          <RadioGroup
                            row
                            value={users[index]?.management ?? "user"}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleSettingOptionChange(e, index)}
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
                        <Grid size={12}>
                          <Typography
                            variant="body2"
                            sx={{ mb: 0.5, color: "text.secondary" }}
                          >
                            エリア設定
                          </Typography>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                          >
                            {contentList.map((content, i) => (
                              <FormControlLabel
                                key={`areaName_${content.areaId}`}
                                label={content.areaName}
                                control={
                                  <Checkbox
                                    name={`users[${index}].coverageArea`}
                                    checked={users[index]?.coverageArea[i]}
                                    onChange={() =>
                                      onSettingChangeCheckBox(index, i)
                                    }
                                    size="small"
                                  />
                                }
                              />
                            ))}
                          </Box>
                        </Grid>
                        <Grid size={12}>
                          <Button
                            variant="contained"
                            onClick={() => onClickUpdate(index)}
                          >
                            更新
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <IconButton
                    aria-label="delete image"
                    onClick={() => onClickRemove(index)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      color: "text.secondary",
                      "&:hover": {
                        color: "error.main",
                        bgcolor: "rgba(239, 68, 68, 0.08)",
                      },
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Paper>
              )
            })}
          </Box>
        </>
      )}
      <ErrorDialog
        error={error}
        errorPart="エリア追加時のエリア名"
        open={showError}
        onClose={handleCloseError}
      />
    </>
  )
}
