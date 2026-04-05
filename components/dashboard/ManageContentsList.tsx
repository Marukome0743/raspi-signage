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
  Typography,
} from "@mui/material"
import Image from "next/image"
import { useEffect, useState } from "react"
import {
  filterActiveDisplayItems,
  getOrderById,
  setContentOrder,
} from "@/src/services/contents"
import type { ContentItem, Order } from "@/src/supabase/database.types"
import ErrorDialog from "./ErrorDialog"
import { useOrderContext } from "./OrderContext"

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
    <ListItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Paper
        sx={{ height: 1 / 5, m: 1 }}
        style={{
          position: "relative",
          minWidth: "400px",
          height: "100%",
        }}
      >
        <Grid container>
          <Grid
            size={1}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: "2rem",
              minWidth: "45px",
            }}
          >
            <FormControlLabel
              label="表示"
              labelPlacement="top"
              control={
                <Checkbox
                  name={name + index}
                  checked={checked}
                  onChange={(e) => onCheckBoxChange(e.target.name)}
                />
              }
            />
          </Grid>
          <Grid size={3} style={{ minWidth: "280px" }}>
            {content.type === "image" ? (
              <Image
                src={content.path}
                width={0}
                height={0}
                unoptimized
                style={{
                  width: "30vh",
                  height: "auto",
                  objectFit: "contain",
                  margin: "1rem",
                }}
                alt="コンテンツプレビュー"
              />
            ) : (
              <video
                src={content.path}
                style={{
                  width: "30vh",
                  objectFit: "contain",
                  margin: "1rem",
                }}
                muted
                autoPlay
                loop
                playsInline
              />
            )}
          </Grid>
          <Grid size={6} container style={{ padding: "20px" }}>
            <Grid style={{ padding: "5px" }}>
              <Typography>ファイル名: {content.fileName}</Typography>
            </Grid>
            <Grid container direction="column">
              <Grid
                style={{
                  display: "flex",
                  minWidth: "550px",
                  height: "45px",
                  padding: "5px",
                }}
              >
                <Typography style={{ width: "20%", lineHeight: "35px" }}>
                  表示時間(秒):{" "}
                </Typography>
                <input
                  type="number"
                  style={{ width: "20%" }}
                  name={name + index}
                  disabled={content.type === "video"}
                  placeholder={String(Number(content.viewTime / 1000))}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    eventHandler(event, index)
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <IconButton
          aria-label="delete image"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            color: "#aaa",
          }}
          onClick={() => {
            void onRemove(checked, index)
          }}
        >
          <CancelIcon />
        </IconButton>
      </Paper>
    </ListItem>
  )
}

function ManageContentsView(): React.JSX.Element {
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
      if (checked) {
        display[index].delete = true
      } else {
        hidden[index].delete = true
      }

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
      <Box>
        <Typography>並び替え</Typography>
        <Button variant="contained" sx={{ m: 1 }} onClick={onClickSubmit}>
          送信
        </Button>
      </Box>
      <Box style={{ display: "flex", flexDirection: "column" }}>
        <Typography>ー 表示コンテンツ</Typography>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndDisplay}
        >
          <SortableContext
            items={display.map((_, i) => `display-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <List>
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
        <Typography>ー 非表示コンテンツ</Typography>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndHidden}
        >
          <SortableContext
            items={hidden.map((_, i) => `hidden-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <List>
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
      <ErrorDialog
        error={error}
        errorPart={errorPart}
        open={showError}
        onClose={handleCloseError}
      />
    </>
  )
}

export default ManageContentsView
