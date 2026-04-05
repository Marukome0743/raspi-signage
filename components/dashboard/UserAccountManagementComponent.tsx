"use client"

import CancelIcon from "@mui/icons-material/Cancel"
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
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
import ErrorDialog from "./ErrorDialog"
import { useOrderContext } from "./OrderContext"

interface UserEditState {
  userName: string
  userNameFlg: boolean
  management: string
  coverageArea: boolean[]
  delete: boolean
  uid?: string
}

function UserAccountManagementComponent(): React.JSX.Element {
  const [userList, setUserList] = useState<UserAccount[]>([])
  const [contentList, setContentList] = useState<ContentListItem[]>([])
  const [displayFlg, setDisplayFlg] = useState<boolean>(false)
  const [createDisplay, setCreateDisplay] = useState<boolean>(false)

  const [email, setEmail] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [management, setManagement] = useState<string>("user")
  const [area, setArea] = useState<boolean[]>([])

  const [users, setUsers] = useState<UserEditState[]>([])

  const [error, setError] = useState<string>("")
  const [errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(false)

  const [detailDisplay, setDetailDisplay] = useState<boolean[]>([])
  const [settingDisplay, setSettingDisplay] = useState<boolean[]>([])

  const { uid, setCoverageArea, setProgress } = useOrderContext()

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    const areaList = contentList.map(() => false)
    setEmail("")
    setUserName("")
    setPassword("")
    setArea(areaList)
  }, [contentList.map])

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
      if (users[index].uid === uid) {
        setCoverageArea(list)
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
      <Box>
        <Typography>アカウント一覧管理</Typography>
        {!displayFlg ? (
          <Typography>データ取得中</Typography>
        ) : (
          <>
            <Grid>
              {createDisplay ? (
                <Button
                  variant="contained"
                  sx={{ m: 1 }}
                  onClick={() => setCreateDisplay(false)}
                >
                  閉じる
                </Button>
              ) : (
                <Button
                  variant="contained"
                  sx={{ m: 1 }}
                  onClick={() => setCreateDisplay(true)}
                >
                  アカウント追加
                </Button>
              )}
              {createDisplay && (
                <Paper
                  sx={{ height: 1 / 5, m: 1 }}
                  key={"key"}
                  style={{ position: "relative" }}
                >
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
                          メールアドレス（ログイン用）：{" "}
                        </Typography>
                        <input
                          type="text"
                          style={{ width: "50%" }}
                          name={"email"}
                          placeholder={"email"}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEmail(e.target.value)
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
                          パスワード：{" "}
                        </Typography>
                        <input
                          type="password"
                          style={{ width: "50%" }}
                          name={"password"}
                          placeholder={"パスワード"}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
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
                          ユーザー名：{" "}
                        </Typography>
                        <input
                          type="text"
                          style={{ width: "50%" }}
                          name={"userName"}
                          placeholder={"名前"}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setUserName(e.target.value)
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
                              checked={management === "management"}
                              onChange={handleOptionChange}
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
                              name={"management"}
                              value={"user"}
                              checked={management === "user"}
                              onChange={handleOptionChange}
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
                          {contentList.map((content, index) => {
                            return (
                              <FormControlLabel
                                label={content.areaName}
                                labelPlacement="start"
                                key={`area_check${content.areaId}`}
                                control={
                                  <Checkbox
                                    name={`area[${index}]`}
                                    checked={area[index]}
                                    onChange={() => onChangeCheckBox(index)}
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
                    disabled={
                      email === "" || userName === "" || password === ""
                    }
                    variant="contained"
                    sx={{ m: 1 }}
                    onClick={onClickCreate}
                  >
                    追加
                  </Button>
                </Paper>
              )}
            </Grid>
            <Box style={{ display: "flex", flexDirection: "column" }}>
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
                    sx={{ height: 1 / 5, m: 1 }}
                    key={`key${user.uid}`}
                    style={{ position: "relative" }}
                  >
                    <Grid container>
                      <Grid
                        size={5}
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
                            ユーザー名： {user.userName}
                          </Typography>
                        </Grid>
                      </Grid>
                      {!settingDisplay[index] &&
                        (detailDisplay[index] ? (
                          <Button
                            variant="contained"
                            sx={{ m: 1 }}
                            onClick={() => handleDetail(index)}
                          >
                            閉じる
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            sx={{ m: 1 }}
                            onClick={() => handleDetail(index)}
                          >
                            詳細
                          </Button>
                        ))}

                      {detailDisplay[index] && (
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
                                権限： {user.management ? "管理者" : "利用者"}
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
                                {areas.length > 0 ? (
                                  areas.map((areaItem) => (
                                    <Grid
                                      key={`areaList_${areaItem}`}
                                      style={{ padding: "0 10px" }}
                                    >
                                      {areaItem}
                                    </Grid>
                                  ))
                                ) : (
                                  <Grid
                                    style={{
                                      lineHeight: "35px",
                                      padding: "0 10px",
                                    }}
                                  >
                                    設定なし
                                  </Grid>
                                )}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      )}
                      {!detailDisplay[index] &&
                        (settingDisplay[index] ? (
                          <Button
                            variant="contained"
                            sx={{ m: 1 }}
                            onClick={() => handleSetting(index)}
                          >
                            閉じる
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            sx={{ m: 1 }}
                            onClick={() => handleSetting(index)}
                          >
                            編集
                          </Button>
                        ))}
                      {settingDisplay[index] && (
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
                                  name={`users[${index}].userName`}
                                  placeholder={user.userName}
                                  disabled={users[index]?.userNameFlg}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) => onSettingChangeUserName(e, index)}
                                />
                              </Grid>
                              <FormControlLabel
                                label={"変更しない"}
                                labelPlacement="start"
                                control={
                                  <Checkbox
                                    name={`users[${index}].userNameFlg`}
                                    checked={users[index]?.userNameFlg}
                                    onChange={() =>
                                      onSettingUserNameCheckBox(index)
                                    }
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
                                  権限：{" "}
                                </Typography>
                                <FormControlLabel
                                  label={"管理者"}
                                  labelPlacement="start"
                                  control={
                                    <input
                                      type="radio"
                                      style={{ width: "20%" }}
                                      name={`users[${index}].management`}
                                      value={"management"}
                                      disabled={true}
                                      checked={
                                        users[index] &&
                                        users[index].management === "management"
                                      }
                                      onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                      ) => handleSettingOptionChange(e, index)}
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
                                      name={`users[${index}].management`}
                                      value={"user"}
                                      disabled={true}
                                      checked={
                                        users[index] &&
                                        users[index].management === "user"
                                      }
                                      onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                      ) => handleSettingOptionChange(e, index)}
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
                                <Grid
                                  style={{ display: "flex", flexWrap: "wrap" }}
                                >
                                  {contentList.map((content, i) => {
                                    return (
                                      <FormControlLabel
                                        label={content.areaName}
                                        labelPlacement="start"
                                        key={`areaName_${content.areaId}`}
                                        control={
                                          <Checkbox
                                            name={
                                              "users[" +
                                              index +
                                              "].coverageArea"
                                            }
                                            checked={
                                              users[index]?.coverageArea[i]
                                            }
                                            onChange={() =>
                                              onSettingChangeCheckBox(index, i)
                                            }
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
                            onClick={() => onClickUpdate(index)}
                          >
                            編集
                          </Button>
                        </>
                      )}
                    </Grid>
                    <IconButton
                      aria-label="delete image"
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        color: "#aaa",
                      }}
                      onClick={() => onClickRemove(index)}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Paper>
                )
              })}
            </Box>
          </>
        )}
      </Box>
      <ErrorDialog
        error={error}
        errorPart="エリア追加時のエリア名"
        open={showError}
        onClose={handleCloseError}
      />
    </>
  )
}

export default UserAccountManagementComponent
