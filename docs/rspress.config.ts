import { defineConfig } from "rspress/config"

export default defineConfig({
  root: "docs",
  title: "デジタルサイネージ ユーザーガイド",
  lang: "ja",
  themeConfig: {
    sidebar: {
      "/": [
        { text: "はじめに", link: "/index" },
        { text: "ログインと認証", link: "/login" },
        { text: "コンテンツアップロード", link: "/upload" },
        { text: "コンテンツ管理", link: "/manage-contents" },
        { text: "表示画面調整", link: "/view-position" },
        {
          text: "管理者向け",
          items: [
            { text: "エリア管理", link: "/area-management" },
            { text: "アカウント一覧管理", link: "/user-account-management" },
          ],
        },
        { text: "アカウント詳細管理", link: "/account-setting" },
        { text: "サイネージ表示画面", link: "/signage-display" },
        { text: "ダッシュボード共通操作", link: "/common-operations" },
      ],
    },
  },
})
