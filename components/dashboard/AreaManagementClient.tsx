"use client"

import CancelIcon from "@mui/icons-material/Cancel"
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import ErrorDialog from "@/components/dashboard/ErrorDialog"
import { useOrderContext } from "@/components/dashboard/OrderContext"
import {
  createContentsData,
  deleteContentsData,
  getContentsDataClient,
  mapContentToListItem,
  updateContentsData,
} from "@/src/services/contents"
import type { Content, ContentListItem } from "@/src/supabase/database.types"

interface AreaManagementClientProps {
  initialData: Content[] | null
  error: string | null
}

export default function AreaManagementClient({
  initialData,
  error: serverError,
}: AreaManagementClientProps): React.JSX.Element {
  const [contents_list, setContentsList] = useState<ContentListItem[]>(() => {
    if (initialData) {
      const mapped = initialData.map(mapContentToListItem)
      mapped.sort((a, b) => Number(a.areaId) - Number(b.areaId))
      return mapped
    }
    return []
  })
  const [displayFlg, setDisplayFlg] = useState<boolean>(!!initialData)
  const [createDisplay, setCreateDisplay] = useState<boolean>(false)
  const [areaName, setAreaName] = useState<string>("")
  const [areaNameList, setAreaNameList] = useState<string[]>(() => {
    if (initialData) {
      return initialData.map(() => "")
    }
    return []
  })
  const [error, setError] = useState<string>(serverError ?? "")
  const [errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(!!serverError)
  const [updateAreaDisplay, setUpdateAreaDisplay] = useState<boolean[]>(() => {
    if (initialData) {
      return initialData.map(() => false)
    }
    return []
  })
  const { setProgress } = useOrderContext()

  useEffect(() => {
    if (initialData) {
      return
    }
    async function getAreaInfoData(): Promise<void> {
      const contents = await getContentsDataClient()
      const mappedContents: ContentListItem[] =
        contents.map(mapContentToListItem)
      mappedContents.sort((a, b) => {
        return Number(a.areaId) - Number(b.areaId)
      })
      setContentsList(mappedContents)
      setDisplayFlg(true)
      const displayList: boolean[] = []
      const areaList: string[] = []
      mappedContents.forEach(() => {
        displayList.push(false)
        areaList.push("")
      })
      setUpdateAreaDisplay(displayList)
      setAreaNameList(areaList)
    }
    getAreaInfoData()
  }, [initialData])

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
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
    } finally {
      setProgress(false)
    }
  }

  const onClickUpdate = async (index: number): Promise<void> => {
    console.log(contents_list)
    if (
      contents_list.some(
        (content, i) => i !== index && content.areaName === areaNameList[index],
      )
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
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
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
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
    } finally {
      setProgress(false)
    }
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        エリア管理
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
              {createDisplay ? "閉じる" : "エリア追加"}
            </Button>
          </Box>

          {createDisplay && (
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                新規エリア追加
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "flex-end" },
                  gap: 2,
                }}
              >
                <TextField
                  label="エリア名"
                  placeholder="例：関東"
                  value={areaName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAreaName(e.target.value)
                  }
                  sx={{ flex: 1, maxWidth: { sm: 300 } }}
                />
                <Button
                  disabled={areaName === ""}
                  variant="contained"
                  onClick={onClickCreate}
                >
                  エリア追加
                </Button>
              </Box>
            </Paper>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {contents_list.map((content, index) => (
              <Paper
                elevation={0}
                key={`key${content.areaId}`}
                sx={{
                  p: { xs: 2, sm: 3 },
                  position: "relative",
                  "&:hover": {
                    borderColor: "primary.main",
                    transition: "border-color 0.2s",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 2,
                    pr: 5,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      ID:{" "}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: "text.primary", fontWeight: 500 }}
                      >
                        {content.areaId}
                      </Typography>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      エリア名:{" "}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: "text.primary", fontWeight: 500 }}
                      >
                        {content.areaName}
                      </Typography>
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => updateArea(index)}
                  >
                    {updateAreaDisplay[index] ? "閉じる" : "編集"}
                  </Button>
                </Box>

                {updateAreaDisplay[index] && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "flex-end" },
                      gap: 2,
                      mt: 2,
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <TextField
                      label="新しいエリア名"
                      placeholder="例：関東"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAreaNames(e.target.value, index)
                      }
                      sx={{ flex: 1, maxWidth: { sm: 300 } }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => onClickUpdate(index)}
                    >
                      更新
                    </Button>
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
            ))}
          </Box>
        </>
      )}
      <ErrorDialog
        error={error}
        errorPart={errorPart}
        open={showError}
        onClose={handleCloseError}
      />
    </>
  )
}
