"use client"

import type {
  EmotionCache,
  Options as OptionsOfCreateCache,
} from "@emotion/cache"
import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { useServerInsertedHTML } from "next/navigation"
import { useState } from "react"
import theme from "@/src/theme"

interface ThemeRegistryProps {
  children: React.ReactNode
}

function createEmotionCacheForSSR(options: Partial<OptionsOfCreateCache> = {}) {
  const cache = createCache({ key: "mui-style", prepend: true, ...options })
  cache.compat = true
  const prevInsert = cache.insert
  let inserted: string[] = []
  cache.insert = (...args) => {
    const serialized = args[1]
    if (!inserted.includes(serialized.name)) {
      inserted.push(serialized.name)
    }
    return prevInsert(...args)
  }
  const flush = () => {
    const prevInserted = inserted
    inserted = []
    return prevInserted
  }
  return { cache, flush }
}

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  const [{ cache, flush }] = useState(createEmotionCacheForSSR)

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) {
      return null
    }
    let styles = ""
    for (const name of names) {
      const style = cache.inserted[name]
      if (typeof style === "string") {
        styles += style
      }
    }
    if (!styles) {
      return null
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: required for Emotion SSR
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
