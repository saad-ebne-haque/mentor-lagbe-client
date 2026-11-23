import { apiOrigin } from "./urls"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new Error("The server returned an invalid response.")
  }
}

function getErrorMessage(value: unknown, fallback: string) {
  if (isRecord(value) && typeof value.message === "string") {
    return value.message
  }

  return fallback
}

export type StudentDashboardSummary = {
  totalApplications: number
  acceptedApplications: number
  pendingApplications: number
  plan: "free" | "pro"
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
}

async function getApiToken() {
  const tokenResponse = await fetch("/api/auth/token", {
    credentials: "include",
    cache: "no-store",
  })
  const tokenBody = await readJson(tokenResponse)

  if (!tokenResponse.ok) {
    throw new Error(
      getErrorMessage(
        tokenBody,
        "Sign in again before accessing your dashboard."
      )
    )
  }

  if (!isRecord(tokenBody) || typeof tokenBody.token !== "string") {
    throw new Error("The authentication server did not return an API token.")
  }

  return tokenBody.token
}

export async function getStudentDashboardSummary(): Promise<StudentDashboardSummary> {
  const token = await getApiToken()
  const response = await fetch(`${apiOrigin}/api/dashboard/student`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })
  const body = await readJson(response)

  if (!response.ok) {
    throw new Error(
      getErrorMessage(body, "Unable to load your student dashboard.")
    )
  }

  if (
    !isRecord(body) ||
    !isRecord(body.data) ||
    !isNonNegativeInteger(body.data.totalApplications) ||
    !isNonNegativeInteger(body.data.acceptedApplications) ||
    !isNonNegativeInteger(body.data.pendingApplications) ||
    (body.data.plan !== "free" && body.data.plan !== "pro")
  ) {
    throw new Error("The server returned invalid student dashboard data.")
  }

  return {
    totalApplications: body.data.totalApplications,
    acceptedApplications: body.data.acceptedApplications,
    pendingApplications: body.data.pendingApplications,
    plan: body.data.plan,
  }
}

export async function createProCheckoutSession() {
  const token = await getApiToken()

  const checkoutResponse = await fetch(`${apiOrigin}/api/payments/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })
  const checkoutBody = await readJson(checkoutResponse)

  if (!checkoutResponse.ok) {
    throw new Error(
      getErrorMessage(checkoutBody, "Unable to start Stripe checkout.")
    )
  }

  if (
    !isRecord(checkoutBody) ||
    !isRecord(checkoutBody.data) ||
    typeof checkoutBody.data.url !== "string"
  ) {
    throw new Error("The server did not return a checkout URL.")
  }

  let checkoutUrl: URL

  try {
    checkoutUrl = new URL(checkoutBody.data.url)
  } catch {
    throw new Error("The server returned an invalid checkout URL.")
  }

  if (checkoutUrl.protocol !== "https:") {
    throw new Error("Stripe returned an insecure checkout URL.")
  }

  return checkoutUrl.href
}
