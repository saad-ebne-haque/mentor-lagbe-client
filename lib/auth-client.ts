import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
    plugins: [inferAdditionalFields<typeof auth>()],
    baseURL: process.env.NODE_ENV === "development" ? 'http://localhost:3000/' : 'https://mentor-lagbe-one.vercel.app/'
});