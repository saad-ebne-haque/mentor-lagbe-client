"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { KeyRound, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password cannot be longer than 128 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password different from your current one.",
  })

type PasswordField = keyof z.infer<typeof passwordSchema>
type PasswordErrors = Partial<Record<PasswordField, string>>

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export default function ProfilePage() {
  const { data: session, isPending, refetch } = authClient.useSession()
  const router = useRouter()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showDeactivateForm, setShowDeactivateForm] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})
  const [deactivateError, setDeactivateError] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const user = session?.user

  if (isPending) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-sm text-slate-600">Loading profile...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Your profile</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to view your profile.
          </p>
          <Link
            href="/sign-in"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Sign in
          </Link>
        </section>
      </main>
    )
  }

  const profileImage =
    typeof user.image === "string" && isHttpUrl(user.image) ? user.image : null

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const result = passwordSchema.safeParse({
      currentPassword: String(formData.get("currentPassword") ?? ""),
      newPassword: String(formData.get("newPassword") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    })

    if (!result.success) {
      const nextErrors: PasswordErrors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (
          field === "currentPassword" ||
          field === "newPassword" ||
          field === "confirmPassword"
        ) {
          nextErrors[field] = issue.message
        }
      })
      setPasswordErrors(nextErrors)
      return
    }

    setIsChangingPassword(true)
    try {
      const { error } = await authClient.changePassword({
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
        revokeOtherSessions: true,
      })

      if (error) {
        toast.error(error.message || "Could not change your password.")
        return
      }

      form.reset()
      setPasswordErrors({})
      setShowPasswordForm(false)
      toast.success("Password changed successfully.")
    } catch {
      toast.error("Could not change your password. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  async function handleDeactivate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDeactivateError("")
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")
    const confirmation = String(formData.get("confirmation") ?? "")

    if (!password) {
      setDeactivateError("Enter your current password.")
      return
    }

    if (confirmation !== "DEACTIVATE") {
      setDeactivateError('Type "DEACTIVATE" to confirm.')
      return
    }

    setIsDeactivating(true)
    try {
      const response = await fetch("/api/profile/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      })
      const result = (await response.json()) as { error?: unknown }

      if (!response.ok) {
        setDeactivateError(
          typeof result.error === "string"
            ? result.error
            : "Could not deactivate your account."
        )
        return
      }

      try {
        const { error } = await authClient.signOut()
        if (error) {
          toast.error(
            "Account deactivated. Please sign in again to refresh your session."
          )
        }
      } catch {
        toast.error(
          "Account deactivated. Please sign in again to refresh your session."
        )
      }
      try {
        await refetch()
      } catch {
        toast.error(
          "Account deactivated, but your session could not be refreshed."
        )
      }
      router.replace("/sign-in")
    } catch {
      setDeactivateError("Could not deactivate your account. Please try again.")
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7">
          <p className="text-sm font-semibold text-blue-700">
            ACCOUNT SETTINGS
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Your profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            View your account details and manage your settings.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex size-32 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={`${user.name ?? "User"} profile picture`}
                  width={128}
                  height={128}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <UserRound
                  aria-hidden="true"
                  className="size-12 text-slate-400"
                />
              )}
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              {user.name || "Your name"}
            </h2>
            <p className="mt-1 text-sm break-all text-slate-600">
              {user.email}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                {user.role}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 capitalize">
                {user.plan} plan
              </span>
            </div>
            <Link
              href="/dashboard/profile/edit"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Edit profile
            </Link>
          </section>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-semibold text-slate-900">
                Profile information
              </h2>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {user.name || "Not added"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm break-all text-slate-900">
                    {user.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Phone number
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {user.phone || "Not added"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Bio
                  </dt>
                  <dd className="mt-1 text-sm leading-6 whitespace-pre-wrap text-slate-700">
                    {user.bio || "No bio added yet."}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-2">
                <KeyRound aria-hidden="true" className="size-5 text-blue-700" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Account security
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Change your password or deactivate your account.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  aria-expanded={showPasswordForm}
                  onClick={() => {
                    setShowPasswordForm((isOpen) => !isOpen)
                    setPasswordErrors({})
                  }}
                >
                  Change password
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="min-h-11"
                  aria-expanded={showDeactivateForm}
                  onClick={() => {
                    setShowDeactivateForm((isOpen) => !isOpen)
                    setDeactivateError("")
                  }}
                >
                  Deactivate account
                </Button>
              </div>

              {showPasswordForm && (
                <form
                  className="mt-6 space-y-4 border-t border-slate-100 pt-5"
                  onSubmit={handlePasswordChange}
                  onReset={() => setPasswordErrors({})}
                >
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-2 block text-sm font-medium text-slate-800"
                    >
                      Current password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      required
                      aria-invalid={Boolean(passwordErrors.currentPassword)}
                      aria-describedby={
                        passwordErrors.currentPassword
                          ? "current-password-error"
                          : undefined
                      }
                      className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:outline-none"
                    />
                    {passwordErrors.currentPassword && (
                      <p
                        id="current-password-error"
                        role="alert"
                        className="mt-1.5 text-sm text-red-700"
                      >
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-2 block text-sm font-medium text-slate-800"
                    >
                      New password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={128}
                      required
                      aria-invalid={Boolean(passwordErrors.newPassword)}
                      aria-describedby={
                        passwordErrors.newPassword
                          ? "new-password-error"
                          : undefined
                      }
                      className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:outline-none"
                    />
                    {passwordErrors.newPassword && (
                      <p
                        id="new-password-error"
                        role="alert"
                        className="mt-1.5 text-sm text-red-700"
                      >
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-slate-800"
                    >
                      Confirm new password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      aria-invalid={Boolean(passwordErrors.confirmPassword)}
                      aria-describedby={
                        passwordErrors.confirmPassword
                          ? "confirm-password-error"
                          : undefined
                      }
                      className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:outline-none"
                    />
                    {passwordErrors.confirmPassword && (
                      <p
                        id="confirm-password-error"
                        role="alert"
                        className="mt-1.5 text-sm text-red-700"
                      >
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="min-h-11"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "Updating..." : "Update password"}
                  </Button>
                </form>
              )}

              {showDeactivateForm && (
                <form
                  className="mt-6 space-y-4 border-t border-red-100 pt-5"
                  onSubmit={handleDeactivate}
                >
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
                    Deactivation blocks future sign-ins and signs out your
                    sessions. Existing tuition, application, and payment records
                    will be kept.
                  </div>
                  <div>
                    <label
                      htmlFor="deactivatePassword"
                      className="mb-2 block text-sm font-medium text-slate-800"
                    >
                      Current password
                    </label>
                    <input
                      id="deactivatePassword"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deactivateConfirmation"
                      className="mb-2 block text-sm font-medium text-slate-800"
                    >
                      Type DEACTIVATE to confirm
                    </label>
                    <input
                      id="deactivateConfirmation"
                      name="confirmation"
                      autoComplete="off"
                      required
                      className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:outline-none"
                    />
                  </div>
                  {deactivateError && (
                    <p role="alert" className="text-sm text-red-700">
                      {deactivateError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    variant="destructive"
                    className="min-h-11"
                    disabled={isDeactivating}
                  >
                    {isDeactivating
                      ? "Deactivating..."
                      : "Confirm deactivation"}
                  </Button>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
