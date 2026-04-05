"use client"

import type { SxProps, Theme } from "@mui/material"
import { Box, Button, Grid, Paper, Typography } from "@mui/material"
import Image from "next/image"
import { useEffect, useState } from "react"
import ErrorDialog from "@/components/dashboard/ErrorDialog"
import { useOrderContext } from "@/components/dashboard/OrderContext"
import {
  filterActiveDisplayItems,
  getContentPixelSize,
  getContentPixelSizeId,
  getOrderById,
} from "@/src/services/contents"
import {
  createDisplayContent,
  resetPixelSize,
  updateDisplayContent,
} from "@/src/services/pixel-sizes"
import type { ContentItem, PixelSizeInfo } from "@/src/supabase/database.types"

interface DisplayContentItem extends ContentItem {
  delete?: boolean
}

const formRowSx: SxProps<Theme> = {
  display: "flex",
  minWidth: "550px",
  height: "45px",
  padding: "5px",
}

export default function ViewPositionClient(): React.JSX.Element {
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
  const { orderId, setProgress } = useOrderContext()

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
      const obj = await getOrderById(orderId)
      if (!obj) {
        return
      }
      const display_filtered = filterActiveDisplayItems(obj.set1)
      const hidden_filtered = filterActiveDisplayItems(obj.hidden)
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
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
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
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
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
                    <Grid sx={formRowSx}>
                      <Typography style={{ width: "33%", lineHeight: "35px" }}>
                        サイネージ画像(高さ)：{" "}
                      </Typography>
                      <input
                        type="number"
                        style={{ width: "20%" }}
                        name={"height"}
                        placeholder={String(pixelSize.height)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setHeight(Number(e.target.value))
                        }
                      />
                    </Grid>
                    <Grid sx={formRowSx}>
                      <Typography style={{ width: "33%", lineHeight: "35px" }}>
                        サイネージ画像(幅)：{" "}
                      </Typography>
                      <input
                        type="number"
                        style={{ width: "20%" }}
                        name={"width"}
                        placeholder={String(pixelSize.width)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setWidth(Number(e.target.value))
                        }
                      />
                    </Grid>
                    <Grid sx={formRowSx}>
                      <Typography style={{ width: "33%", lineHeight: "35px" }}>
                        サイネージ上部余白：{" "}
                      </Typography>
                      <input
                        type="number"
                        style={{ width: "20%" }}
                        name={"marginTop"}
                        placeholder={String(pixelSize.marginTop)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setMarginTop(Number(e.target.value))
                        }
                      />
                    </Grid>
                    <Grid sx={formRowSx}>
                      <Typography style={{ width: "33%", lineHeight: "35px" }}>
                        サイネージ左部余白：{" "}
                      </Typography>
                      <input
                        type="number"
                        style={{ width: "20%" }}
                        name={"marginLeft"}
                        placeholder={String(pixelSize.marginLeft)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setMarginLeft(Number(e.target.value))
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
                            <Image
                              src={contents_list.path}
                              width={0}
                              height={0}
                              unoptimized
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
      <ErrorDialog
        error={error}
        errorPart={errorPart}
        open={showError}
        onClose={handleCloseError}
      />
    </>
  )
}
