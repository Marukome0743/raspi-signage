"use client"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import AddBusinessIcon from "@mui/icons-material/AddBusiness"
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import DisplayIcon from "@mui/icons-material/DisplaySettings"
import LightModeIcon from "@mui/icons-material/LightMode"
import LogoutIcon from "@mui/icons-material/Logout"
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts"
import MenuIcon from "@mui/icons-material/Menu"
import UploadIcon from "@mui/icons-material/Upload"
import type { SelectChangeEvent } from "@mui/material"
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
} from "@mui/material"
import MuiAppBar from "@mui/material/AppBar"
import Backdrop from "@mui/material/Backdrop"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import Divider from "@mui/material/Divider"
import MuiDrawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import { useTheme } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { useColorMode } from "@/src/ColorModeContext"
import { getContentList } from "@/src/services/contents"
import { createClient } from "@/src/supabase/client"
import type { ContentListItem, UserInfo } from "@/src/supabase/database.types"
import { OrderProvider, useOrderContext } from "./OrderContext"

interface DashboardProps {
  children: React.ReactNode
  userInfo: UserInfo | null
}

interface MainListItemsProps {
  isAdmin: boolean
  onNavigate?: () => void
}

interface CustomListItemProps {
  onClick: () => void
  text: string
  href: string
  children: React.ReactNode
}

const drawerWidth = 260

const MainListItems = ({ isAdmin, onNavigate }: MainListItemsProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const CustomlistItem = ({
    onClick,
    text,
    href,
    children,
  }: CustomListItemProps) => {
    const isActive = pathname === href
    return (
      <ListItemButton
        selected={isActive}
        onClick={() => {
          onClick()
          onNavigate?.()
        }}
      >
        <ListItemIcon
          sx={{
            color: isActive ? "primary.main" : "text.secondary",
          }}
        >
          {children}
        </ListItemIcon>
        <ListItemText
          primary={text}
          slotProps={{
            primary: {
              sx: {
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "text.primary" : "text.secondary",
              },
            },
          }}
        />
      </ListItemButton>
    )
  }

  return (
    <React.Fragment>
      <CustomlistItem
        onClick={() => router.push("/dashboard")}
        href="/dashboard"
        text="アップロード"
      >
        <UploadIcon />
      </CustomlistItem>
      <CustomlistItem
        onClick={() => router.push("/dashboard/manage-contents")}
        href="/dashboard/manage-contents"
        text="コンテンツ変更"
      >
        <ChangeCircleIcon />
      </CustomlistItem>
      <CustomlistItem
        onClick={() => router.push("/dashboard/view-position")}
        href="/dashboard/view-position"
        text="表示画面調整"
      >
        <DisplayIcon />
      </CustomlistItem>
      {isAdmin && (
        <CustomlistItem
          onClick={() => router.push("/dashboard/area-management")}
          href="/dashboard/area-management"
          text="エリア管理"
        >
          <AddBusinessIcon />
        </CustomlistItem>
      )}
      {isAdmin && (
        <CustomlistItem
          onClick={() => router.push("/dashboard/user-account-management")}
          href="/dashboard/user-account-management"
          text="アカウント一覧管理"
        >
          <AccountBalanceIcon />
        </CustomlistItem>
      )}
      <CustomlistItem
        onClick={() => router.push("/dashboard/account-setting-management")}
        href="/dashboard/account-setting-management"
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
        sx={{
          "&:hover": { color: "primary.main" },
          transition: "color 0.2s",
        }}
      >
        OpenUp-LabTakizawa
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  )
}

const AREA_DISPLAY_PATHS = [
  "/dashboard",
  "/dashboard/manage-contents",
  "/dashboard/view-position",
]
const PASS_PATHS = ["/dashboard/password-reset"]

function DashboardContent({ children, userInfo }: DashboardProps) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const { mode, toggleColorMode } = useColorMode()
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
        window.location.href = "/dashboard/login"
      })
      .catch(() => {
        alert("ログアウトに失敗しました")
      })
  }

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isDesktop ? "flex-end" : "space-between",
          px: 2,
          minHeight: 64,
        }}
      >
        {!isDesktop && (
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            メニュー
          </Typography>
        )}
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      {!isPass && userInfo?.uid && (
        <>
          <List component="nav" sx={{ flex: 1, py: 1 }}>
            <MainListItems
              isAdmin={isAdmin}
              onNavigate={isDesktop ? undefined : () => setOpen(false)}
            />
          </List>
          <Divider />
          <List component="nav" sx={{ py: 1 }}>
            <ListItemButton onClick={toggleColorMode}>
              <ListItemIcon>
                {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              </ListItemIcon>
              <ListItemText
                primary={mode === "light" ? "ダークモード" : "ライトモード"}
              />
            </ListItemButton>
            <ListItemButton
              onClick={onClickLogout}
              sx={{
                color: "error.main",
                "&:hover": {
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="ログアウト" />
            </ListItemButton>
          </List>
        </>
      )}
    </>
  )

  return (
    <>
      {progress && (
        <Backdrop open={progress} sx={{ zIndex: theme.zIndex.modal + 1 }}>
          <CircularProgress sx={{ color: "primary.main" }} />
        </Backdrop>
      )}
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <MuiAppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            width: {
              md: open ? `calc(100% - ${drawerWidth}px)` : "100%",
            },
            ml: { md: open ? `${drawerWidth}px` : 0 },
            transition: theme.transitions.create(["width", "margin-left"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                ...(open && isDesktop && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1, fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              サイネージダッシュボード
            </Typography>
            {name && (
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  User
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                  }}
                >
                  {name}
                </Typography>
              </Box>
            )}
            {areaDisplay && (
              <FormControl
                variant="outlined"
                size="small"
                sx={{
                  minWidth: { xs: 100, sm: 140 },
                  "& .MuiOutlinedInput-root": {
                    color: "text.primary",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                  "& .MuiInputLabel-root": { color: "text.secondary" },
                }}
              >
                <InputLabel id="area-label">エリア</InputLabel>
                <Select
                  labelId="area-label"
                  id="area-select"
                  value={area}
                  onChange={handleOnAreaChange}
                  label="エリア"
                  disabled={contentsObjArr.length === 0}
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
        </MuiAppBar>

        {/* Mobile Drawer */}
        {!isDesktop && (
          <MuiDrawer
            variant="temporary"
            open={open}
            onClose={toggleDrawer}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
          >
            {drawerContent}
          </MuiDrawer>
        )}

        {/* Desktop Drawer */}
        {isDesktop && (
          <MuiDrawer
            variant="persistent"
            open={open}
            sx={{
              width: open ? drawerWidth : 0,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
            {drawerContent}
          </MuiDrawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: "100vh",
            overflow: "auto",
            bgcolor: "background.default",
            transition: theme.transitions.create("margin-left", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Toolbar />
          <Container
            maxWidth="lg"
            sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}
          >
            {children}
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </>
  )
}

export default function Dashboard({ children, userInfo }: DashboardProps) {
  return (
    <OrderProvider>
      <DashboardContent userInfo={userInfo}>{children}</DashboardContent>
    </OrderProvider>
  )
}
