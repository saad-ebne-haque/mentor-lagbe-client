
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  Mail,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"
import {
  cancelStudentApplication,
  getStudentApplications,
  type StudentApplication,
} from "@/lib/express-api"

const statusClassNames: Record<StudentApplication["status"], string> = {
  pending: "border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]",
  accepted: "border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E]",
  rejected: "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]",
}

function formatAppliedAt(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable"
  }

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatMonthlyFee(value: number) {
  return `BDT ${value.toLocaleString("en-BD")} / month`
}

function ApplicationsLoadingState() {
  return (
    <section aria-label="Loading applications" aria-live="polite">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-[#E2E8F0]" />
      <div className="mt-3 h-5 max-w-md animate-pulse rounded-lg bg-[#E2E8F0]" />
      <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-64 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white"
          />
        ))}
      </div>
      <span className="sr-only">Loading your tuition applications...</span>
    </section>
  )
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [cancellingApplicationId, setCancellingApplicationId] = useState<
    string | null
  >(null)

  useEffect(() => {
    let isCurrent = true

    void getStudentApplications()
      .then((result) => {
        if (isCurrent) {
          setApplications(result)
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load your applications."
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
  }, [reloadKey])

  function handleRetry() {
    setIsLoading(true)
    setErrorMessage(null)
    setReloadKey((current) => current + 1)
  }

  async function handleCancel(application: StudentApplication) {
    setCancellingApplicationId(application.id)

    try {
      await cancelStudentApplication(application.id)
      setApplications((current) =>
        current.filter((item) => item.id !== application.id),
      )
      toast.success("Application cancelled.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to cancel this application.",
      )
    } finally {
      setCancellingApplicationId(null)
    }
  }

  function renderError() {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-[#FECACA] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-8"
      >
        <h2 className="text-xl font-bold text-[#0F172A]">
          Applications unavailable
        </h2>
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

  function renderEmptyState() {
    return (
      <section className="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-12 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:px-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#155EEF]">
          <BookOpen aria-hidden="true" size={23} />
        </span>
        <h2 className="mt-4 text-lg font-bold text-[#0F172A]">
          No applications yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#475569]">
          Browse available tuitions and apply to one that matches your learning
          needs.
        </p>
        <Link
          href="/tuitions"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#155EEF] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.2)] transition-colors hover:bg-[#124FCC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
        >
          Browse Tuitions
        </Link>
      </section>
    )
  }

  return (
    <>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#155EEF]">
            Your tuition activity
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
            My Applications
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#475569] sm:text-base">
            Track tutor responses to the tuitions you have applied for.
          </p>
        </div>
        {!isLoading && !errorMessage && applications.length > 0 && (
          <Link
            href="/tuitions"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-5 text-sm font-semibold text-[#155EEF] transition-colors hover:bg-[#DBEAFE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
          >
            Browse Tuitions
          </Link>
        )}
      </header>

      <div className="mt-8">
        {isLoading ? (
          <ApplicationsLoadingState />
        ) : errorMessage ? (
          renderError()
        ) : applications.length === 0 ? (
          renderEmptyState()
        ) : (
          <section
            aria-label="Your tuition applications"
            className="grid grid-cols-1 gap-5 xl:grid-cols-2"
          >
            {applications.map((application) => (
              <article
                key={application.id}
                aria-labelledby={`application-title-${application.id}`}
                className="flex min-w-0 flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-6"
              >
                <header className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#64748B]">
                      Tuition
                    </p>
                    <h2
                      id={`application-title-${application.id}`}
                      className="mt-1 break-words text-lg font-bold text-[#0F172A]"
                    >
                      {application.tuitionTitle}
                    </h2>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClassNames[application.status]}`}
                  >
                    {application.status}
                  </span>
                </header>

                <dl className="mt-6 grid grid-cols-1 gap-5 border-t border-[#E2E8F0] pt-5 sm:grid-cols-2">
                  <div className="flex min-w-0 gap-3">
                    <UserRound
                      aria-hidden="true"
                      size={18}
                      className="mt-0.5 shrink-0 text-[#64748B]"
                    />
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-[#64748B]">
                        Tutor
                      </dt>
                      <dd className="mt-1 break-words text-sm font-semibold text-[#0F172A]">
                        {application.tutorName || "Tutor name unavailable"}
                      </dd>
                    </div>
                  </div>

                  <div className="flex min-w-0 gap-3">
                    <Mail
                      aria-hidden="true"
                      size={18}
                      className="mt-0.5 shrink-0 text-[#64748B]"
                    />
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-[#64748B]">
                        Tutor Email
                      </dt>
                      <dd className="mt-1 break-all text-sm text-[#334155]">
                        <a
                          href={`mailto:${application.tutorEmail}`}
                          className="rounded-sm hover:text-[#155EEF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
                        >
                          {application.tutorEmail}
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex min-w-0 gap-3">
                    <CircleDollarSign
                      aria-hidden="true"
                      size={18}
                      className="mt-0.5 shrink-0 text-[#64748B]"
                    />
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-[#64748B]">
                        Monthly Fee
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-[#0F172A]">
                        {formatMonthlyFee(application.monthlyFee)}
                      </dd>
                    </div>
                  </div>

                  <div className="flex min-w-0 gap-3">
                    <CalendarDays
                      aria-hidden="true"
                      size={18}
                      className="mt-0.5 shrink-0 text-[#64748B]"
                    />
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-[#64748B]">
                        Applied Date
                      </dt>
                      <dd className="mt-1 text-sm text-[#334155]">
                        <time dateTime={application.appliedAt}>
                          {formatAppliedAt(application.appliedAt)}
                        </time>
                      </dd>
                    </div>
                  </div>
                </dl>

                {application.status === "pending" && (
                  <div className="mt-6 border-t border-[#E2E8F0] pt-4 sm:text-right">
                    <button
                      type="button"
                      onClick={() => void handleCancel(application)}
                      disabled={cancellingApplicationId !== null}
                      aria-label={`Cancel application for ${application.tuitionTitle}`}
                      className="flex min-h-12 w-full items-center justify-center rounded-xl border border-[#E2E8F0] px-4 text-sm font-semibold text-[#475569] transition-colors hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#B42318] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF] disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:w-auto"
                    >
                      {cancellingApplicationId === application.id
                        ? "Cancelling..."
                        : "Cancel Application"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </>
  )
}