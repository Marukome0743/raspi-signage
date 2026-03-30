import CancelIcon from "@mui/icons-material/Cancel"
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  Paper,
  Typography,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type {
  DraggableProvided,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import type { ContentItem, Order } from "../../src/supabase/database.types"
import { getContentDataClient } from "../../utilities/getContentDataClient"
import { setContentOrder } from "../../utilities/setContentData"
import { useOrderContext } from "./OrderContext"

interface DisplayContentItem extends ContentItem {
  delete?: boolean
}

function ManageContentsView(): React.JSX.Element {
  // display / hidden: arrays for visible/hidden contents
  const [display, setDisplay] = useState<DisplayContentItem[]>([])
  const [hidden, setHidden] = useState<DisplayContentItem[]>([])
  const [contents_list, _setContentsList] = useState<Partial<Order>>({})
  const [error, _setError] = useState<string>("")
  const [errorPart, _setErrorPart] = useState<string>("")
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
      console.log(e)
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
      console.log(e)
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

  const handleDragEnd = (
    result: DropResult,
    _provided: ResponderProvided,
    name: string,
  ): void => {
    if (!result.destination) {
      return
    }
    if (name === "d") {
      const itemsCopy = [...display]
      const [reorderedItem] = itemsCopy.splice(result.source.index, 1)
      itemsCopy.splice(result.destination.index, 0, reorderedItem)

      setDisplay(itemsCopy)
    } else if (name === "h") {
      const itemsCopy = [...hidden]
      const [reorderedItem] = itemsCopy.splice(result.source.index, 1)
      itemsCopy.splice(result.destination.index, 0, reorderedItem)

      setHidden(itemsCopy)
    }
  }

  const handleCloseError = (): void => {
    setShowError(false)
  }

  const createContentCard = (
    name: string,
    content: DisplayContentItem | null | undefined,
    i: number,
    eventHandler: (e: React.ChangeEvent<HTMLInputElement>, i: number) => void,
    checked: boolean,
  ): React.JSX.Element | undefined => {
    if (content === null || content === undefined) {
      return
    }
    return (
      <Draggable key={`drag_key${i}`} draggableId={`drag${i}`} index={i}>
        {(provided: DraggableProvided) => (
          <ListItem
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Paper
              sx={{ height: 1 / 5, m: 1 }}
              key={`key${i}`}
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
                        name={name + i}
                        checked={checked}
                        onChange={(e) => onChangeCheckBox(e.target.name)}
                      />
                    }
                  />
                </Grid>
                <Grid size={3} style={{ minWidth: "280px" }}>
                  {content.type === "image" ? (
                    // biome-ignore lint/performance/noImgElement: external Supabase Storage URL
                    <img
                      src={content.path}
                      style={{
                        width: "30vh",
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
                        name={name + i}
                        disabled={content.type === "video"}
                        placeholder={String(Number(content.viewTime / 1000))}
                        onInput={(event: React.FormEvent<HTMLInputElement>) =>
                          eventHandler(
                            event as React.ChangeEvent<HTMLInputElement>,
                            i,
                          )
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
                onClick={(_e) => onClickRemove(checked, i)}
              >
                <CancelIcon />
              </IconButton>
            </Paper>
          </ListItem>
        )}
      </Draggable>
    )
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
        <DragDropContext
          onDragEnd={(e, provided) => handleDragEnd(e, provided, "d")}
        >
          <Droppable droppableId="my-list">
            {(provided) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {display.map((content, i) =>
                  createContentCard("d", content, i, changeTempDisplay, true),
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
        <Typography>ー 非表示コンテンツ</Typography>
        <DragDropContext
          onDragEnd={(e, provided) => handleDragEnd(e, provided, "h")}
        >
          <Droppable droppableId="my-list">
            {(provided) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {hidden.map((content, i) =>
                  createContentCard("h", content, i, changeTempHidden, false),
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
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

export default ManageContentsView
