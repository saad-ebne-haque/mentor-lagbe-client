
"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

export default function ProfilePage() {
  const { data: session, isPending, refetch } = authClient.useSession()
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") || "").trim()

    if (name.length < 2) {
      toast.error("Name must be at least 2 characters.")
      return
    }

    const image = String(formData.get("image") || "").trim()
    const phone = String(formData.get("phone") || "").trim()
    const bio = String(formData.get("bio") || "").trim()

    setIsSaving(true)

    try {
      const { error } = await authClient.updateUser({
        name,
        image: image || null,
        phone,
        bio,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      await refetch()
      toast.success("Profile updated successfully.")
    } catch {
      toast.error("Unable to update your profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isPending) {
    return <p className="p-6 text-sm text-[#64748B]">Loading profile...</p>
  }

  if (!session) {
    return (
      <section className="m-6 rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Sign in required</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          Sign in to view and update your profile.
        </p>
        <Link
          href="/sign-in"
          className="mt-4 inline-flex rounded-xl bg-[#155EEF] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </section>
    )
  }

  const user = session.user

  return (
    <main className="min-h-full bg-[#F8FAFC] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#0F172A]">
            Profile
          </h1>
          <p className="mt-2 text-sm leading-[1.55] text-[#64748B]">
            Update the personal information saved to your account.
          </p>
        </header>

        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
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
                  minLength={2}
                  required
                  defaultValue={user.name}
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-base text-[#0F172A] outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20"
                />
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
                  type="email"
                  value={user.email}
                  readOnly
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] px-3 text-base text-[#64748B]"
                />
              </div>

              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-medium text-[#334155]"
                >
                  Profile image URL
                </label>
                <input
                  id="image"
                  name="image"
                  type="url"
                  autoComplete="url"
                  defaultValue={user.image ?? ""}
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-base text-[#0F172A] outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-[#334155]"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  defaultValue={user.phone ?? ""}
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-base text-[#0F172A] outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="bio"
                  className="mb-2 block text-sm font-medium text-[#334155]"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  defaultValue={user.bio ?? ""}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-3 text-base text-[#0F172A] outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20"
                />
              </div>
            </div>

            <div className="grid gap-4 border-t border-[#E2E8F0] pt-5 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                  Role
                </p>
                <p className="mt-1 text-sm font-medium capitalize text-[#0F172A]">
                  {user.role}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                  Plan
                </p>
                <p className="mt-1 text-sm font-medium capitalize text-[#0F172A]">
                  {user.plan}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                  Joined
                </p>
                <p className="mt-1 text-sm font-medium text-[#0F172A]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#155EEF] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}