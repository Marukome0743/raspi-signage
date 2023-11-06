import { Button, Grid, Paper, Typography, Box, FormControlLabel, Checkbox, Dialog, DialogContent } from "@mui/material"
import { useRouter } from "next/router";
import { createRef, forwardRef, useEffect, useRef, useState } from "react";
import { createDisplayContent, updateDisplayContent, resetPixelSize } from "../../utilities/setContentData";
import { getContentDataClient, getContentPixelSizeId, getContentPixelSize } from "../../utilities/getContentDataClient";
import { useOrderContext } from "./OrderContext";
import { IconButton } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";


function ViewPositionComponent() {
  const [contents_list, setContentsList] = useState({});
  const [pixelSize, setPixelSize] = useState({});
  const [pixelSizeId, setPixelSizeId] = useState({});
  const [width, setWidth] = useState({});
  const [height, setHeight] = useState({});
  const [marginTop, setMarginTop] = useState({});
  const [marginLeft, setMarginLeft] = useState({});
  const [displayFlg, setDisplayFlg] = useState(false);
  const [error, setError] = useState("");
  const [errorPart, setErrorPart] = useState("");
  const [showError, setShowError] = useState(false);
  const { uid, orderId, progress, setProgress } = useOrderContext();

  useEffect(() => {
    if (!sessionStorage.getItem('uid') && !uid) {
      router.push("/dashboard/Login");
    }
  }, [])

  useEffect(() => {
    async function featchData() {
      if (orderId == null) return;
      const id = await getContentPixelSizeId(orderId)
      if (id != undefined　&& id != "") {
        setPixelSizeId(id);
        const pixel = await getContentPixelSize(id);
        setPixelSize(pixel);
        setHeight(pixel.height);
        setWidth(pixel.width);
        setMarginTop(pixel.marginTop);
        setMarginLeft(pixel.marginLeft);
      }
    }
    featchData();
  }, [orderId, progress])

  useEffect(() => {
      async function getContentData() {
        if (orderId == null) return;
        const obj = await getContentDataClient(`/order/${orderId}`);
        const display_filtered = obj["set1"].filter(obj => !obj.delete).filter(obj => Object.keys(obj).length);
        const hidden_filtered = obj["hidden"].filter(obj => !obj.delete).filter(obj => Object.keys(obj).length);
        if (display_filtered != 0) {
          setContentsList(display_filtered[0]);
        } else if (hidden_filtered != 0) {
          setContentsList(hidden_filtered[0]);
        }
      }
      getContentData();
    }, [orderId, progress])

  const router = useRouter();

  const onClickCreate = async (width, height) => {
    try {
      setProgress(true);
      const pixelSize = {
        pixelWidth: width,
        pixelHeight: height,
      };
      await createDisplayContent(orderId, pixelSize);
    } catch (e) {
      console.log(e);
    } finally {
      setProgress(false);
    }
  }

  const onClickUpdate = async () => {
//    console.log(typeof(height));
//    console.log(height);
//    console.log(width);
//    console.log(marginTop);
//    console.log(marginLeft);
//    console.log(pixelSize.pixelHeight);
//    console.log(pixelSize.pixelWidth);
    if ((height + marginTop) > pixelSize.pixelHeight || (width + marginLeft) > pixelSize.pixelWidth) {
      setError("設定していサイズ（画像の縦と画像上部余白、もしくは画像の横と画像左部余白）が画面サイズ（CSSピクセルサイズ）を超えてます");
      setErrorPart("高さと幅");
      setShowError(true);
      return;
    }
    try {
      setProgress(true);
      await updateDisplayContent(pixelSizeId, height, width, marginTop, marginLeft);
    } catch (e) {
      console.log(e);
    } finally {
      setProgress(false);
    }
//    router.reload();
  }

  const onClickReset = async () => {
    try {
      setProgress(true);
      await resetPixelSize(pixelSizeId);
      alert("ラズパイサイネージを起動することでサイネージ画面枠の値を再取得出来ます");
    } catch(e) {
      console.log(e);
    } finally {
      setProgress(false);
    }
  }

  const handleCloseError = () => {
    setShowError(false);
  }

  return (
    <>
      <Box>
        <Typography>表示画面調整</Typography>
        {(pixelSize == null || (pixelSize && !pixelSize.displayContentFlg)) ? (
         <>
           <Typography>サイネージ表示画面枠設定</Typography>
           <Button variant="contained" sx={{ m: 1 }} disabled={true} onClick={() => onClickCreate(0, 0)}>小</Button>
           <Button variant="contained" sx={{ m: 1 }} disabled={true} onClick={() => onClickCreate(0, 0)}>中</Button>
           <Button variant="contained" sx={{ m: 1 }} disabled={orderId == null} onClick={() => onClickCreate(1746, 844)}>大</Button>
         </>
        )
        :
        (
        <>
        <Button variant="contained" sx={{ m: 1 }} onClick={onClickUpdate}>更新</Button>
        <Button variant="contained" sx={{ m: 1 }} onClick={onClickReset}>サイネージ画面枠リセット</Button>
        <Box style={{ display: "flex", flexDirection: "column" }}>

        <Paper sx={{ height: 1 / 5, m: 1 }} key={"key"} style={{  position: "relative" }}>
          <Grid container>
            <Grid item style={{ display: "flex", minWidth: "730px", height: "45px", padding: "5px", justifyContent: "space-around" }}>
                <Typography style={{ width: "33%", lineHeight: "35px" }}>サイネージ画面枠(高さ)： {pixelSize.pixelHeight}px</Typography>
                <Typography style={{ width: "33%", lineHeight: "35px" }}>サイネージ画面枠(幅)： {pixelSize.pixelWidth}px</Typography>
            </Grid>
            <Grid item xs={8} container direction="column" style={{ padding: "20px", paddingTop: "10px" }}>
                <Grid item style={{ display: "flex", minWidth: "550px", height: "45px", padding: "5px" }}>
                  <Typography style={{ width: "33%", lineHeight: "35px" }}>サイネージ画像(高さ)： </Typography>
                  <input
                    type="number"
                    style={{ width: "20%" }}
                    name={"height"}
                    placeholder={pixelSize.height}
                    onInput={e => setHeight(Number(e.target.value))} />
                </Grid>
                <Grid item style={{ display: "flex", minWidth: "550px", height: "45px", padding: "5px" }}>
                  <Typography style={{ width: "33%", lineHeight: "35px" }}>サイネージ画像(幅)： </Typography>
                  <input
                    type="number"
                    style={{ width: "20%" }}
                    name={"width"}
                    placeholder={pixelSize.width}
                    onInput={e => setWidth(Number(e.target.value))} />
                </Grid>
                <Grid item style={{ display: "flex", minWidth: "550px", height: "45px", padding: "5px" }}>
                  <Typography style={{ width: "33%", lineHeight: "35px" }}>サイネージ上部余白： </Typography>
                  <input
                    type="number"
                    style={{ width: "20%" }}
                    name={"marginTop"}
                    placeholder={pixelSize.marginTop}
                    onInput={e => setMarginTop(Number(e.target.value))} />
                </Grid>
                <Grid item style={{ display: "flex", minWidth: "550px", height: "45px", padding: "5px" }}>
                  <Typography style={{ width: "33%", lineHeight: "35px" }}>サイネージ左部余白： </Typography>
                  <input
                    type="number"
                    style={{ width: "20%" }}
                    name={"marginLeft"}
                    placeholder={pixelSize.marginLeft}
                    onInput={e => setMarginLeft(Number(e.target.value))} />
                </Grid>
            </Grid>
          </Grid>
        </Paper>
        <Button variant="contained" sx={{ m: 1 }} onClick={() => setDisplayFlg(!displayFlg)}>下部へ反映（更新は行われてません）</Button>
        <Box>
          <Typography>表示画面調整イメージ（約10分の1で表示しています）</Typography>
          {displayFlg && (
          <Paper style={{  position: "relative", height: "240px" }}>
            <Grid style={{  display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
             <Grid style={{ backgroundColor: "#000", height: pixelSize.pixelHeight/10, width: pixelSize.pixelWidth/10 }}>
              {contents_list ? (
               (contents_list && contents_list.type === "image") ?
                  <img
                  src={contents_list.path}
                  style={{ height: height/10, width: width/10, marginTop: marginTop/10, marginLeft: marginLeft/10, objectFit: "contain" }}
                  alt='image file' />
                :
                  <video
                  src={contents_list.path}
                  style={{ height: height/10, width: width/10, marginTop: marginTop/10, marginLeft: marginLeft/10, objectFit: "contain" }}
                  muted autoPlay loop playsInline />
              ) : (
                <Grid style={{ backgroundColor: "#fff" }}>イメージ画像</Grid>
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
      <Dialog open={showError} onClose={handleCloseError}>
        <DialogContent>
          <Typography variant="h6" color="error">{error}</Typography>
          <Typography variant="body1">対象箇所</Typography>
          <Typography variant="body1">{errorPart}</Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ViewPositionComponent;