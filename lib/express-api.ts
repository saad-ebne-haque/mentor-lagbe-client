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

export type StudentApplication = {
  id: string
  tuitionTitle: string
  tutorName: string | null
  tutorEmail: string
  monthlyFee: number
  appliedAt: string
  status: "pending" | "accepted" | "rejected"
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
}

function isStudentApplicationRecord(
  value: unknown,
): value is {
  _id: string
  tuitionTitle: string
  tutorName?: string | null
  tutorEmail: string
  monthlyFee: number
  appliedAt: string
  status: StudentApplication["status"]
} {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.tuitionTitle === "string" &&
    (value.tutorName === undefined ||
      value.tutorName === null ||
      typeof value.tutorName === "string") &&
    typeof value.tutorEmail === "string" &&
    typeof value.monthlyFee === "number" &&
    Number.isFinite(value.monthlyFee) &&
    value.monthlyFee >= 0 &&
    typeof value.appliedAt === "string" &&
    (value.status === "pending" ||
      value.status === "accepted" ||
      value.status === "rejected")
  )
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

export async function getStudentApplications(): Promise<StudentApplication[]> {
  const token = await getApiToken()
  const response = await fetch(`${apiOrigin}/api/applications/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })
  const body = await readJson(response)

  if (!response.ok) {
    throw new Error(
      getErrorMessage(body, "Unable to load your applications.")
    )
  }

  if (!isRecord(body) || !Array.isArray(body.data)) {
    throw new Error("The server returned invalid application data.")
  }

  return body.data.map((application) => {
    if (!isStudentApplicationRecord(application)) {
      throw new Error("The server returned invalid application data.")
    }

    return {
      id: application._id,
      tuitionTitle: application.tuitionTitle,
      tutorName: application.tutorName ?? null,
      tutorEmail: application.tutorEmail,
      monthlyFee: application.monthlyFee,
      appliedAt: application.appliedAt,
      status: application.status,
    }
  })
}

export async function cancelStudentApplication(applicationId: string) {
  const token = await getApiToken()
  const response = await fetch(
    `${apiOrigin}/api/applications/${encodeURIComponent(applicationId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  )
  const body = await readJson(response)

  if (!response.ok) {
    throw new Error(
      getErrorMessage(body, "Unable to cancel this application.")
    )
  }

  if (!isRecord(body) || body.success !== true) {
    throw new Error("The server did not confirm the cancellation.")
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
