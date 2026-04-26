import { toNextJsHandler } from "better-auth/next-js"
import { getAuth } from "@/src/auth/server"

export const { GET, POST } = toNextJsHandler(getAuth().handler)
