import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type {
  ContentItem,
  PixelSizeInfo,
} from "../../src/supabase/database.types"
import {
  getContentDataClient,
  getContentPixelSize,
  getContentPixelSizeId,
} from "../../utilities/getContentDataClient"
import {
  createDisplayContent,
  resetPixelSize,
  updateDisplayContent,
} from "../../utilities/setContentData"
import { useOrderContext } from "./OrderContext"

interface DisplayContentItem extends ContentItem {
  delete?: boolean
}

function ViewPositionComponent(): React.JSX.Element {
  const [contents_list, setContentsList] = useState<DisplayContentItem | null>(
    null,
  )
  const [pixelSize, setPixelSize] = useState<PixelSizeInfo | null>(null)
  const [pixelSizeId, setPixelSizeId] = useState<string>("")
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [marginTop, setMarginTop] = useState<number>(0)
  const [marginLeft, setMarginLeft] = useState<number>(0)
  const [displayFlg, setDisplayFlg] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(false)
  const { uid, orderId, setProgress } = useOrderContext()

  const router = useRouter()

  useEffect(() => {
    if (!sessionStorage.getItem("uid") && !uid) {
      router.push("/dashboard/Login")
    }
  }, [router.push, uid])

  useEffect(() => {
    async function featchData(): Promise<void> {
      if (orderId == null) {
        return
      }
      const id = await getContentPixelSizeId(orderId)
      if (id !== undefined && id !== "") {
        setPixelSizeId(id)
        const pixel = await getContentPixelSize(id)
        if (pixel) {
          setPixelSize(pixel)
          setHeight(pixel.height)
          setWidth(pixel.width)
          setMarginTop(pixel.marginTop)
          setMarginLeft(pixel.marginLeft)
        }
      }
    }
    featchData()
  }, [orderId])

  useEffect(() => {
    async function getContentData(): Promise<void> {
      if (orderId == null) {
        return
      }
      const obj = await getContentDataClient(`/order/${orderId}`)
      if (!obj) {
        return
      }
      const display_filtered = obj.set1
        .filter((obj: DisplayContentItem) => !obj.delete)
        .filter((obj: DisplayContentItem) => Object.keys(obj).length)
      const hidden_filtered = obj.hidden
        .filter((obj: DisplayContentItem) => !obj.delete)
        .filter((obj: DisplayContentItem) => Object.keys(obj).length)
      if (display_filtered.length !== 0) {
        setContentsList(display_filtered[0])
      } else if (hidden_filtered.length !== 0) {
        setContentsList(hidden_filtered[0])
      }
    }
    getContentData()
  }, [orderId])

  const onClickCreate = async (w: number, h: number): Promise<void> => {
    if (orderId == null) {
      return
    }
    try {
      setProgress(true)
      const pixel = {
        pixelWidth: w,
        pixelHeight: h,
      }
      await createDisplayContent(orderId, pixel)
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const onClickUpdate = async (): Promise<void> => {
    if (
      pixelSize &&
      (height + marginTop > pixelSize.pixelHeight ||
        width + marginLeft > pixelSize.pixelWidth)
    ) {
      setError(
        "設定していサイズ（画像の縦と画像上部余白、もしくは画像の横と画像左部余白）が画面サイズ（CSSピクセルサイズ）を超えてます",
      )
      setErrorPart("高さと幅")
      setShowError(true)
      return
    }
    try {
      setProgress(true)
      await updateDisplayContent(
        pixelSizeId,
        height,
        width,
        marginTop,
        marginLeft,
      )
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const onClickReset = async (): Promise<void> => {
    try {
      setProgress(true)
      await resetPixelSize(pixelSizeId)
      alert(
        "ラズパイサイネージを起動することでサイネージ画面枠の値を再取得出来ます",
      )
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const handleCloseError = (): void => {
    setShowError(false)
  }

  return (
    <>
      <Box>
        <Typography>表示画面調整</Typography>
        {pixelSize == null || (pixelSize && !pixelSize.displayContentFlg) ? (
          <>
            <Typography>サイネージ表示画面枠設定</Typography>
            <Button
              variant="contained"
              sx={{ m: 1 }}
              disabled={true}
              onClick={() => onClickCreate(0, 0)}
            >
              小
            </Button>
            <Button
              variant="contained"
              sx={{ m: 1 }}
              disabled={true}
              onClick={() => onClickCreate(0, 0)}
            >
              中
            </Button>
            <Button
              variant="contained"
              sx={{ m: 1 }}
              disabled={orderId == null}
              onClick={() => onClickCreate(1746, 844)}
            >
              大
            </Button>
          </>
        ) : (
          <>
            <Button variant="contained" sx={{ m: 1 }} onClick={onClickUpdate}>
              更新
            </Button>
            <Button variant="contained" sx={{ m: 1 }} onClick={onClickReset}>
              サイネージ画面枠リセット
            </Button>
            <Box style={{ display: "flex", flexDirection: "column" }}>
              <Paper
                sx={{ height: 1 / 5, m: 1 }}
                key={"key"}
                style={{ position: "relative" }}
              >
                <Grid container>
                  <Grid
                    style={{
                      display: "flex",
                      minWidth: "730px",
                      height: "45px",
                      padding: "5px",
                      justifyContent: "space-around",
                    }}
                  >
                    <Typography style={{ width: "33%", lineHeight: "35px" }}>
                      サイネージ画面枠(高さ)： {pixelSize.pixelHeight}px
                    </Typography>
                    <Typography style={{ width: "33%", lineHeight: "35px" }}>
                      サイネージ画面枠(幅)： {pixelSize.pixelWidth}px
                    </Typography>
                  </Grid>
                  <Grid
                    size={8}
                    container
                    direction="column"
                    style={{ padding: "20px", paddingTop: "10px" }}
                  >
                    <Grid
                      style={{
                        display: "flex",
                        minWidth: "550px",
                        height: "45px",
                        padding: "5px",
                      }}
                    >
                      <Typography style={{ width: "33%", lineHeight: "35px" }}>
                        サイネージ画像(高さ)：{" "}
                      </Typography>
                      <input
                        type="number"
                        style={{ width: "20%" }}
                        name={"height"}
                        placeholder={String(pixelSize.height)}
                        onInput={(e: React.FormEvent<HTMLInputElement>) =>
                          setHeight(
                            Number((e.target as HTMLInputElement).value),
                          )
                        }
                      />
                    </Grid>
                    <Grid
                      style={{
                        display: "flex",
                        minWidth: "550px",
                        height: "45px",
                        padding: "5px",
                      }}
                    >
                      <Typography style={{ width: "33%", lineHeight: "35px" }}>
                        サイネージ画像(幅)：{" "}
                      </Typography>
                      <input
                        type="number"
                        style={{ width: "20%" }}
                        name={"width"}
                        placeholder={String(pixelSize.width)}
                        onInput={(e: React.FormEvent<HTMLInputElement>) =>
                          setWidth(Number((e.target as HTMLInputElement).value))
                        }
                      />
                    </Grid>
                    <Grid
                      style={{
                        display: "flex",
                        minWidth: "550px",
                        height: "45px",
                        padding: "5px",
                      }}
                    >
                      <Typography style={{ width: "33%", lineHeight: "35px" }}>
                        サイネージ上部余白：{" "}
                      </Typography>
                      <input
                        type="number"
                        style={{ width: "20%" }}
                        name={"marginTop"}
                        placeholder={String(pixelSize.marginTop)}
                        onInput={(e: React.FormEvent<HTMLInputElement>) =>
                          setMarginTop(
                            Number((e.target as HTMLInputElement).value),
                          )
                        }
                      />
                    </Grid>
                    <Grid
                      style={{
                        display: "flex",
                        minWidth: "550px",
                        height: "45px",
                        padding: "5px",
                      }}
                    >
                      <Typography style={{ width: "33%", lineHeight: "35px" }}>
                        サイネージ左部余白：{" "}
                      </Typography>
                      <input
                        type="number"
                        style={{ width: "20%" }}
                        name={"marginLeft"}
                        placeholder={String(pixelSize.marginLeft)}
                        onInput={(e: React.FormEvent<HTMLInputElement>) =>
                          setMarginLeft(
                            Number((e.target as HTMLInputElement).value),
                          )
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
              <Button
                variant="contained"
                sx={{ m: 1 }}
                onClick={() => setDisplayFlg(!displayFlg)}
              >
                下部へ反映（更新は行われてません）
              </Button>
              <Box>
                <Typography>
                  表示画面調整イメージ（約10分の1で表示しています）
                </Typography>
                {displayFlg && (
                  <Paper style={{ position: "relative", height: "240px" }}>
                    <Grid
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <Grid
                        style={{
                          backgroundColor: "#000",
                          height: pixelSize.pixelHeight / 10,
                          width: pixelSize.pixelWidth / 10,
                        }}
                      >
                        {contents_list ? (
                          contents_list.type === "image" ? (
                            // biome-ignore lint/performance/noImgElement: external Supabase Storage URL
                            <img
                              src={contents_list.path}
                              style={{
                                height: height / 10,
                                width: width / 10,
                                marginTop: marginTop / 10,
                                marginLeft: marginLeft / 10,
                                objectFit: "contain",
                              }}
                              alt="コンテンツプレビュー"
                            />
                          ) : (
                            <video
                              src={contents_list.path}
                              style={{
                                height: height / 10,
                                width: width / 10,
                                marginTop: marginTop / 10,
                                marginLeft: marginLeft / 10,
                                objectFit: "contain",
                              }}
                              muted
                              autoPlay
                              loop
                              playsInline
                            />
                          )
                        ) : (
                          <Grid style={{ backgroundColor: "#fff" }}>
                            イメージ画像
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Box>
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

export default ViewPositionComponent
