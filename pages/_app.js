import { CacheProvider } from "@emotion/react"
import CssBaseInline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { useRouter } from "next/router"
import { PropTypes } from "prop-types"
import { useEffect, useState } from "react"
import Dashboard from "../components/dashboard/Dashboard"
import createEmotionCache from "../src/createEmotionCache"
import theme from "../src/theme"
import "../styles/globals.css"

const clientSideEmotionCache = createEmotionCache()

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(false)
  const getLayout = Component.getLayout || ((page) => page)
  //  const [isLogin, setLogin] = useState(false);
  const [_loading, setLoading] = useState(false)

  //  useEffect(() => {
  //    if (router.pathname == "/") return;
  //    if (sessionStorage.getItem('login') === "true") {
  //      setIsLogin(true);
  //    } else {
  //      if (!isLogin) {
  //        router.replace("/dashboard/Login");
  //      }
  //    }
  ////    const handleOnLogin = async () => {
  ////    const handleOnLogin = () => {
  ////      router.push('/dashboard/Login');
  ////      const info = await getContentsDataClient(`contents`);
  ////      sessionStorage.setItem('contents', JSON.stringify(info, undefined, 1));
  ////      console.log("Login: ", sessionStorage.getItem('contents'));
  ////      setLogin(true);
  ////       router.push('/dashboard');
  ////    }
  ////    handleOnLogin();
  //  }, [router.pathname])

  useEffect(() => {
    if (router.pathname === "/dashboard/Login") {
      sessionStorage.clear()
    }
  }, [router.pathname])

  useEffect(() => {
    const handleStart = (url) => url !== router.asPath && setPageLoading(true)
    const handleComplete = () => setPageLoading(false)

    router.events.on("routeChangeStart", handleStart)
    router.events.on("routeChangeComplete", handleComplete)
    router.events.on("routeChangeError", handleComplete)

    return () => {
      router.events.off("routeChangeStart", handleStart)
      router.events.off("routeChangeComplete", handleComplete)
      router.events.off("routeChangeError", handleComplete)
    }
  }, [router.events, router.asPath])

  useEffect(() => {
    if (router.isReady) {
      setLoading(true)
    }
  }, [router.isReady])

  const loadingComponent = <h2>Loading...</h2>
  //  if (!loading) return <h3>router準備中</h3>

  if (!pageProps.dashboard) {
    return <Component {...pageProps} />
  }

  return getLayout(
    <CacheProvider value={emotionCache}>
      {/* <Head>
        <meta name="viewport" content="initial-sclale=1, width=device-width" />
      </Head> */}
      <ThemeProvider theme={theme}>
        <CssBaseInline />
        <Dashboard
          areaDisplay={pageProps.areaDisplay}
          isPass={pageProps.isPass}
        >
          {pageLoading ? loadingComponent : <Component {...pageProps} />}
        </Dashboard>
      </ThemeProvider>
    </CacheProvider>,
  )
}
MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
}
