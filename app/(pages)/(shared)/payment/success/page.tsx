import Link from "next/link"
import { CircleCheck } from "lucide-react"
import PublicFooter from "@/components/public-footer"
import PublicNavbar from "@/components/public-navbar"

export default function PaymentSuccessPage() {
  return (
    <>
      <PublicNavbar />
      <main className="flex min-h-[65vh] items-center justify-center bg-[#F8FAFC] px-4 py-12">
        <section
          aria-labelledby="payment-success-title"
          className="w-full max-w-xl rounded-3xl border border-[#E2E8F0] bg-white p-6 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-10"
        >
          <CircleCheck
            aria-hidden="true"
            size={52}
            className="mx-auto text-[#14B8A6]"
          />
          <p className="mt-5 text-sm font-semibold text-[#0D9488]">
            Stripe checkout
          </p>
          <h1
            id="payment-success-title"
            className="mt-2 text-2xl font-bold text-[#0F172A] sm:text-3xl"
          >
            Checkout completed
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#475569]">
            Your payment is being verified. MentorLagbe activates the Pro plan
            after Stripe confirms it, so the update may take a short time.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard/profile"
              className="flex min-h-12 items-center justify-center rounded-xl bg-[#155EEF] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition hover:bg-[#124FCC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
            >
              Check your account
            </Link>
            <Link
              href="/"
              className="flex min-h-12 items-center justify-center rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-5 text-sm font-semibold text-[#155EEF] transition hover:bg-[#DBEAFE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
            >
              Go to home
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  )
}
