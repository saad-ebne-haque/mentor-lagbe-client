"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type SignInField = keyof z.infer<typeof signInSchema>
type SignInErrors = Partial<Record<SignInField, string>>

export default function SignInPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<SignInErrors>({})

  function validateField(field: SignInField, value: string) {
    const result = signInSchema.shape[field].safeParse(value)

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const result = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!result.success) {
      const nextErrors: SignInErrors = {}

      for (const issue of result.error.issues) {
        const field = issue.path[0]

        if (
          (field === "email" || field === "password") &&
          !nextErrors[field]
        ) {
          nextErrors[field] = issue.message
        }
      }

      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await authClient.signIn.email({
        email: result.data.email,
        password: result.data.password,
        callbackURL: "/",
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Signed in successfully.")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Unable to sign in. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-8">
        <Link href="/" className="inline-flex">
          <Image
            src="/mentorlagbe-logo.png"
            alt="MentorLagbe - Verified Tutor Marketplace"
            width={517}
            height={171}
            priority
            className="h-auto w-[240px] max-w-full"
          />
        </Link>

        <div className="mt-8 text-center">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#0F172A]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-[1.55] text-[#334155]">
            Sign in to continue to your MentorLagbe account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-7 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#334155]"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              onBlur={(event) => validateField("email", event.currentTarget.value)}
              onChange={(event) => {
                if (errors.email) {
                  validateField("email", event.currentTarget.value)
                }
              }}
              className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-[#0F172A] transition outline-none ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                  : "border-[#E2E8F0] focus:border-[#155EEF] focus:ring-[#155EEF]/20"
              } focus:ring-2`}
            />
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                className="mt-1.5 text-sm text-red-600"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#334155]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "password-error" : undefined
              }
              onBlur={(event) =>
                validateField("password", event.currentTarget.value)
              }
              onChange={(event) => {
                if (errors.password) {
                  validateField("password", event.currentTarget.value)
                }
              }}
              className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-[#0F172A] transition outline-none ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                  : "border-[#E2E8F0] focus:border-[#155EEF] focus:ring-[#155EEF]/20"
              } focus:ring-2`}
            />
            {errors.password && (
              <p
                id="password-error"
                role="alert"
                className="mt-1.5 text-sm text-red-600"
              >
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#155EEF] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-center text-sm text-[#475569]">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[#155EEF] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </section>
    </main>
  )
}
