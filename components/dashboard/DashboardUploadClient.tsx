"use client"

import CancelIcon from "@mui/icons-material/Cancel"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { useId, useState } from "react"
import ErrorDialog from "@/components/dashboard/ErrorDialog"
import { useOrderContext } from "@/components/dashboard/OrderContext"
import { postContent } from "@/src/services/upload"

type UploadType = "image" | "video"

export default function DashboardUploadClient(): React.JSX.Element {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [type, setType] = useState<UploadType>("image")
  const [error, setError] = useState<string>("")
  const [errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(false)
  const { orderId, setProgress } = useOrderContext()
  const maxImageUpload = 4
  const inputId = useId()

  const handleOnUpload = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault()
    if (orderId == null) {
      return
    }
    try {
      setProgress(true)
      const uploadPromises = images.map((image, i) => {
        let duration = 0
        if (type === "video") {
          const videoElement = document.getElementById(
            `video_${i}`,
          ) as HTMLVideoElement | null
          duration = Math.round(videoElement?.duration ?? 0) * 1000
        }
        return postContent(orderId, image, type, duration)
      })
      await Promise.all(uploadPromises)
      setImages([])
      setPreviews([])
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
    } finally {
      setProgress(false)
    }
  }

  const handleOnAddImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!e.target.files) {
      return
    }
    let validationFlg = false
    if (type === "image") {
      // Image files
      for (let i = 0; i < e.target.files.length; i++) {
        // Validate file extension
        if (
          e.target.files[i].type !== "image/png" &&
          e.target.files[i].type !== "image/jpeg"
        ) {
          setError("画像（PNG,JPEG）以外が選択されています")
          setErrorPart("画像")
          setShowError(true)
          validationFlg = true
          break
        }
      }
    } else if (type === "video") {
      // Video files
      for (let i = 0; i < e.target.files.length; i++) {
        // Validate file extension
        if (
          e.target.files[i].type !== "video/mp4" &&
          e.target.files[i].type !== "video/quicktime" &&
          e.target.files[i].type !== "video/x-ms-wmv"
        ) {
          setError("動画（MP4,MOV,WMV）以外が選択されています")
          setErrorPart("動画")
          setShowError(true)
          validationFlg = true
          break
        }
      }
    }
    if (validationFlg) {
      return
    }
    setImages([...images, ...Array.from(e.target.files)])
    const newFiles = Array.from(e.target.files)
    const newPreviews = await Promise.all(
      newFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          }),
      ),
    )
    setPreviews([...previews, ...newPreviews])
  }

  const handleOnRemoveImage = (index: number): void => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
    const newPreviews = [...previews]
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
  }

  const toggleUploadType = (
    _: React.MouseEvent<HTMLElement>,
    newString: UploadType | null,
  ): void => {
    if (newString == null) {
      return
    }
    setType(newString)
    setImages([])
    setPreviews([])
  }

  const handleCloseError = (): void => {
    setShowError(false)
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        コンテンツアップロード
      </Typography>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          最大4つまでの画像/動画を選択してアップロード
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          <ToggleButtonGroup
            color="primary"
            value={type}
            exclusive
            onChange={toggleUploadType}
            aria-label="type"
            size="small"
          >
            <ToggleButton sx={{ px: 3 }} value="image">
              画像
            </ToggleButton>
            <ToggleButton sx={{ px: 3 }} value="video">
              動画
            </ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ display: "flex", gap: 1 }}>
            <label htmlFor={inputId}>
              <Button
                variant="outlined"
                disabled={images.length >= maxImageUpload || orderId == null}
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                {type === "image" ? "画像追加" : "動画追加"}
              </Button>
              <input
                id={inputId}
                type="file"
                multiple
                disabled={images.length >= maxImageUpload || orderId == null}
                onChange={(e) => handleOnAddImage(e)}
                style={{ display: "none" }}
              />
            </label>
            <Button
              variant="contained"
              onClick={(e) => handleOnUpload(e)}
              disabled={images.length < 1 || orderId == null}
            >
              アップロード
            </Button>
          </Box>
        </Box>
        {images.length > 0 && (
          <Grid container spacing={2}>
            {images.map((image, i) => {
              const id = `video_${i}`
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={image.name}>
                  <Paper
                    elevation={0}
                    sx={{
                      position: "relative",
                      p: 1,
                      bgcolor: "background.default",
                    }}
                  >
                    <IconButton
                      aria-label="delete image"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        zIndex: 1,
                        bgcolor: "rgba(0,0,0,0.4)",
                        "&:hover": {
                          bgcolor: "rgba(239, 68, 68, 0.3)",
                          color: "error.main",
                        },
                      }}
                      onClick={() => handleOnRemoveImage(i)}
                      size="small"
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                    {type === "image" ? (
                      // biome-ignore lint/performance/noImgElement: blob URL preview
                      <img
                        src={previews[i]}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          display: "block",
                        }}
                        alt="アップロードプレビュー"
                      />
                    ) : (
                      // biome-ignore lint/a11y/useMediaCaption: preview video
                      <video
                        id={id}
                        src={previews[i]}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          display: "block",
                        }}
                      />
                    )}
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Paper>
      <ErrorDialog
        error={error}
        errorPart={errorPart}
        open={showError}
        onClose={handleCloseError}
      />
    </Box>
  )
}
