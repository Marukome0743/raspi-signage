"use client"

import { CacheProvider } from "@emotion/react"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import createEmotionCache from "@/src/createEmotionCache"
import theme from "@/src/theme"

interface ThemeRegistryProps {
  children: React.ReactNode
}

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  const cache = createEmotionCache()
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
