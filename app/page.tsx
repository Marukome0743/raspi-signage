"use client"

import { Grid } from "@mui/material"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"
import type { ContentItem } from "../src/supabase/database.types"
import styles from "../styles/Sinage.module.css"
import {
  getContentDataAdmin,
  getOrderIdAdmin,
} from "../utilities/getContentDataAdmin"
import { getContentPixelSize } from "../utilities/getContentDataClient"
import { setContentPixelSize } from "../utilities/setContentData"

function SignageContent(): React.ReactElement | null {
  const searchParams = useSearchParams()
  const divElement = useRef<HTMLDivElement>(null)
  const [contentsList, setContentsList] = useState<ContentItem[]>([])
  const [orderId, setOrderId] = useState<string | null>(null)
  const [pixelSizeId, setPixelSizeId] = useState<string>("")
  const [cssPixelFlg, setCssPixelFlg] = useState<boolean>(true)
  const [loaded, setLoaded] = useState<boolean>(false)

  const [prop_height, setHeight] = useState<number>(0)
  const [prop_width, setWidth] = useState<number>(0)
  const [prop_marginT, setMarginTop] = useState<number>(0)
  const [prop_marginL, setMarginLeft] = useState<number>(0)
  const [prop_innerHeight, setInnnerHeight] = useState<number>(0)
  const [prop_innerWidth, setInnerWidth] = useState<number>(0)
  const [slidNo, setSlidNo] = useState<number>(0)
  const [display, _setDisplay] = useState<boolean>(false)

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

      setContentsList(contents_list)
      setOrderId(content.orderId)
      setPixelSizeId(content.pixelSizeId ? content.pixelSizeId : "")
      setCssPixelFlg(pixel ? pixel.getPixelFlg : true)
      setLoaded(true)
    }
    fetchData()
  }, [searchParams])

  useEffect(() => {
    if (!loaded) {
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
          setHeight(
            pixelSize.height !== 0 ? pixelSize.height : window.innerHeight,
          )
          setWidth(pixelSize.width !== 0 ? pixelSize.width : window.innerWidth)
          setMarginTop(pixelSize.marginTop)
          setMarginLeft(pixelSize.marginLeft)
          setInnnerHeight(pixelSize.pixelHeight)
          setInnerWidth(pixelSize.pixelWidth)
        }
      } else {
        setHeight(window.innerHeight)
        setWidth(window.innerWidth)
        setMarginTop(0)
        setMarginLeft(0)
        setInnnerHeight(window.innerHeight)
        setInnerWidth(window.innerWidth)
      }
    }

    if (!display) {
      setCssPixelSizeFn()
    }
  }, [loaded, display, cssPixelFlg, orderId, pixelSizeId])

  useEffect(() => {
    if (!loaded || contentsList.length === 0) {
      return
    }

    const viewSlide = (
      contentElements: HTMLCollection | undefined,
    ): ReturnType<typeof setInterval> | undefined => {
      if (contentElements === undefined || contentElements.length === 0) {
        return
      }

      if (slidNo > 0) {
        ;(contentElements[slidNo - 1] as HTMLElement).style.opacity = "0"
      } else if (slidNo === 0) {
        ;(
          contentElements[contentElements.length - 1] as HTMLElement
        ).style.opacity = "0"
      }
      ;(contentElements[slidNo] as HTMLElement).style.opacity = "1"
      if (contentElements[slidNo].tagName !== "IMG") {
        const videoEl = contentElements[slidNo] as HTMLVideoElement
        videoEl.pause()
        videoEl.currentTime = 0
        videoEl.play()
      }
      return setInterval(
        () => {
          slidNo >= contentElements.length - 1
            ? location.reload()
            : setSlidNo(slidNo + 1)
        },
        contentsList[slidNo] ? contentsList[slidNo].viewTime : 2000,
      )
    }

    const id = viewSlide(divElement.current?.children)
    return () => clearInterval(id)
  }, [slidNo, contentsList, loaded])

  if (!loaded) {
    return null
  }

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
        {contentsList.map((content, i) => {
          if (content.type === "image") {
            return (
              // biome-ignore lint/performance/noImgElement: external Supabase Storage URL for signage display
              <img
                key={content.path}
                className={styles.content_img}
                src={contentsList[i].path}
                style={{
                  height: `${prop_height}px`,
                  width: `${prop_width}px`,
                  marginTop: `${prop_marginT}px`,
                  marginLeft: `${prop_marginL}px`,
                  marginRight: `${prop_innerWidth - prop_width - prop_marginL}px`,
                  marginBottom: `${prop_innerHeight - prop_height - prop_marginT}px`,
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
              className={styles.content_video}
              src={contentsList[i].path}
              style={{
                height: `${prop_height}px`,
                width: `${prop_width}px`,
                marginTop: `${prop_marginT}px`,
                marginLeft: `${prop_marginL}px`,
                marginRight: `${prop_innerWidth - prop_width - prop_marginL}px`,
                marginBottom: `${prop_innerHeight - prop_height - prop_marginT}px`,
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
