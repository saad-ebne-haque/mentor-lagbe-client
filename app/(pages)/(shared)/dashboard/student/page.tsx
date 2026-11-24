"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Clock3,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  getStudentDashboardSummary,
  type StudentDashboardSummary,
} from "@/lib/express-api"

const dashboardCards: {
  title: string
  icon: LucideIcon
  iconClassName: string
  value: (summary: StudentDashboardSummary) => string
}[] = [
  {
    title: "Total Applied Tuitions",
    icon: Send,
    iconClassName: "bg-[#EFF6FF] text-[#155EEF]",
    value: (summary) => String(summary.totalApplications),
  },
  {
    title: "Accepted Applications",
    icon: CheckCircle2,
    iconClassName: "bg-[#F0FDFA] text-[#0D9488]",
    value: (summary) => String(summary.acceptedApplications),
  },
  {
    title: "Pending Applications",
    icon: Clock3,
    iconClassName: "bg-[#FEF3C7] text-[#B45309]",
    value: (summary) => String(summary.pendingApplications),
  },
  {
    title: "Current Plan",
    icon: Sparkles,
    iconClassName: "bg-[#F1F5F9] text-[#475569]",
    value: (summary) => (summary.plan === "pro" ? "Pro" : "Free"),
  },
]

function DashboardLoadingState() {
  return (
    <section aria-label="Loading student dashboard" aria-live="polite">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-[#E2E8F0]" />
      <div className="mt-3 h-5 max-w-md animate-pulse rounded-lg bg-[#E2E8F0]" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card) => (
          <div
            key={card.title}
            className="h-40 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white"
          />
        ))}
      </div>
      <span className="sr-only">Loading your application summary...</span>
    </section>
  )
}

export default function StudentDashboardPage() {
  const [summary, setSummary] = useState<StudentDashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    void getStudentDashboardSummary()
      .then((dashboardSummary) => {
        if (isCurrent) {
          setSummary(dashboardSummary)
          setErrorMessage(null)
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load your student dashboard."
          setErrorMessage(message)
          toast.error(message)
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  function handleRetry() {
    setIsLoading(true)
    setErrorMessage(null)

    void getStudentDashboardSummary()
      .then(setSummary)
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your student dashboard."
        setErrorMessage(message)
        toast.error(message)
      })
      .finally(() => setIsLoading(false))
  }

  if (isLoading) {
    return <DashboardLoadingState />
  }

  if (errorMessage) {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-[#FECACA] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-8"
      >
        <h1 className="text-xl font-bold text-[#0F172A]">
          Dashboard unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#475569]">{errorMessage}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-[#155EEF] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.2)] transition-colors hover:bg-[#124FCC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
        >
          Try again
        </button>
      </section>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <>
      <header>
        <p className="text-sm font-semibold text-[#155EEF]">
          Your learning overview
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
          Student Overview
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#475569] sm:text-base">
          Review your tuition applications and current plan.
        </p>
      </header>

      <section
        aria-label="Student overview statistics"
        className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {dashboardCards.map((card) => {
          const Icon = card.icon

          return (
            <article
              key={card.title}
              className="flex min-h-40 flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="max-w-[13rem] text-sm font-semibold leading-5 text-[#475569]">
                  {card.title}
                </h2>
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}
                >
                  <Icon aria-hidden="true" size={21} />
                </span>
              </div>
              <p className="mt-6 text-3xl font-extrabold tracking-tight text-[#0F172A]">
                {card.value(summary)}
              </p>
            </article>
          )
        })}
      </section>
    </>
  )
}
