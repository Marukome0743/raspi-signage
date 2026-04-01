"use client"

import { Grid } from "@mui/material"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useReducer, useRef } from "react"
import styles from "@/app/styles.module.css"
import { getContentPixelSize } from "@/src/services/contents"
import {
  getContentDataAdmin,
  getOrderIdAdmin,
} from "@/src/services/contents-admin"
import { setContentPixelSize } from "@/src/services/pixel-sizes"
import type { ContentItem } from "@/src/supabase/database.types"

interface SignageDisplayState {
  height: number
  width: number
  marginTop: number
  marginLeft: number
  innerHeight: number
  innerWidth: number
}

interface SignageState {
  contentsList: ContentItem[]
  orderId: string | null
  pixelSizeId: string
  cssPixelFlg: boolean
  loaded: boolean
  slideNo: number
  display: SignageDisplayState
}

type SignageAction =
  | {
      type: "SET_INITIAL"
      contentsList: ContentItem[]
      orderId: string
      pixelSizeId: string
      cssPixelFlg: boolean
    }
  | { type: "SET_DISPLAY"; display: SignageDisplayState }
  | { type: "NEXT_SLIDE" }

const initialState: SignageState = {
  contentsList: [],
  orderId: null,
  pixelSizeId: "",
  cssPixelFlg: true,
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
    case "SET_INITIAL":
      return {
        ...state,
        contentsList: action.contentsList,
        orderId: action.orderId,
        pixelSizeId: action.pixelSizeId,
        cssPixelFlg: action.cssPixelFlg,
        loaded: true,
      }
    case "SET_DISPLAY":
      return { ...state, display: action.display }
    case "NEXT_SLIDE":
      return { ...state, slideNo: state.slideNo + 1 }
  }
}

function SignageContent(): React.ReactElement | null {
  const searchParams = useSearchParams()
  const divElement = useRef<HTMLDivElement>(null)
  const [state, dispatch] = useReducer(signageReducer, initialState)

  useEffect(() => {
    async function fetchData() {
      const areaId = searchParams.get("areaId") ?? "0"
      const content = await getOrderIdAdmin(areaId)
      const order_list = await getContentDataAdmin(content.orderId)
      const contents_list = order_list ? order_list.set1 : []

      let pixel = null
      if (content.pixelSizeId) {
        pixel = await getContentPixelSize(content.pixelSizeId)
      }

      dispatch({
        type: "SET_INITIAL",
        contentsList: contents_list,
        orderId: content.orderId,
        pixelSizeId: content.pixelSizeId ? content.pixelSizeId : "",
        cssPixelFlg: pixel ? pixel.getPixelFlg : true,
      })
    }
    fetchData()
  }, [searchParams])

  useEffect(() => {
    if (!state.loaded) {
      return
    }

    async function setCssPixelSizeFn() {
      if (state.cssPixelFlg && state.orderId) {
        await setContentPixelSize(
          state.orderId,
          state.pixelSizeId,
          window.innerWidth,
          window.innerHeight,
        )
      }
      if (state.pixelSizeId !== "") {
        const pixelSize = await getContentPixelSize(state.pixelSizeId)
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
  }, [state.loaded, state.cssPixelFlg, state.orderId, state.pixelSizeId])

  useEffect(() => {
    if (!state.loaded || state.contentsList.length === 0) {
      return
    }

    const viewSlide = (
      contentElements: HTMLCollection | undefined,
    ): ReturnType<typeof setInterval> | undefined => {
      if (contentElements === undefined || contentElements.length === 0) {
        return
      }

      if (state.slideNo > 0) {
        ;(contentElements[state.slideNo - 1] as HTMLElement).style.opacity = "0"
      } else if (state.slideNo === 0) {
        ;(
          contentElements[contentElements.length - 1] as HTMLElement
        ).style.opacity = "0"
      }
      ;(contentElements[state.slideNo] as HTMLElement).style.opacity = "1"
      if (contentElements[state.slideNo].tagName !== "IMG") {
        const videoEl = contentElements[state.slideNo] as HTMLVideoElement
        videoEl.pause()
        videoEl.currentTime = 0
        videoEl.play()
      }
      return setInterval(
        () => {
          if (state.slideNo >= contentElements.length - 1) {
            location.reload()
          } else {
            dispatch({ type: "NEXT_SLIDE" })
          }
        },
        state.contentsList[state.slideNo]
          ? state.contentsList[state.slideNo].viewTime
          : 2000,
      )
    }

    const id = viewSlide(divElement.current?.children)
    return () => clearInterval(id)
  }, [state.slideNo, state.contentsList, state.loaded])

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
        {state.contentsList.map((content, i) => {
          if (content.type === "image") {
            return (
              <Image
                key={content.path}
                className={styles.content_media}
                src={state.contentsList[i].path}
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
              src={state.contentsList[i].path}
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

export default function Signage(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <SignageContent />
    </Suspense>
  )
}
