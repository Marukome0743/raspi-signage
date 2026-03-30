"use client"

import { Grid } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import styles from "../styles/Sinage.module.css"
import {
  getContentDataAdmin,
  getOrderIdAdmin,
} from "../utilities/getContentDataAdmin"
import { getContentPixelSize } from "../utilities/getContentDataClient"
import { setContentPixelSize } from "../utilities/setContentData"

export default function Signage() {
  const searchParams = useSearchParams()
  const divElement = useRef()
  const [contentsList, setContentsList] = useState([])
  const [orderId, setOrderId] = useState(null)
  const [pixelSizeId, setPixelSizeId] = useState("")
  const [cssPixelFlg, setCssPixelFlg] = useState(true)
  const [loaded, setLoaded] = useState(false)

  const [prop_height, setHeight] = useState()
  const [prop_width, setWidth] = useState()
  const [prop_marginT, setMarginTop] = useState()
  const [prop_marginL, setMarginLeft] = useState()
  const [prop_innerHeight, setInnnerHeight] = useState()
  const [prop_innerWidth, setInnerWidth] = useState()
  const [slidNo, setSlidNo] = useState(0)
  const [display, _setDisplay] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const areaId = searchParams.get("areaId") ?? "0"
      const content = await getOrderIdAdmin(areaId)
      const order_list = await getContentDataAdmin(content.orderId)
      const contents_list = order_list.set1

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
    if (!loaded) return

    async function setCssPixelSizeFn() {
      if (cssPixelFlg) {
        await setContentPixelSize(
          orderId,
          pixelSizeId,
          window.innerWidth,
          window.innerHeight,
        )
      }
      if (pixelSizeId !== "") {
        const pixelSize = await getContentPixelSize(pixelSizeId)
        setHeight(
          pixelSize.height !== 0 ? pixelSize.height : window.innerHeight,
        )
        setWidth(pixelSize.width !== 0 ? pixelSize.width : window.innerWidth)
        setMarginTop(pixelSize.marginTop)
        setMarginLeft(pixelSize.marginLeft)
        setInnnerHeight(pixelSize.pixelHeight)
        setInnerWidth(pixelSize.pixelWidth)
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
    if (!loaded || contentsList.length === 0) return

    const viewSlide = (contentElements) => {
      if (contentElements === undefined || contentElements.length === 0) {
        return
      }

      if (slidNo > 0) {
        contentElements[slidNo - 1].style.opacity = 0
      } else if (slidNo === 0) {
        contentElements[contentElements.length - 1].style.opacity = 0
      }
      contentElements[slidNo].style.opacity = 1
      if (contentElements[slidNo].tagName !== "IMG") {
        contentElements[slidNo].pause()
        contentElements[slidNo].currentTime = 0
        contentElements[slidNo].play()
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

  if (!loaded) return null

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
