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

function getApiOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

  if (!configuredUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.")
  }

  let apiUrl: URL

  try {
    apiUrl = new URL(configuredUrl)
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be a valid server URL.")
  }

  if (
    (apiUrl.protocol !== "http:" && apiUrl.protocol !== "https:") ||
    apiUrl.pathname !== "/" ||
    apiUrl.search ||
    apiUrl.hash
  ) {
    throw new Error("NEXT_PUBLIC_API_URL must contain only the server origin.")
  }

  return apiUrl.origin
}

export async function createProCheckoutSession() {
  const apiOrigin = getApiOrigin()
  const tokenResponse = await fetch("/api/auth/token", {
    credentials: "include",
    cache: "no-store",
  })
  const tokenBody = await readJson(tokenResponse)

  if (!tokenResponse.ok) {
    throw new Error(
      getErrorMessage(tokenBody, "Sign in again before starting checkout.")
    )
  }

  if (!isRecord(tokenBody) || typeof tokenBody.token !== "string") {
    throw new Error("The authentication server did not return an API token.")
  }

  const checkoutResponse = await fetch(`${apiOrigin}/api/payments/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenBody.token}`,
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
