import CssBaseline from "@mui/material/CssBaseline"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter"
import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import { ColorModeProvider } from "@/src/ColorModeContext"

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "サイネージダッシュボード",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider>
          <ColorModeProvider>
            <CssBaseline />
            {children}
          </ColorModeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
