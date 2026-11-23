# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Homepage hero

The homepage has a responsive Bengali hero with a Browse Tuitions link to `/tuitions` and a locally stored education photo at `public/mentorlagbe-hero-study.jpg`. The photo is from Unsplash: [view the source image](https://images.unsplash.com/photo-1522202176988-66273c2fd55f).

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Demo accounts

These demo accounts use the reserved `.test` email domain. Sign in at `/sign-in`.

| Role    | Email                      |
| ------- | -------------------------- |
| Admin   | `admin@mentorlagbe.test`   |
| Tutor   | `tutor@mentorlagbe.test`   |
| Student | `student@mentorlagbe.test` |

Passwords are intentionally not stored in this repository because these are active account credentials. Keep them in a password manager and rotate or remove the demo accounts before using a production database.

## Profile photo uploads

Set `IMGBB_API_KEY` in `client/.env` to enable profile photo uploads. Keep the key server-side without a `NEXT_PUBLIC_` prefix. Restart the Next.js development server after changing environment variables, and add the same variable to the deployment environment for production.

The profile page accepts JPG, PNG, and WebP files up to 5 MB. It also supports saving an image URL directly.

The profile overview is read-only; use **Edit profile** to open the separate editor. Account security lets users change their password or deactivate their account. Deactivation blocks future sign-ins and keeps existing tuition, application, and payment records.

## Express API authentication

Better Auth's JWT plugin is enabled for server API authorization. Set
`BETTER_AUTH_URL` to the same base URL used by the Better Auth deployment; the
Express server uses the same value to verify token issuer and audience. A signed
in client can request a token from `GET /api/auth/token` and send it as a Bearer
token to protected Express endpoints.

The pricing page uses this token to start the monthly Pro subscription through
the Express API. Set `NEXT_PUBLIC_API_URL` in `client/.env.local` to the Express
server origin, for example `http://localhost:5000/` for local work. Set the same
variable in the client hosting environment to the deployed Express API's HTTPS
origin. Do not add a path after the origin.

The payment success and cancellation pages are available at `/payment/success`
and `/payment/cancel`. Pro is activated only after the server verifies Stripe's
webhook. For local testing, the webhook signing secret from `stripe listen`
works only while forwarding to the local server. A deployed API needs a
separate Stripe Sandbox webhook endpoint and its signing secret.

The student overview at `/dashboard/student` uses the Better Auth JWT to fetch
application totals and the current plan from `GET /api/dashboard/student`.
Other dashboard routes are separate and may not yet be implemented.
