import { Grid } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import styles from "../styles/Sinage.module.css"
import {
  getContentDataAdmin,
  getOrderIdAdmin,
} from "../utilities/getContentDataAdmin"
import { getContentPixelSize } from "../utilities/getContentDataClient"
import { setContentPixelSize } from "../utilities/setContentData"

export async function getServerSideProps({ query }) {
  const areaId = query.areaId ?? "0"
  //areaIdからContents/(DocId) ⇒ orderId取得
  const content = await getOrderIdAdmin(areaId)

  const order_list = await getContentDataAdmin(content.orderId)
  const contents_list = order_list.set1
  console.log(contents_list)
  //  let viewTime = 0;
  //  for (var i = 0; i < contents_list.length; i++) {
  //    viewTime += Number(contents_list[i].viewTime);
  //  }
  let pixel = null
  if (content.pixelSizeId) {
    pixel = await getContentPixelSize(content.pixelSizeId)
  }
  //  console.log(pixel);

  return {
    props: {
      contents_list,
      //      viewTime,
      orderId: content.orderId,
      pixelSizeId: content.pixelSizeId ? content.pixelSizeId : "",
      cssPixelFlg: pixel ? pixel.getPixelFlg : true,
    },
  }
}

export default function Signage({
  contents_list,
  orderId,
  pixelSizeId,
  cssPixelFlg,
}) {
  const divElement = useRef()
  const [prop_height, setHeight] = useState()
  const [prop_width, setWidth] = useState()
  const [prop_marginT, setMarginTop] = useState()
  const [prop_marginL, setMarginLeft] = useState()
  const [prop_innerHeight, setInnnerHeight] = useState()
  const [prop_innerWidth, setInnerWidth] = useState()
  //  const [cssFlg, setCssFlg] = useState(true);
  const [slidNo, setSlidNo] = useState(0)

  const [display, _setDisplay] = useState(false)

  useEffect(() => {
    async function setCssPixelSize() {
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
        //        setCssFlg(pixelSize.getPixelFlg)
      } else {
        setHeight(window.innerHeight)
        setWidth(window.innerWidth)
        setMarginTop(0)
        setMarginLeft(0)
        setInnnerHeight(window.innerHeight)
        setInnerWidth(window.innerWidth)
      }
      //      setDisplay(true);
    }

    //    console.log(display);
    if (!display) {
      setCssPixelSize()
    }
    //    setTimeout(function () {
    //      location.reload();
    //    }, viewTime);
  }, [display, cssPixelFlg, orderId, pixelSizeId])

  useEffect(() => {
    const viewSlide = (contentElements) => {
      if (contentElements === undefined || contentElements.length === 0) {
        return
      }

      if (slidNo > 0) {
        contentElements[slidNo - 1].style.opacity = 0
        //            if (contentElements[slidNo].tagName != "IMG") contentElements[slidNo - 1].muted = true;
      } else if (slidNo === 0) {
        contentElements[contentElements.length - 1].style.opacity = 0
      }
      //          console.log(divElement.current);
      //          console.log(contentElements[slidNo].tagName);
      contentElements[slidNo].style.opacity = 1
      if (contentElements[slidNo].tagName !== "IMG") {
        contentElements[slidNo].pause()
        contentElements[slidNo].currentTime = 0
        contentElements[slidNo].play()
        //            contentElements[slidNo].muted = false;
      }
      return setInterval(
        () => {
          slidNo >= contentElements.length - 1
            ? location.reload()
            : setSlidNo(slidNo + 1)
        },
        contents_list[slidNo] ? contents_list[slidNo].viewTime : 2000,
      )
    }

    //        if (!display) return;
    const id = viewSlide(divElement.current.children)
    return () => clearInterval(id)
  }, [slidNo, contents_list])

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
        {contents_list.map((content, i) => {
          if (content.type === "image") {
            return (
              // biome-ignore lint/performance/noImgElement: external Supabase Storage URL for signage display
              <img
                key={content.path}
                className={styles.content_img}
                src={contents_list[i].path}
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
                layout="fill"
                alt="サイネージコンテンツ"
              />
            )
          }
          return (
            <video
              key={content.path}
              className={styles.content_video}
              src={contents_list[i].path}
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
