"use client"

import Link from "next/link"
import { useState } from "react"
import { Check, GraduationCap, LoaderCircle, UsersRound } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { createProCheckoutSession } from "@/lib/express-api"

type PlanRole = "student" | "tutor"

const plans: {
  role: PlanRole
  name: string
  description: string
  price: string
  benefits: string[]
  freePlan: string
  icon: typeof GraduationCap
}[] = [
  {
    role: "student",
    name: "Student Pro",
    description: "More support for your learning journey.",
    price: "$10",
    benefits: ["Priority booking", "Monthly Pro subscription"],
    freePlan: "Browse tuitions and submit applications.",
    icon: GraduationCap,
  },
  {
    role: "tutor",
    name: "Tutor Pro",
    description: "More room to grow your tutoring practice.",
    price: "$15",
    benefits: ["Unlimited tuition posts", "Monthly Pro subscription"],
    freePlan: "Post and manage up to two tuition listings.",
    icon: UsersRound,
  },
]

export default function PricingPage() {
  const { data: session, isPending } = authClient.useSession()
  const [checkingOutAs, setCheckingOutAs] = useState<PlanRole | null>(null)
  const user = session?.user

  async function handleCheckout(role: PlanRole) {
    if (!user || user.role !== role || user.plan === "pro") {
      return
    }

    setCheckingOutAs(role)

    try {
      const checkoutUrl = await createProCheckoutSession()
      window.location.assign(checkoutUrl)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start Stripe checkout."
      )
      setCheckingOutAs(null)
    }
  }

  return (
    <main className="bg-[#F8FAFC]">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-[#155EEF]">
            Simple monthly plans
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
            Choose the plan for your role
          </h1>
          <p className="mt-4 text-base leading-7 text-[#475569]">
            Every account starts with a free plan. Upgrade when you need more
            from MentorLagbe.
          </p>
        </header>

        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-2">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentRole = user?.role === plan.role
            const isPro = isCurrentRole && user?.plan === "pro"
            const isCheckingOut = checkingOutAs === plan.role

            return (
              <article
                key={plan.role}
                className="flex flex-col rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#155EEF]">
                    <Icon aria-hidden="true" size={23} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#155EEF]">
                      {plan.role === "student" ? "For students" : "For tutors"}
                    </p>
                    <h2 className="text-xl font-bold text-[#0F172A]">
                      {plan.name}
                    </h2>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-[#475569]">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-[#0F172A]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#64748B]">USD / month</span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-3 text-sm leading-6 text-[#334155]"
                    >
                      <Check
                        aria-hidden="true"
                        size={18}
                        className="mt-0.5 shrink-0 text-[#0D9488]"
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl bg-[#F8FAFC] p-4">
                  <p className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Free plan
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#334155]">
                    {plan.freePlan}
                  </p>
                </div>

                <div className="mt-auto pt-7">
                  {isPending ? (
                    <button
                      type="button"
                      disabled
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155EEF] px-4 text-sm font-semibold text-white opacity-60"
                    >
                      Checking account...
                    </button>
                  ) : !user ? (
                    <Link
                      href="/sign-in"
                      className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#155EEF] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition hover:bg-[#124FCC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
                    >
                      Sign in to subscribe
                    </Link>
                  ) : isCurrentRole && isPro ? (
                    <button
                      type="button"
                      disabled
                      className="min-h-12 w-full rounded-xl border border-[#99F6E4] bg-[#F0FDFA] px-4 text-sm font-semibold text-[#0D9488]"
                    >
                      Your Pro plan is active
                    </button>
                  ) : isCurrentRole ? (
                    <button
                      type="button"
                      onClick={() => handleCheckout(plan.role)}
                      disabled={checkingOutAs !== null}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155EEF] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition hover:bg-[#124FCC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCheckingOut && (
                        <LoaderCircle
                          aria-hidden="true"
                          size={17}
                          className="animate-spin"
                        />
                      )}
                      {isCheckingOut ? "Opening Stripe..." : "Upgrade to Pro"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="min-h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#64748B]"
                    >
                      {user.role === "admin"
                        ? "Plans are for Students and Tutors"
                        : `For ${plan.role} accounts`}
                    </button>
                  )}
                  {!user && !isPending && (
                    <p className="mt-3 text-center text-xs text-[#64748B]">
                      New to MentorLagbe?{" "}
                      <Link
                        href="/sign-up"
                        className="font-semibold text-[#155EEF] hover:underline"
                      >
                        Create an account
                      </Link>
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-[#64748B]">
          Checkout is handled by Stripe. Your Pro plan is activated after the
          server verifies the payment notification.
        </p>
      </section>
    </main>
  )
}
