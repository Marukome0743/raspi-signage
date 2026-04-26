"use client"

import type { DragEndEvent } from "@dnd-kit/core"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import CancelIcon from "@mui/icons-material/Cancel"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import Image from "next/image"
import { useEffect, useState } from "react"
import ErrorDialog from "@/components/dashboard/ErrorDialog"
import { useOrderContext } from "@/components/dashboard/OrderContext"
import type { ContentItem, Order } from "@/src/db/types"
import { filterActiveDisplayItems } from "@/src/services/content-helpers"
import { getOrderById, setContentOrder } from "@/src/services/contents"

interface DisplayContentItem extends ContentItem {
  delete?: boolean
}

interface SortableItemProps {
  id: string
  name: string
  content: DisplayContentItem
  index: number
  eventHandler: (e: React.ChangeEvent<HTMLInputElement>, i: number) => void
  checked: boolean
  onCheckBoxChange: (name: string) => void
  onRemove: (checked: boolean, index: number) => Promise<void>
}

function SortableItem({
  id,
  name,
  content,
  index,
  eventHandler,
  checked,
  onCheckBoxChange,
  onRemove,
}: SortableItemProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <ListItem ref={setNodeRef} style={style} {...attributes} sx={{ px: 0 }}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          position: "relative",
          p: { xs: 1.5, sm: 2 },
          "&:hover": {
            borderColor: "primary.main",
            transition: "border-color 0.2s",
          },
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          {/* Drag handle + checkbox */}
          <Grid
            size={{ xs: 12, sm: "auto" }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              {...listeners}
              sx={{
                cursor: "grab",
                display: "flex",
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <DragIndicatorIcon />
            </Box>
            <FormControlLabel
              label="表示"
              labelPlacement="end"
              control={
                <Checkbox
                  name={name + index}
                  checked={checked}
                  onChange={(e) => onCheckBoxChange(e.target.name)}
                  size="small"
                />
              }
              sx={{ mr: 0 }}
            />
          </Grid>

          {/* Preview */}
          <Grid size={{ xs: 12, sm: 3 }}>
            {content.type === "image" ? (
              <Image
                src={content.path}
                width={0}
                height={0}
                unoptimized
                style={{
                  width: "100%",
                  maxWidth: "200px",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
                alt="コンテンツプレビュー"
              />
            ) : (
              <video
                src={content.path}
                style={{
                  width: "100%",
                  maxWidth: "200px",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
                muted
                autoPlay
                loop
                playsInline
              />
            )}
          </Grid>

          {/* Info */}
          <Grid size={{ xs: 12, sm: "grow" }}>
            <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
              {content.fileName}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                表示時間(秒):
              </Typography>
              <TextField
                type="number"
                size="small"
                disabled={content.type === "video"}
                placeholder={String(Number(content.viewTime / 1000))}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  eventHandler(event, index)
                }
                sx={{ maxWidth: 120 }}
              />
            </Box>
          </Grid>

          {/* Delete */}
          <Grid
            size="auto"
            sx={{
              position: { xs: "absolute", sm: "static" },
              top: 8,
              right: 8,
            }}
          >
            <IconButton
              aria-label="delete image"
              onClick={() => {
                void onRemove(checked, index)
              }}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "error.main",
                  bgcolor: "rgba(239, 68, 68, 0.08)",
                },
              }}
            >
              <CancelIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>
    </ListItem>
  )
}

export default function ManageContentsClient(): React.JSX.Element {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // display / hidden: arrays for visible/hidden contents
  const [display, setDisplay] = useState<DisplayContentItem[]>([])
  const [hidden, setHidden] = useState<DisplayContentItem[]>([])
  const [contents_list] = useState<Partial<Order>>({})
  const [error, setError] = useState<string>("")
  const [errorPart, setErrorPart] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(false)

  const { orderId, setProgress } = useOrderContext()

  useEffect(() => {
    async function featchData(): Promise<void> {
      if (orderId == null) {
        return
      }
      const obj = await getOrderById(orderId)
      if (!obj) {
        return
      }
      const display_filtered = filterActiveDisplayItems(obj.set1)
      const hidden_filtered = filterActiveDisplayItems(obj.hidden)
      setDisplay(display_filtered)
      setHidden(hidden_filtered)
    }
    featchData()
  }, [orderId])

  const changeTempDisplay = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number,
  ): void => {
    if (!e.target.value) {
      return
    }
    setDisplay(
      display.map((item, index) => {
        return {
          ...item,
          viewTime: i === index ? Number(e.target.value) * 1000 : item.viewTime,
        }
      }),
    )
  }

  const changeTempHidden = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number,
  ): void => {
    if (!e.target.value) {
      return
    }
    setHidden(
      hidden.map((item, index) => {
        return {
          ...item,
          viewTime: i === index ? Number(e.target.value) * 1000 : item.viewTime,
        }
      }),
    )
  }

  const onClickSubmit = async (): Promise<void> => {
    if (orderId == null) {
      return
    }
    try {
      setProgress(true)
      const submitObj: Partial<Order> = {
        ...contents_list,
        set1: [...display.values()],
        hidden: [...hidden.values()],
      }
      await setContentOrder(orderId, submitObj)
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
    } finally {
      setProgress(false)
    }
  }

  const onClickRemove = async (
    checked: boolean,
    index: number,
  ): Promise<void> => {
    if (orderId == null) {
      return
    }
    try {
      setProgress(true)
      const newDisplay = checked
        ? display.map((item, i) =>
            i === index ? { ...item, delete: true } : item,
          )
        : display
      const newHidden = checked
        ? hidden
        : hidden.map((item, i) =>
            i === index ? { ...item, delete: true } : item,
          )
      setDisplay(newDisplay)
      setHidden(newHidden)

      const submitObj: Partial<Order> = {
        ...contents_list,
        set1: [...newDisplay.values()],
        hidden: [...newHidden.values()],
      }
      await setContentOrder(orderId, submitObj)
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
      setErrorPart("")
      setShowError(true)
    } finally {
      setProgress(false)
    }
  }

  const onChangeCheckBox = (name: string): void => {
    const [target, index] = [name[0], Number(name.slice(1))]

    if (target === "d") {
      setHidden([display[index], ...hidden])
      setDisplay(display.filter((_, i) => i !== index))
    } else {
      setDisplay([...display, hidden[index]])
      setHidden(hidden.filter((_, i) => i !== index))
    }
  }

  const handleDragEndDisplay = (event: DragEndEvent): void => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    setDisplay((items) => {
      const oldIndex = items.findIndex((_, i) => `display-${i}` === active.id)
      const newIndex = items.findIndex((_, i) => `display-${i}` === over.id)
      if (oldIndex === -1 || newIndex === -1) {
        return items
      }
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const handleDragEndHidden = (event: DragEndEvent): void => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    setHidden((items) => {
      const oldIndex = items.findIndex((_, i) => `hidden-${i}` === active.id)
      const newIndex = items.findIndex((_, i) => `hidden-${i}` === over.id)
      if (oldIndex === -1 || newIndex === -1) {
        return items
      }
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const handleCloseError = (): void => {
    setShowError(false)
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6">コンテンツ並び替え</Typography>
        <Button variant="contained" onClick={onClickSubmit}>
          送信
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Display section */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
              color: "primary.main",
            }}
          >
            <VisibilityIcon fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              表示コンテンツ
            </Typography>
          </Box>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEndDisplay}
          >
            <SortableContext
              items={display.map((_, i) => `display-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {display.map((content, i) => (
                  <SortableItem
                    // biome-ignore lint/suspicious/noArrayIndexKey: items lack stable unique IDs; index-based keys match SortableContext item IDs
                    key={`display-${i}`}
                    id={`display-${i}`}
                    name="d"
                    content={content}
                    index={i}
                    eventHandler={changeTempDisplay}
                    checked={true}
                    onCheckBoxChange={onChangeCheckBox}
                    onRemove={onClickRemove}
                  />
                ))}
              </List>
            </SortableContext>
          </DndContext>
        </Box>

        {/* Hidden section */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
              color: "text.secondary",
            }}
          >
            <VisibilityOffIcon fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              非表示コンテンツ
            </Typography>
          </Box>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEndHidden}
          >
            <SortableContext
              items={hidden.map((_, i) => `hidden-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {hidden.map((content, i) => (
                  <SortableItem
                    // biome-ignore lint/suspicious/noArrayIndexKey: items lack stable unique IDs; index-based keys match SortableContext item IDs
                    key={`hidden-${i}`}
                    id={`hidden-${i}`}
                    name="h"
                    content={content}
                    index={i}
                    eventHandler={changeTempHidden}
                    checked={false}
                    onCheckBoxChange={onChangeCheckBox}
                    onRemove={onClickRemove}
                  />
                ))}
              </List>
            </SortableContext>
          </DndContext>
        </Box>
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
