import CancelIcon from "@mui/icons-material/Cancel"
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { ContentListItem } from "../../src/supabase/database.types"
import { getContentsDataClient } from "../../utilities/getContentDataClient"
import {
  createContentsData,
  deleteContentsData,
  updateContentsData,
} from "../../utilities/setContentData"
import { useOrderContext } from "./OrderContext"

function AreaManagementComponent(): React.JSX.Element {
  const [contents_list, setContentsList] = useState<ContentListItem[]>([])
  const [displayFlg, setDisplayFlg] = useState<boolean>(false)
  const [createDisplay, setCreateDisplay] = useState<boolean>(false)
  const [areaName, setAreaName] = useState<string>("")
  const [areaNameList, setAreaNameList] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(false)
  const [updateAreaDisplay, setUpdateAreaDisplay] = useState<boolean[]>([])
  const { uid, isAdmin, setProgress } = useOrderContext()

  const router = useRouter()

  useEffect(() => {
    if (
      sessionStorage.getItem("uid") &&
      sessionStorage.getItem("management") !== "true"
    ) {
      router.push("/dashboard")
    } else if (sessionStorage.getItem("uid") !== "true" && (!uid || !isAdmin)) {
      router.push("/dashboard/Login")
    }
    async function getAreaInfoData(): Promise<void> {
      const contents = await getContentsDataClient("contents")
      if (!contents) {
        return
      }
      const mappedContents: ContentListItem[] = contents.map((c) => ({
        areaId: c.area_id,
        areaName: c.area_name,
        orderId: c.order_id,
        pixelSizeId: c.pixel_size_id,
        delete: c.deleted,
      }))
      mappedContents.sort((a, b) => {
        return Number(a.areaId) - Number(b.areaId)
      })
      setContentsList(mappedContents)
      setDisplayFlg(true)
      const displayList: boolean[] = []
      const areaList: string[] = []
      mappedContents.forEach((_) => {
        displayList.push(false)
        areaList.push("")
      })
      setUpdateAreaDisplay(displayList)
      setAreaNameList(areaList)
    }
    getAreaInfoData()
  }, [isAdmin, router.push, uid])

  const updateArea = (index: number): void => {
    const list = updateAreaDisplay.map((display, i) =>
      i === index ? !display : display,
    )
    setUpdateAreaDisplay(list)
  }

  const onClickCreate = async (): Promise<void> => {
    if (contents_list.some((content) => content.areaName === areaName)) {
      setError("エリア名が他のエリアと重複しています")
      setErrorPart("エリア追加時のエリア名")
      setShowError(true)
      return
    }
    try {
      setProgress(true)
      await createContentsData(areaName)
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const onClickUpdate = async (index: number): Promise<void> => {
    console.log(contents_list)
    if (
      contents_list.some((content) => content.areaName === areaNameList[index])
    ) {
      setError("エリア名が他のエリアと重複しています")
      setErrorPart("エリア編集時のエリア名")
      setShowError(true)
      return
    }
    try {
      setProgress(true)
      await updateContentsData(index, contents_list, areaNameList[index])
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const setAreaNames = (newAreaName: string, index: number): void => {
    const areaList = areaNameList.map((name, i) =>
      i === index ? newAreaName : name,
    )
    setAreaNameList(areaList)
  }

  const handleCloseError = (): void => {
    setShowError(false)
  }

  const onClickRemove = async (index: number): Promise<void> => {
    try {
      setProgress(true)
      await deleteContentsData(index, contents_list)
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  return (
    <>
      <Box>
        <Typography>エリア管理</Typography>
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
                  エリア追加
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
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Grid
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                          width: "50%",
                        }}
                      >
                        <Typography style={{ lineHeight: "35px" }}>
                          エリア名：{" "}
                        </Typography>
                        <input
                          type="text"
                          style={{ width: "40%" }}
                          name={"areaName"}
                          placeholder={"例：関東"}
                          onInput={(e: React.FormEvent<HTMLInputElement>) =>
                            setAreaName((e.target as HTMLInputElement).value)
                          }
                        />
                      </Grid>
                      <Button
                        disabled={areaName === ""}
                        variant="contained"
                        sx={{ m: 1 }}
                        onClick={onClickCreate}
                      >
                        エリア追加
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Grid>
            <Box style={{ display: "flex", flexDirection: "column" }}>
              {contents_list.map((content, index) => {
                return (
                  <Paper
                    sx={{ height: 1 / 5, m: 1 }}
                    key={`key${content.areaId}`}
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
                          <Typography
                            style={{ lineHeight: "35px", marginRight: "20px" }}
                          >
                            エリアID： {content.areaId}
                          </Typography>
                          <Typography style={{ lineHeight: "35px" }}>
                            エリア名： {content.areaName}
                          </Typography>
                        </Grid>
                      </Grid>
                      {updateAreaDisplay[index] ? (
                        <Button
                          variant="contained"
                          sx={{ m: 1 }}
                          onClick={() => updateArea(index)}
                        >
                          閉じる
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          sx={{ m: 1 }}
                          onClick={() => updateArea(index)}
                        >
                          編集
                        </Button>
                      )}
                      {updateAreaDisplay[index] && (
                        <>
                          <input
                            type="text"
                            style={{
                              width: "20%",
                              height: "45px",
                              margin: "20px",
                            }}
                            name={`areaNameList[${index}]`}
                            placeholder={"例：関東"}
                            onInput={(e: React.FormEvent<HTMLInputElement>) =>
                              setAreaNames(
                                (e.target as HTMLInputElement).value,
                                index,
                              )
                            }
                          />
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
                      onClick={(_e) => onClickRemove(index)}
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
      <Dialog open={showError} onClose={handleCloseError}>
        <DialogContent>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Typography variant="body1">対象箇所</Typography>
          <Typography variant="body1">{errorPart}</Typography>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AreaManagementComponent
