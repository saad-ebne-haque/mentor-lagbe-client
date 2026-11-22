# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Demo accounts

These demo accounts use the reserved `.test` email domain. Sign in at `/sign-in`.

| Role | Email |
| --- | --- |
| Admin | `admin@mentorlagbe.test` |
| Tutor | `tutor@mentorlagbe.test` |
| Student | `student@mentorlagbe.test` |

Passwords are intentionally not stored in this repository because these are active account credentials. Keep them in a password manager and rotate or remove the demo accounts before using a production database.
