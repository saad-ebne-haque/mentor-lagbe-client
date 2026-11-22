"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"

type UserRole = "student" | "tutor" | "admin"

const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .min(2, "Full name must be at least 2 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters."),
})

type SignUpField = keyof z.infer<typeof signUpSchema>
type SignUpErrors = Partial<Record<SignUpField, string>>

const isDevelopment = process.env.NODE_ENV === "development"

export default function SignUpPage() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>("student")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<SignUpErrors>({})

  function validateField(field: SignUpField, value: string) {
    const result = signUpSchema.shape[field].safeParse(value)

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }))
  }

  function handleRoleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedRole = event.currentTarget.value

    if (
      selectedRole === "student" ||
      selectedRole === "tutor" ||
      (isDevelopment && selectedRole === "admin")
    ) {
      setRole(selectedRole)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const result = signUpSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!result.success) {
      const nextErrors: SignUpErrors = {}

      for (const issue of result.error.issues) {
        const field = issue.path[0]

        if (
          (field === "name" || field === "email" || field === "password") &&
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
      const { error } = await authClient.signUp.email({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        role,
        callbackURL: "/",
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Account created successfully.")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Unable to create your account. Please try again.")
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
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-[1.55] text-[#334155]">
            Join MentorLagbe as a student or tutor.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-7 space-y-5"
        >
          <fieldset>
            <legend             className="mb-2 text-sm font-medium text-[#334155]">
              Select your role
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === "student"}
                  onChange={handleRoleChange}
                  className="peer sr-only"
                />
                <span className="flex min-h-20 flex-col justify-center rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] px-4 py-3 transition peer-checked:border-[#155EEF] peer-checked:bg-[#EFF6FF] peer-focus-visible:ring-2 peer-focus-visible:ring-[#155EEF]/30">
                  <span className="text-sm font-semibold text-[#0F172A]">
                    Student
                  </span>
                  <span className="mt-1 text-xs text-[#64748B]">
                    Find a tutor
                  </span>
                </span>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="tutor"
                  checked={role === "tutor"}
                  onChange={handleRoleChange}
                  className="peer sr-only"
                />
                <span className="flex min-h-20 flex-col justify-center rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] px-4 py-3 transition peer-checked:border-[#155EEF] peer-checked:bg-[#EFF6FF] peer-focus-visible:ring-2 peer-focus-visible:ring-[#155EEF]/30">
                  <span className="text-sm font-semibold text-[#0F172A]">
                    Tutor
                  </span>
                  <span className="mt-1 text-xs text-[#64748B]">
                    Teach students
                  </span>
                </span>
              </label>

              {isDevelopment && (
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={handleRoleChange}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-20 flex-col justify-center rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] px-4 py-3 transition peer-checked:border-[#155EEF] peer-checked:bg-[#EFF6FF] peer-focus-visible:ring-2 peer-focus-visible:ring-[#155EEF]/30">
                    <span className="text-sm font-semibold text-[#0F172A]">
                      Admin
                    </span>
                    <span className="mt-1 text-xs text-[#64748B]">
                      Manage platform
                    </span>
                  </span>
                </label>
              )}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-[#334155]"
            >
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              onBlur={(event) => validateField("name", event.currentTarget.value)}
              onChange={(event) => {
                if (errors.name) {
                  validateField("name", event.currentTarget.value)
                }
              }}
              className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-[#0F172A] transition outline-none ${
                errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                  : "border-[#E2E8F0] focus:border-[#155EEF] focus:ring-[#155EEF]/20"
              } focus:ring-2`}
            />
            {errors.name && (
              <p
                id="name-error"
                role="alert"
                className="mt-1.5 text-sm text-red-600"
              >
                {errors.name}
              </p>
            )}
          </div>

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
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password
                  ? "password-error password-hint"
                  : "password-hint"
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
            <p id="password-hint" className="mt-2 text-xs text-[#64748B]">
              Use at least 8 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#155EEF] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-center text-sm text-[#475569]">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#155EEF] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
