"use client"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import AddBusinessIcon from "@mui/icons-material/AddBusiness"
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import DisplayIcon from "@mui/icons-material/DisplaySettings"
import LogoutIcon from "@mui/icons-material/Logout"
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts"
import MenuIcon from "@mui/icons-material/Menu"
import UploadIcon from "@mui/icons-material/Upload"
import type { SelectChangeEvent } from "@mui/material"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import type { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import MuiAppBar from "@mui/material/AppBar"
import Backdrop from "@mui/material/Backdrop"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import Divider from "@mui/material/Divider"
import MuiDrawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import { createTheme, styled, ThemeProvider } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { getContentList } from "@/src/services/contents"
import { createClient } from "@/src/supabase/client"
import type { ContentListItem, UserInfo } from "@/src/supabase/database.types"
import { OrderProvider, useOrderContext } from "./OrderContext"

interface DashboardProps {
  children: React.ReactNode
  userInfo: UserInfo | null
}

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

interface MainListItemsProps {
  isAdmin: boolean
}

interface CustomListItemProps {
  onClick: () => void
  text: string
  children: React.ReactNode
}

const MainListItems = (props: MainListItemsProps) => {
  const router = useRouter()
  const CustomlistItem = ({ onClick, text, children }: CustomListItemProps) => {
    return (
      <ListItemButton onClick={onClick}>
        <ListItemIcon>{children}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    )
  }

  return (
    <React.Fragment>
      <CustomlistItem
        onClick={() => router.push("/dashboard")}
        text="アップロード"
      >
        <UploadIcon />
      </CustomlistItem>
      <CustomlistItem
        onClick={() => router.push("/dashboard/manage-contents")}
        text="コンテンツ変更"
      >
        <ChangeCircleIcon />
      </CustomlistItem>
      <CustomlistItem
        onClick={() => router.push("/dashboard/view-position")}
        text="表示画面調整"
      >
        <DisplayIcon />
      </CustomlistItem>
      {props.isAdmin && (
        <CustomlistItem
          onClick={() => router.push("/dashboard/area-management")}
          text="エリア管理"
        >
          <AddBusinessIcon />
        </CustomlistItem>
      )}
      {props.isAdmin && (
        <CustomlistItem
          onClick={() => router.push("/dashboard/user-account-management")}
          text="アカウント一覧管理"
        >
          <AccountBalanceIcon />
        </CustomlistItem>
      )}
      <CustomlistItem
        onClick={() => router.push("/dashboard/account-setting-management")}
        text="アカウント詳細管理"
      >
        <ManageAccountsIcon />
      </CustomlistItem>
    </React.Fragment>
  )
}

function Copyright(props: React.ComponentProps<typeof Typography>) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link
        color="inherit"
        href="https://github.com/OpenUp-LabTakizawa"
        target="_blank"
        rel="noopener noreferrer"
      >
        OpenUp-LabTakizawa
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  )
}

const drawerWidth = 240

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}))

const mdTheme = createTheme()

const AREA_DISPLAY_PATHS = [
  "/dashboard",
  "/dashboard/manage-contents",
  "/dashboard/view-position",
]
const PASS_PATHS = ["/dashboard/password-reset"]

function DashboardContent({ children, userInfo }: DashboardProps) {
  const [open, setOpen] = React.useState<boolean>(false)
  const { setOrderId, progress } = useOrderContext()
  const isAdmin = userInfo?.isAdmin ?? false
  const coverageArea = userInfo?.coverageArea ?? []
  const [contentsObjArr, setContentsObjArr] = React.useState<ContentListItem[]>(
    [],
  )
  const [area, setArea] = React.useState<string>("")
  const [name, setName] = React.useState<string>("")
  const toggleDrawer = () => {
    setOpen(!open)
  }
  const router = useRouter()
  const pathname = usePathname()
  const areaDisplay = AREA_DISPLAY_PATHS.includes(pathname)
  const isPass = PASS_PATHS.includes(pathname)

  const handleOnAreaChange = (event: SelectChangeEvent<string>) => {
    setArea(event.target.value)
    const selectedIndex = contentsObjArr
      .map((obj) => obj.areaName)
      .indexOf(event.target.value)
    setOrderId(contentsObjArr[selectedIndex].orderId)
  }

  React.useEffect(() => {
    async function getContentAreaData() {
      if (coverageArea.length > 0) {
        const contents = await getContentList(coverageArea)
        if (contents && contents.length > 0) {
          setContentsObjArr(contents)
          setArea(contents[0].areaName)
          setOrderId(contents[0].orderId)
        } else {
          setArea("設定なし")
          setContentsObjArr([])
          setOrderId(null)
        }
      } else {
        setArea("設定なし")
        setContentsObjArr([])
        setOrderId(null)
      }
    }
    getContentAreaData()
  }, [coverageArea, setOrderId])

  React.useEffect(() => {
    if (userInfo?.uid) {
      setName(userInfo.userName ?? "")
    }
  }, [userInfo])

  const onClickLogout = async () => {
    setName("")
    const supabase = createClient()
    await supabase.auth
      .signOut()
      .then(() => {
        router.push("/dashboard/login")
      })
      .catch(() => {
        alert("ログアウトに失敗しました")
      })
  }

  const classDrop = "color: #fff"

  return (
    <ThemeProvider theme={mdTheme}>
      {progress ? (
        <Backdrop
          className={classDrop}
          open={progress}
          style={{ zIndex: "100" }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar position="absolute" open={open}>
            <Toolbar
              sx={{
                pr: "24px", // keep right padding when drawer closed
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: "36px",
                  ...(open && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
              >
                サイネージダッシュボード
              </Typography>
              {name && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mx: 2,
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                    }}
                  >
                    USER
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {name}
                  </Typography>
                </Box>
              )}
              {areaDisplay && (
                <FormControl variant="standard" sx={{ minWidth: 120 }}>
                  <InputLabel id="area-label" sx={{ color: "white" }}>
                    エリア選択
                  </InputLabel>
                  <Select
                    labelId="area-label"
                    id="area-select"
                    value={area}
                    onChange={handleOnAreaChange}
                    label="エリア選択"
                    disabled={contentsObjArr.length === 0}
                    sx={{ color: "white" }}
                  >
                    {contentsObjArr.length > 0 &&
                      contentsObjArr.map((obj) => (
                        <MenuItem value={obj.areaName} key={obj.areaName}>
                          {obj.areaName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            {!isPass && userInfo?.uid && (
              <>
                <List component="nav" style={{ height: "100%" }}>
                  <MainListItems isAdmin={isAdmin} />
                  <Divider sx={{ my: 1 }} />
                </List>
                <List component="nav"></List>
                <ListItemButton
                  onClick={onClickLogout}
                  style={{ display: "flex", alignItems: "end" }}
                >
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary={"ログアウト"} />
                </ListItemButton>
              </>
            )}
          </Drawer>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: "100vh",
              overflow: "auto",
            }}
          >
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              {children}
              <Copyright sx={{ pt: 4 }} />
            </Container>
          </Box>
        </Box>
      )}
    </ThemeProvider>
  )
}

export default function Dashboard({ children, userInfo }: DashboardProps) {
  return (
    <OrderProvider>
      <DashboardContent userInfo={userInfo}>{children}</DashboardContent>
    </OrderProvider>
  )
}
