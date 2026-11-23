
"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import {
  getStudentDashboardSummary,
  type StudentDashboardSummary,
} from "@/lib/express-api"

const navigationItems: {
  label: string
  href: string
  icon: LucideIcon
}[] = [
  {
    label: "Overview",
    href: "/dashboard/student",
    icon: LayoutDashboard,
  },
  {
    label: "My Applications",
    href: "/dashboard/student/my-applications",
    icon: FileText,
  },
  {
    label: "Browse Tuitions",
    href: "/tuitions",
    icon: BookOpen,
  },
]

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

function UserAvatar({
  name,
  image,
}: {
  name: string
  image: string | null
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "S"

  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E2E8F0] bg-[#EFF6FF] text-sm font-bold text-[#155EEF]"
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={40}
          height={40}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  )
}

function StudentSidebar({
  activePath,
  collapsed,
  isSigningOut,
  userImage,
  userName,
  onClose,
  onNavigate,
  onSignOut,
}: {
  activePath: string
  collapsed: boolean
  isSigningOut: boolean
  userImage: string | null
  userName: string
  onClose?: () => void
  onNavigate?: () => void
  onSignOut: () => void
}) {
  return (
    <>
      <div
        className={`flex h-[76px] shrink-0 items-center border-b border-[#E2E8F0] ${
          collapsed ? "justify-center px-2" : "px-5"
        }`}
      >
        <Link
          href="/"
          aria-label="MentorLagbe home"
          onClick={onNavigate}
          title={collapsed ? "MentorLagbe home" : undefined}
        >
          <Image
            src="/mentorlagbe-logo.png"
            alt="MentorLagbe"
            width={517}
            height={171}
            priority
            className={collapsed ? "h-auto w-12" : "h-auto w-[150px]"}
          />
        </Link>
        {onClose && (
          <button
            type="button"
            aria-label="Close dashboard navigation"
            onClick={onClose}
            className="ml-auto flex size-11 items-center justify-center rounded-xl text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
          >
            <X aria-hidden="true" size={20} />
          </button>
        )}
      </div>

      <nav
        aria-label="Student dashboard navigation"
        className={`flex-1 space-y-1 py-5 ${
          collapsed ? "px-2" : "px-3"
        }`}
      >
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activePath === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF] ${
                collapsed ? "justify-center px-2" : "px-3"
              } ${
                isActive
                  ? "bg-[#EFF6FF] text-[#155EEF]"
                  : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              }`}
            >
              <Icon aria-hidden="true" size={19} />
              <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div
        className={`shrink-0 border-t border-[#E2E8F0] ${
          collapsed ? "space-y-2 p-2" : "space-y-3 p-4"
        }`}
      >
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-3 px-1">
            <UserAvatar name={userName} image={userImage} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0F172A]">
                {userName}
              </p>
              <p className="truncate text-xs text-[#64748B]">Student</p>
            </div>
          </div>
        )}

        <Link
          href="/dashboard/profile"
          aria-label={collapsed ? "Update profile" : undefined}
          title={collapsed ? "Update profile" : undefined}
          onClick={onNavigate}
          className={`flex min-h-12 items-center gap-3 rounded-xl text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF] ${
            collapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          <UserRound aria-hidden="true" size={19} />
          <span className={collapsed ? "sr-only" : ""}>Update Profile</span>
        </Link>

        <button
          type="button"
          aria-label={
            isSigningOut
              ? "Signing out"
              : collapsed
                ? "Sign out"
                : undefined
          }
          title={collapsed ? "Sign out" : undefined}
          onClick={onSignOut}
          disabled={isSigningOut}
          className={`flex min-h-12 w-full items-center gap-3 rounded-xl text-sm font-semibold text-[#B42318] transition-colors hover:bg-[#FEF2F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B42318] ${
            collapsed ? "justify-center px-2" : "px-3"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <LogOut aria-hidden="true" size={19} />
          <span className={collapsed ? "sr-only" : ""}>
            {isSigningOut ? "Signing out..." : "Sign out"}
          </span>
        </button>
      </div>
    </>
  )
}

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
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const user = session?.user
  const userEmail = user?.email ?? ""
  const userName = user?.name?.trim() || "Student"
  const userRole = user?.role
  const userImage = user?.image ?? null
  const [summary, setSummary] = useState<StudentDashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (isSessionPending) {
      return
    }

    if (!userEmail) {
      router.replace("/sign-in")
      return
    }

    if (userRole !== "student") {
      const dashboardPath =
        userRole === "tutor"
          ? "/dashboard/tutor"
          : userRole === "admin"
            ? "/dashboard/admin"
            : "/"
      router.replace(dashboardPath)
      return
    }

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
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load your student dashboard."
          )
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
  }, [isSessionPending, router, userEmail, userRole])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMobileMenuOpen])

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      const { error } = await authClient.signOut()

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Signed out successfully.")
      router.replace("/sign-in")
      router.refresh()
    } catch {
      toast.error("Unable to sign out. Please try again.")
    } finally {
      setIsSigningOut(false)
    }
  }

  function handleRetry() {
    setIsLoading(true)
    setErrorMessage(null)

    void getStudentDashboardSummary()
      .then(setSummary)
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your student dashboard."
        )
      })
      .finally(() => setIsLoading(false))
  }

  const sidebarContent = (
    <StudentSidebar
      activePath={pathname}
      collapsed={false}
      isSigningOut={isSigningOut}
      userImage={userImage}
      userName={userName}
      onClose={() => setIsMobileMenuOpen(false)}
      onNavigate={() => setIsMobileMenuOpen(false)}
      onSignOut={handleSignOut}
    />
  )

  const desktopSidebarContent = (
    <StudentSidebar
      activePath={pathname}
      collapsed={isSidebarCollapsed}
      isSigningOut={isSigningOut}
      userImage={userImage}
      userName={userName}
      onSignOut={handleSignOut}
    />
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <aside
        aria-label="Student dashboard sidebar"
        id="student-dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[#E2E8F0] bg-white transition-[width] duration-200 md:flex ${
          isSidebarCollapsed ? "w-[72px]" : "w-60"
        }`}
      >
        {desktopSidebarContent}
      </aside>

      <div
        aria-hidden={!isMobileMenuOpen}
        className={`fixed inset-0 z-40 bg-[#0F172A]/30 transition-opacity md:hidden ${
          isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close dashboard navigation"
          onClick={() => setIsMobileMenuOpen(false)}
          className="size-full cursor-default"
        />
      </div>

      <aside
        id="student-dashboard-mobile-sidebar"
        aria-label="Student dashboard navigation"
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,280px)] flex-col border-r border-[#E2E8F0] bg-white shadow-[8px_0_24px_rgba(15,23,42,0.12)] transition-transform duration-200 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      <div
        className={`min-h-screen transition-[padding] duration-200 ${
          isSidebarCollapsed ? "md:pl-[72px]" : "md:pl-60"
        }`}
      >
        <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open dashboard navigation"
              aria-expanded={isMobileMenuOpen}
              aria-controls="student-dashboard-mobile-sidebar"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[#334155] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF] md:hidden"
            >
              <Menu aria-hidden="true" size={21} />
            </button>
            <button
              type="button"
              aria-label={
                isSidebarCollapsed
                  ? "Expand dashboard sidebar"
                  : "Collapse dashboard sidebar"
              }
              aria-expanded={!isSidebarCollapsed}
              aria-controls="student-dashboard-sidebar"
              onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
              className="hidden size-11 shrink-0 items-center justify-center rounded-xl text-[#334155] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF] md:flex"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen aria-hidden="true" size={20} />
              ) : (
                <PanelLeftClose aria-hidden="true" size={20} />
              )}
            </button>
            <span className="truncate text-sm font-semibold text-[#64748B] sm:text-base">
              Student Dashboard
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={userName} image={userImage} />
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-48 truncate text-sm font-semibold text-[#0F172A]">
                {userName}
              </p>
              <p className="max-w-48 truncate text-xs text-[#64748B]">
                {userEmail}
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {isSessionPending || !userEmail || userRole !== "student" ? (
            <DashboardLoadingState />
          ) : isLoading ? (
            <DashboardLoadingState />
          ) : errorMessage ? (
            <section
              role="alert"
              className="rounded-2xl border border-[#FECACA] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-8"
            >
              <h1 className="text-xl font-bold text-[#0F172A]">
                Dashboard unavailable
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#475569]">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-[#155EEF] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.2)] transition-colors hover:bg-[#124FCC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
              >
                Try again
              </button>
            </section>
          ) : summary ? (
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
          ) : null}
        </main>
      </div>
    </div>
  )
}