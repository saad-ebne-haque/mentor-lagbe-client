import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { auth } from "./auth"
import { clientOrigin } from "./urls"

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), jwtClient()],
  baseURL: clientOrigin,
})