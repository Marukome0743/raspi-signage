"use client"

import { Grid } from "@mui/material"
import Image from "next/image"
import { useEffect, useReducer, useRef } from "react"
import styles from "@/app/styles.module.css"
import type { ContentItem } from "@/src/db/types"
import { getContentPixelSize } from "@/src/services/contents"
import { setContentPixelSize } from "@/src/services/pixel-sizes"

interface SignageDisplayState {
  height: number
  width: number
  marginTop: number
  marginLeft: number
  innerHeight: number
  innerWidth: number
}

interface SignageState {
  loaded: boolean
  slideNo: number
  display: SignageDisplayState
}

type SignageAction =
  | { type: "SET_LOADED" }
  | { type: "SET_DISPLAY"; display: SignageDisplayState }
  | { type: "NEXT_SLIDE" }

const initialState: SignageState = {
  loaded: false,
  slideNo: 0,
  display: {
    height: 0,
    width: 0,
    marginTop: 0,
    marginLeft: 0,
    innerHeight: 0,
    innerWidth: 0,
  },
}

function signageReducer(
  state: SignageState,
  action: SignageAction,
): SignageState {
  switch (action.type) {
    case "SET_LOADED":
      return { ...state, loaded: true }
    case "SET_DISPLAY":
      return { ...state, display: action.display }
    case "NEXT_SLIDE":
      return { ...state, slideNo: state.slideNo + 1 }
  }
}

interface SignageClientProps {
  contentsList: ContentItem[]
  orderId: string
  pixelSizeId: string
  cssPixelFlg: boolean
}

export default function SignageClient({
  contentsList,
  orderId,
  pixelSizeId,
  cssPixelFlg,
}: SignageClientProps): React.ReactElement | null {
  const divElement = useRef<HTMLDivElement>(null)
  const [state, dispatch] = useReducer(signageReducer, initialState)

  useEffect(() => {
    dispatch({ type: "SET_LOADED" })
  }, [])

  useEffect(() => {
    if (!state.loaded) {
      return
    }

    async function setCssPixelSizeFn() {
      if (cssPixelFlg && orderId) {
        await setContentPixelSize(
          orderId,
          pixelSizeId,
          window.innerWidth,
          window.innerHeight,
        )
      }
      if (pixelSizeId !== "") {
        const pixelSize = await getContentPixelSize(pixelSizeId)
        if (pixelSize) {
          dispatch({
            type: "SET_DISPLAY",
            display: {
              height:
                pixelSize.height !== 0 ? pixelSize.height : window.innerHeight,
              width:
                pixelSize.width !== 0 ? pixelSize.width : window.innerWidth,
              marginTop: pixelSize.marginTop,
              marginLeft: pixelSize.marginLeft,
              innerHeight: pixelSize.pixelHeight,
              innerWidth: pixelSize.pixelWidth,
            },
          })
        } else {
          dispatch({
            type: "SET_DISPLAY",
            display: {
              height: window.innerHeight,
              width: window.innerWidth,
              marginTop: 0,
              marginLeft: 0,
              innerHeight: window.innerHeight,
              innerWidth: window.innerWidth,
            },
          })
        }
      } else {
        dispatch({
          type: "SET_DISPLAY",
          display: {
            height: window.innerHeight,
            width: window.innerWidth,
            marginTop: 0,
            marginLeft: 0,
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
          },
        })
      }
    }

    setCssPixelSizeFn()
  }, [state.loaded, cssPixelFlg, orderId, pixelSizeId])

  useEffect(() => {
    if (!state.loaded || contentsList.length === 0) {
      return
    }

    const viewSlide = (
      contentElements: HTMLCollection | undefined,
    ): ReturnType<typeof setInterval> | undefined => {
      if (contentElements === undefined || contentElements.length === 0) {
        return
      }

      const slideNo = Math.min(state.slideNo, contentElements.length - 1)

      if (slideNo > 0) {
        ;(contentElements[slideNo - 1] as HTMLElement).style.opacity = "0"
      } else if (slideNo === 0) {
        ;(
          contentElements[contentElements.length - 1] as HTMLElement
        ).style.opacity = "0"
      }
      ;(contentElements[slideNo] as HTMLElement).style.opacity = "1"
      if (contentElements[slideNo].tagName !== "IMG") {
        const videoEl = contentElements[slideNo] as HTMLVideoElement
        videoEl.pause()
        videoEl.currentTime = 0
        videoEl.play()
      }
      return setInterval(
        () => {
          if (slideNo >= contentElements.length - 1) {
            location.reload()
          } else {
            dispatch({ type: "NEXT_SLIDE" })
          }
        },
        contentsList[slideNo] ? contentsList[slideNo].viewTime : 2000,
      )
    }

    const id = viewSlide(divElement.current?.children)
    return () => clearInterval(id)
  }, [state.slideNo, contentsList, state.loaded])

  if (!state.loaded) {
    return null
  }

  const { display: d } = state

  return (
    <Grid
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: "0",
        backgroundColor: "#000",
      }}
    >
      <Grid
        ref={divElement}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        {contentsList.map((content) => {
          if (content.type === "image") {
            return (
              <Image
                key={content.path}
                className={styles.content_media}
                src={content.path}
                width={0}
                height={0}
                unoptimized
                style={{
                  height: `${d.height}px`,
                  width: `${d.width}px`,
                  marginTop: `${d.marginTop}px`,
                  marginLeft: `${d.marginLeft}px`,
                  marginRight: `${d.innerWidth - d.width - d.marginLeft}px`,
                  marginBottom: `${d.innerHeight - d.height - d.marginTop}px`,
                  objectFit: "contain",
                  opacity: "0",
                }}
                alt="サイネージコンテンツ"
              />
            )
          }
          return (
            <video
              key={content.path}
              className={styles.content_media}
              src={content.path}
              style={{
                height: `${d.height}px`,
                width: `${d.width}px`,
                marginTop: `${d.marginTop}px`,
                marginLeft: `${d.marginLeft}px`,
                marginRight: `${d.innerWidth - d.width - d.marginLeft}px`,
                marginBottom: `${d.innerHeight - d.height - d.marginTop}px`,
                objectFit: "contain",
                opacity: "0",
              }}
              muted
              playsInline
            />
          )
        })}
      </Grid>
    </Grid>
  )
}
