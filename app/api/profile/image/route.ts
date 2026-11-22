import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth, db } from "@/lib/auth"

export const runtime = "nodejs"

const imageLimit = 5 * 1024 * 1024
const allowedTypes = ["image/jpeg", "image/png", "image/webp"]

const uploadResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      url: z.string().url(),
      delete_url: z.string().url(),
    })
    .optional(),
})

function isValidImageSignature(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }

  if (type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    )
  }

  if (type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    )
  }

  return false
}

async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

async function deleteFromImgBB(deleteUrl: string) {
  const url = new URL(deleteUrl)
  const allowedHosts = ["ibb.co", "www.ibb.co"]

  if (url.protocol !== "https:" || !allowedHosts.includes(url.hostname)) {
    throw new Error("ImgBB returned an unexpected delete URL.")
  }

  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  })

  if (response.status === 404 || response.status === 410) {
    return
  }

  if (!response.ok && (response.status < 300 || response.status >= 400)) {
    throw new Error("ImgBB could not delete the image.")
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { error: "Sign in to upload a profile photo." },
      { status: 401 }
    )
  }

  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Image upload is not configured on the server." },
      { status: 503 }
    )
  }

  const formData = await request.formData()
  const image = formData.get("image")
  if (!(image instanceof File)) {
    return NextResponse.json(
      { error: "Choose an image to upload." },
      { status: 400 }
    )
  }

  if (!allowedTypes.includes(image.type)) {
    return NextResponse.json(
      { error: "Choose a JPG, PNG, or WebP image." },
      { status: 400 }
    )
  }

  if (image.size === 0 || image.size > imageLimit) {
    return NextResponse.json(
      { error: "The image must be smaller than 5 MB." },
      { status: 400 }
    )
  }

  const signature = new Uint8Array(await image.slice(0, 12).arrayBuffer())
  if (!isValidImageSignature(image.type, signature)) {
    return NextResponse.json(
      { error: "The selected file is not a valid image." },
      { status: 400 }
    )
  }

  const uploadData = new FormData()
  uploadData.set("image", image)
  const uploadUrl = new URL("https://api.imgbb.com/1/upload")
  uploadUrl.searchParams.set("key", apiKey)

  let uploadResponse: Response
  try {
    uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: uploadData,
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    return NextResponse.json(
      { error: "Could not connect to ImgBB. Try again." },
      { status: 502 }
    )
  }

  let responseBody: unknown
  try {
    responseBody = await uploadResponse.json()
  } catch {
    return NextResponse.json(
      { error: "ImgBB returned an unreadable response." },
      { status: 502 }
    )
  }

  const uploadResult = uploadResponseSchema.safeParse(responseBody)
  if (
    !uploadResponse.ok ||
    !uploadResult.success ||
    !uploadResult.data.success ||
    !uploadResult.data.data
  ) {
    return NextResponse.json(
      { error: "ImgBB could not upload this image." },
      { status: 502 }
    )
  }

  const { url: imageUrl, delete_url: deleteUrl } = uploadResult.data.data
  const users = db.collection("user")
  const currentUser = await users.findOne(
    { email: session.user.email },
    { projection: { imageDeleteUrl: 1 } }
  )

  if (!currentUser) {
    let cleanupFailed = false
    try {
      await deleteFromImgBB(deleteUrl)
    } catch {
      cleanupFailed = true
    }

    return NextResponse.json(
      {
        error: cleanupFailed
          ? "Could not save your profile photo. ImgBB may retain the uploaded image."
          : "Could not find your profile.",
      },
      { status: 404 }
    )
  }

  const updateResult = await users.updateOne(
    { email: session.user.email },
    { $set: { image: imageUrl, imageDeleteUrl: deleteUrl } }
  )

  if (updateResult.matchedCount !== 1) {
    let cleanupFailed = false
    try {
      await deleteFromImgBB(deleteUrl)
    } catch {
      cleanupFailed = true
    }

    return NextResponse.json(
      {
        error: cleanupFailed
          ? "Could not save your profile photo. ImgBB may retain the uploaded image."
          : "Could not save your profile photo.",
      },
      { status: 500 }
    )
  }

  let warning: string | undefined
  const oldDeleteUrl = currentUser.imageDeleteUrl
  if (typeof oldDeleteUrl === "string" && oldDeleteUrl !== deleteUrl) {
    try {
      await deleteFromImgBB(oldDeleteUrl)
    } catch {
      warning =
        "The new photo is saved, but the previous ImgBB image could not be deleted."
    }
  }

  return NextResponse.json({ imageUrl, warning })
}

export async function DELETE() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { error: "Sign in to remove your profile photo." },
      { status: 401 }
    )
  }

  const users = db.collection("user")
  const currentUser = await users.findOne(
    { email: session.user.email },
    { projection: { imageDeleteUrl: 1 } }
  )

  if (!currentUser) {
    return NextResponse.json(
      { error: "Could not find your profile." },
      { status: 404 }
    )
  }

  if (typeof currentUser.imageDeleteUrl === "string") {
    try {
      await deleteFromImgBB(currentUser.imageDeleteUrl)
    } catch {
      return NextResponse.json(
        {
          error:
            "Could not delete the ImgBB image. Your current profile photo was not changed; try again.",
        },
        { status: 502 }
      )
    }
  }

  const updateResult = await users.updateOne(
    { email: session.user.email },
    {
      $set: { image: null },
      $unset: { imageDeleteUrl: "" },
    }
  )

  if (updateResult.matchedCount !== 1) {
    return NextResponse.json(
      { error: "Could not remove your profile photo." },
      { status: 500 }
    )
  }

  return NextResponse.json({ imageUrl: null })
}
