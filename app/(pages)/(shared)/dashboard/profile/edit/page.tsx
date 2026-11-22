"use client"

import Image from "next/image"
import Link from "next/link"
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from "react"
import { z } from "zod"
import { toast } from "sonner"
import { Camera, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  phone: z.string().trim(),
  bio: z.string().trim(),
  image: z
    .string()
    .trim()
    .refine(
      (value) => !value || isHttpUrl(value),
      "Enter a valid http or https image URL."
    ),
})

type ProfileField = keyof typeof profileSchema.shape
type ProfileErrors = Partial<Record<ProfileField, string>>
type ProfileValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { data: session, isPending, refetch } = authClient.useSession()
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewFailed, setPreviewFailed] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [savedValues, setSavedValues] = useState<ProfileValues | null>(null)
  const [formVersion, setFormVersion] = useState(0)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = session?.user

  useEffect(() => {
    if (!localPreviewUrl) {
      return
    }

    return () => URL.revokeObjectURL(localPreviewUrl)
  }, [localPreviewUrl])

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
            Sign in to view and update your profile.
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

  const profileUser = user
  const imageUrl = previewUrl ?? savedValues?.image ?? profileUser.image ?? ""
  const displayImageUrl = localPreviewUrl ?? imageUrl
  const canPreviewImage =
    localPreviewUrl !== null || (isHttpUrl(imageUrl) && !previewFailed)

  function getFieldError(field: ProfileField, value: string) {
    const result = profileSchema.shape[field].safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  function validateField(field: ProfileField, value: string) {
    setErrors((current) => ({
      ...current,
      [field]: getFieldError(field, value),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const values = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      image: String(formData.get("image") ?? ""),
    }
    const result = profileSchema.safeParse(values)

    if (!result.success) {
      const nextErrors: ProfileErrors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (
          field === "name" ||
          field === "phone" ||
          field === "bio" ||
          field === "image"
        ) {
          nextErrors[field] = issue.message
        }
      })
      setErrors(nextErrors)
      return
    }

    if (values.image.trim() && previewFailed) {
      setErrors((current) => ({
        ...current,
        image: "Could not load this image. Check the URL and try again.",
      }))
      return
    }

    setIsSaving(true)
    try {
      const { error } = await authClient.updateUser({
        name: result.data.name,
        phone: result.data.phone,
        bio: result.data.bio,
        image: result.data.image || null,
      })

      if (error) {
        toast.error(error.message || "Could not update your profile.")
        return
      }

      setSavedValues(result.data)
      setFormVersion((current) => current + 1)
      setPreviewUrl(null)
      setPreviewFailed(false)
      setErrors({})
      toast.success("Profile updated successfully.")
      try {
        await refetch()
      } catch {
        toast.error("Profile saved, but your session could not be refreshed.")
      }
    } catch {
      toast.error("Could not update your profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) {
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image.")
      event.currentTarget.value = ""
      return
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      toast.error("The image must be smaller than 5 MB.")
      event.currentTarget.value = ""
      return
    }

    setSelectedFile(file)
    setLocalPreviewUrl(URL.createObjectURL(file))
    setPreviewFailed(false)
  }

  function clearFileSelection() {
    setSelectedFile(null)
    setLocalPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function handleImageUpload() {
    if (!selectedFile) {
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.set("image", selectedFile)

    try {
      const response = await fetch("/api/profile/image", {
        method: "POST",
        body: formData,
      })
      const result = (await response.json()) as {
        error?: unknown
        imageUrl?: unknown
        warning?: unknown
      }

      if (!response.ok || typeof result.imageUrl !== "string") {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Could not upload your profile photo."
        )
        return
      }

      const uploadedImageUrl = result.imageUrl
      setSavedValues((current) => ({
        name: current?.name ?? profileUser.name ?? "",
        phone: current?.phone ?? profileUser.phone ?? "",
        bio: current?.bio ?? profileUser.bio ?? "",
        image: uploadedImageUrl,
      }))
      setPreviewUrl(uploadedImageUrl)
      setPreviewFailed(false)
      clearFileSelection()
      if (imageInputRef.current) {
        imageInputRef.current.value = uploadedImageUrl
        imageInputRef.current.defaultValue = uploadedImageUrl
      }

      toast.success("Profile photo uploaded.")
      if (typeof result.warning === "string") {
        toast.error(result.warning)
      }

      try {
        await refetch()
      } catch {
        toast.error("Photo uploaded, but your session could not be refreshed.")
      }
    } catch {
      toast.error("Could not upload your profile photo. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleImageRemove() {
    setIsRemoving(true)
    try {
      const response = await fetch("/api/profile/image", { method: "DELETE" })
      const result = (await response.json()) as {
        error?: unknown
        warning?: unknown
      }

      if (!response.ok) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Could not remove your profile photo."
        )
        return
      }

      setSavedValues((current) => ({
        name: current?.name ?? profileUser.name ?? "",
        phone: current?.phone ?? profileUser.phone ?? "",
        bio: current?.bio ?? profileUser.bio ?? "",
        image: "",
      }))
      setPreviewUrl("")
      setPreviewFailed(false)
      clearFileSelection()
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
        imageInputRef.current.defaultValue = ""
      }

      toast.success("Profile photo removed.")
      if (typeof result.warning === "string") {
        toast.error(result.warning)
      }

      try {
        await refetch()
      } catch {
        toast.error("Photo removed, but your session could not be refreshed.")
      }
    } catch {
      toast.error("Could not remove your profile photo. Please try again.")
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <Link
            href="/dashboard/profile"
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            Back to profile
          </Link>
        </div>
        <header className="mb-7">
          <p className="text-sm font-semibold text-blue-700">
            ACCOUNT SETTINGS
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Edit profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Keep your personal information up to date.
          </p>
        </header>

        <form
          key={formVersion}
          className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]"
          onSubmit={handleSubmit}
        >
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">
              Personal information
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Update the details shown on your profile.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Full name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={savedValues?.name ?? profileUser.name ?? ""}
                  autoComplete="name"
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`min-h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:outline-none ${
                    errors.name ? "border-red-500" : "border-slate-300"
                  }`}
                  onBlur={(event: FocusEvent<HTMLInputElement>) =>
                    validateField("name", event.currentTarget.value)
                  }
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="mt-1.5 text-sm text-red-700"
                    role="alert"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={savedValues?.phone ?? profileUser.phone ?? ""}
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className={`min-h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:outline-none ${
                    errors.phone ? "border-red-500" : "border-slate-300"
                  }`}
                  onBlur={(event: FocusEvent<HTMLInputElement>) =>
                    validateField("phone", event.currentTarget.value)
                  }
                />
                {errors.phone && (
                  <p
                    id="phone-error"
                    className="mt-1.5 text-sm text-red-700"
                    role="alert"
                  >
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  defaultValue={savedValues?.bio ?? profileUser.bio ?? ""}
                  placeholder="Write a short introduction about yourself"
                  rows={5}
                  aria-invalid={Boolean(errors.bio)}
                  aria-describedby={errors.bio ? "bio-error" : undefined}
                  className={`min-h-32 w-full rounded-xl border bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:outline-none ${
                    errors.bio ? "border-red-500" : "border-slate-300"
                  }`}
                  onBlur={(event: FocusEvent<HTMLTextAreaElement>) =>
                    validateField("bio", event.currentTarget.value)
                  }
                />
                {errors.bio && (
                  <p
                    id="bio-error"
                    className="mt-1.5 text-sm text-red-700"
                    role="alert"
                  >
                    {errors.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard/profile"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Cancel
              </Link>
              <Button type="submit" className="min-h-11" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-2">
              <Camera aria-hidden="true" className="size-5 text-blue-700" />
              <h2 className="text-lg font-semibold text-slate-900">
                Profile picture
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Add a photo using its image URL.
            </p>

            <div className="mt-6 flex justify-center">
              <div className="flex size-32 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {canPreviewImage ? (
                  <Image
                    src={displayImageUrl}
                    alt="Profile picture preview"
                    width={128}
                    height={128}
                    unoptimized
                    className="size-full object-cover"
                    onError={() => setPreviewFailed(true)}
                  />
                ) : (
                  <UserRound
                    aria-hidden="true"
                    className="size-12 text-slate-400"
                  />
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <input
                ref={fileInputRef}
                id="profile-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Choose a profile photo"
              />
              <label
                htmlFor="profile-image-file"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:bg-blue-100"
              >
                Choose photo
              </label>
              <Button
                type="button"
                className="min-h-11"
                disabled={!selectedFile || isUploading || isRemoving}
                onClick={handleImageUpload}
              >
                {isUploading ? "Uploading..." : "Upload photo"}
              </Button>
              {imageUrl && !localPreviewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  disabled={isUploading || isRemoving}
                  onClick={handleImageRemove}
                >
                  {isRemoving ? "Removing..." : "Remove photo"}
                </Button>
              )}
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              JPG, PNG, or WebP up to 5 MB.
            </p>

            <div className="mt-6">
              <label
                htmlFor="image"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                Profile picture URL
              </label>
              <input
                id="image"
                name="image"
                defaultValue={savedValues?.image ?? profileUser.image ?? ""}
                placeholder="https://example.com/photo.jpg"
                aria-invalid={Boolean(errors.image || previewFailed)}
                aria-describedby={
                  errors.image || previewFailed ? "image-error" : "image-help"
                }
                type="text"
                inputMode="url"
                className={`min-h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:outline-none ${
                  errors.image || previewFailed
                    ? "border-red-500"
                    : "border-slate-300"
                }`}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setPreviewUrl(event.currentTarget.value)
                  setPreviewFailed(false)
                  clearFileSelection()
                  if (errors.image) {
                    validateField("image", event.currentTarget.value)
                  }
                }}
                onBlur={(event: FocusEvent<HTMLInputElement>) =>
                  validateField("image", event.currentTarget.value)
                }
              />
              <p
                id="image-help"
                className="mt-2 text-xs leading-5 text-slate-500"
              >
                Paste a direct http or https link to an image. Leave blank to
                use the default avatar.
              </p>
              {(errors.image || previewFailed) && (
                <p
                  id="image-error"
                  className="mt-2 text-sm text-red-700"
                  role="alert"
                >
                  {errors.image ||
                    "Could not load the image preview. Check the URL and try again."}
                </p>
              )}
            </div>
          </section>
        </form>
      </div>
    </main>
  )
}
