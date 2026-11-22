"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
]

const roleDetails = {
  student: {
    label: "Student",
    badgeClass: "border-[#BFDBFE] bg-[#EFF6FF] text-[#155EEF]",
    dashboardHref: "/dashboard/student",
  },
  tutor: {
    label: "Tutor",
    badgeClass: "border-[#99F6E4] bg-[#F0FDFA] text-[#0D9488]",
    dashboardHref: "/dashboard/tutor",
  },
  admin: {
    label: "Admin",
    badgeClass: "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]",
    dashboardHref: "/dashboard/admin",
  },
} as const

type UserRole = keyof typeof roleDetails

function isUserRole(role: unknown): role is UserRole {
  return role === "student" || role === "tutor" || role === "admin"
}

const planDetails = {
  free: {
    label: "Free plan",
    badgeClass: "border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]",
  },
  pro: {
    label: "Pro plan",
    badgeClass: "border-[#BFDBFE] bg-[#EFF6FF] text-[#155EEF]",
  },
} as const

type UserPlan = keyof typeof planDetails

function isUserPlan(plan: unknown): plan is UserPlan {
  return plan === "free" || plan === "pro"
}

function UserAvatar({
  name,
  image,
  className = "size-10",
}: {
  name: string
  image: string | null
  className?: string
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "U"

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E2E8F0] bg-[#EFF6FF] font-bold text-[#155EEF] ${className}`}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={48}
          height={48}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  const details = roleDetails[role]

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${details.badgeClass}`}
    >
      {details.label}
    </span>
  )
}

function PlanBadge({ plan }: { plan: UserPlan }) {
  const details = planDetails[plan]

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${details.badgeClass}`}
    >
      {details.label}
    </span>
  )
}

export default function PublicNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  function closeMenus() {
    setIsMenuOpen(false)
    setIsAccountMenuOpen(false)
  }

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !accountMenuRef.current?.contains(event.target)
      ) {
        setIsAccountMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isAccountMenuOpen])

  async function handleSignOut() {
    try {
      const { error } = await authClient.signOut()

      if (error) {
        toast.error(error.message)
        return
      }

      closeMenus()
      toast.success("Signed out successfully.")
      router.refresh()
    } catch {
      toast.error("Unable to sign out. Please try again.")
    }
  }

  function renderPublicLinks(isMobile = false) {
    return navigationLinks.map((link) => {
      const isActive = pathname === link.href

      return (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive ? "page" : undefined}
          onClick={isMobile ? closeMenus : undefined}
          className={`flex min-h-12 items-center rounded-xl px-3 text-sm font-semibold transition-colors ${
            isActive
              ? "bg-[#EFF6FF] text-[#155EEF] lg:relative lg:bg-transparent lg:after:absolute lg:after:right-3 lg:after:bottom-0 lg:after:left-3 lg:after:h-[2.5px] lg:after:rounded-full lg:after:bg-[#155EEF]"
              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          }`}
        >
          {link.label}
        </Link>
      )
    })
  }

  const user = session?.user
  const userName = user?.name?.trim() || "Account"
  const userRole = isUserRole(user?.role) ? user.role : null
  const userPlan = isUserPlan(user?.plan) ? user.plan : null
  const dashboardHref = userRole ? roleDetails[userRole].dashboardHref : null

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8">
        <Link
          href="/"
          aria-label="MentorLagbe home"
          onClick={closeMenus}
          className="shrink-0 lg:justify-self-center"
        >
          <Image
            src="/mentorlagbe-logo.png"
            alt="MentorLagbe"
            width={517}
            height={171}
            priority
            className="h-auto w-[170px] sm:w-[190px]"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex lg:justify-self-center"
        >
          {renderPublicLinks()}
        </nav>

        <div className="hidden items-center gap-3 lg:flex lg:justify-self-center">
          {isPending ? (
            <div
              aria-label="Loading account"
              className="h-12 w-36 animate-pulse rounded-xl bg-[#F1F5F9]"
            />
          ) : user ? (
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={isAccountMenuOpen}
                aria-controls="account-menu"
                onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
                className="flex min-h-12 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
              >
                <UserAvatar name={userName} image={user.image ?? null} />
                <span className="hidden min-w-0 flex-col gap-1 text-left lg:flex">
                  <span className="max-w-36 truncate text-sm font-semibold text-[#0F172A]">
                    {userName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {userRole && <RoleBadge role={userRole} />}
                    {userPlan && <PlanBadge plan={userPlan} />}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  size={16}
                  className={`text-[#64748B] transition-transform ${
                    isAccountMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                id="account-menu"
                aria-label="Account options"
                hidden={!isAccountMenuOpen}
                className="absolute top-full right-0 mt-3 w-72 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-3 py-3">
                  <UserAvatar
                    name={userName}
                    image={user.image ?? null}
                    className="size-11"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0F172A]">
                      {userName}
                    </p>
                    <p className="truncate text-xs text-[#64748B]">
                      {user.email}
                    </p>
                    {(userRole || userPlan) && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {userRole && <RoleBadge role={userRole} />}
                        {userPlan && <PlanBadge plan={userPlan} />}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 py-2">
                  {dashboardHref && (
                    <Link
                      href={dashboardHref}
                      onClick={closeMenus}
                      className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                    >
                      <LayoutDashboard
                        aria-hidden="true"
                        size={18}
                        className="text-[#64748B]"
                      />
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/dashboard/profile"
                    onClick={closeMenus}
                    className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9]"
                  >
                    <UserRound
                      aria-hidden="true"
                      size={18}
                      className="text-[#64748B]"
                    />
                    Update Profile
                  </Link>
                </div>

                <div className="border-t border-[#E2E8F0] pt-2">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#E11D48] transition-colors hover:bg-[#FFF1F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48]"
                  >
                    <LogOut aria-hidden="true" size={18} />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="flex min-h-12 items-center justify-center rounded-xl border border-[#CBD5E1] px-4 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F1F5F9]"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="flex min-h-12 items-center rounded-xl bg-[#155EEF] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition-colors hover:bg-[#124FCC]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          className="flex size-12 items-center justify-center rounded-xl text-[#0F172A] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF] lg:hidden"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" size={22} />
          ) : (
            <Menu aria-hidden="true" size={22} />
          )}
        </button>
      </div>

      <div
        aria-hidden={!isMenuOpen}
        onClick={closeMenus}
        className={`fixed inset-x-0 top-20 bottom-0 bg-[#0F172A]/30 transition-opacity lg:hidden ${
          isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        className={`fixed top-20 right-0 bottom-0 z-50 flex w-[min(85vw,360px)] flex-col gap-6 overflow-y-auto border-l border-[#E2E8F0] bg-white p-5 shadow-[-8px_0_24px_rgba(15,23,42,0.08)] transition-transform duration-300 lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {isPending ? (
          <p className="text-sm text-[#64748B]">Loading account...</p>
        ) : user ? (
          <>
            <section
              aria-label="Signed-in account"
              className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={userName}
                  image={user.image ?? null}
                  className="size-12"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0F172A]">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-[#64748B]">
                    {user.email}
                  </p>
                  {(userRole || userPlan) && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {userRole && <RoleBadge role={userRole} />}
                      {userPlan && <PlanBadge plan={userPlan} />}
                    </div>
                  )}
                </div>
              </div>

              {dashboardHref && (
                <Link
                  href={dashboardHref}
                  onClick={closeMenus}
                  className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#155EEF] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition-colors hover:bg-[#124FCC]"
                >
                  <LayoutDashboard aria-hidden="true" size={18} />
                  Dashboard
                </Link>
              )}

              <Link
                href="/dashboard/profile"
                onClick={closeMenus}
                className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 text-sm font-semibold text-[#155EEF] transition-colors hover:bg-[#DBEAFE]"
              >
                <UserRound aria-hidden="true" size={18} />
                Update Profile
              </Link>
            </section>

            <nav aria-label="Public navigation" className="flex flex-col gap-1">
              {renderPublicLinks(true)}
            </nav>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-auto flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-4 text-sm font-semibold text-[#E11D48] transition-colors hover:bg-[#FFE4E6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48]"
            >
              <LogOut aria-hidden="true" size={18} />
              Sign out
            </button>
          </>
        ) : (
          <>
            <nav aria-label="Public navigation" className="flex flex-col gap-1">
              {renderPublicLinks(true)}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              <Link
                href="/sign-up"
                onClick={closeMenus}
                className="flex min-h-12 items-center justify-center rounded-xl bg-[#155EEF] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition-colors hover:bg-[#124FCC]"
              >
                Sign up
              </Link>
              <Link
                href="/sign-in"
                onClick={closeMenus}
                className="flex min-h-12 items-center justify-center rounded-xl border border-[#CBD5E1] px-4 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F1F5F9]"
              >
                Sign in
              </Link>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}
