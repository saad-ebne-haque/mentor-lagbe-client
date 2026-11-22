import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth, db } from "@/lib/auth"

export const runtime = "nodejs"

const deactivateSchema = z.object({
  password: z.string().min(1),
  confirmation: z.literal("DEACTIVATE"),
})

export async function POST(request: Request) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session) {
    return NextResponse.json(
      { error: "Sign in to deactivate your account." },
      { status: 401 }
    )
  }

  let requestBody: unknown
  try {
    requestBody = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const result = deactivateSchema.safeParse(requestBody)
  if (!result.success) {
    return NextResponse.json(
      { error: "Enter your current password and type DEACTIVATE to confirm." },
      { status: 400 }
    )
  }

  try {
    await auth.api.verifyPassword({
      body: { password: result.data.password },
      headers: requestHeaders,
    })
  } catch {
    return NextResponse.json(
      { error: "The current password is incorrect." },
      { status: 401 }
    )
  }

  const user = await db
    .collection("user")
    .findOne({ email: session.user.email }, { projection: { _id: 1 } })

  if (!user) {
    return NextResponse.json(
      { error: "Could not find your account." },
      { status: 404 }
    )
  }

  await db.collection("session").deleteMany({ userId: session.user.id })
  const updateResult = await db
    .collection("user")
    .updateOne({ email: session.user.email }, { $set: { isActive: false } })

  if (updateResult.matchedCount !== 1) {
    return NextResponse.json(
      { error: "Could not deactivate your account." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
