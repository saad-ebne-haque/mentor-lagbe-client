import Link from "next/link"
import { CircleX } from "lucide-react"
import PublicFooter from "@/components/public-footer"
import PublicNavbar from "@/components/public-navbar"

export default function PaymentCancelPage() {
  return (
    <>
      <PublicNavbar />
      <main className="flex min-h-[65vh] items-center justify-center bg-[#F8FAFC] px-4 py-12">
        <section
          aria-labelledby="payment-cancel-title"
          className="w-full max-w-xl rounded-3xl border border-[#E2E8F0] bg-white p-6 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-10"
        >
          <CircleX
            aria-hidden="true"
            size={52}
            className="mx-auto text-[#64748B]"
          />
          <p className="mt-5 text-sm font-semibold text-[#64748B]">
            Stripe checkout
          </p>
          <h1
            id="payment-cancel-title"
            className="mt-2 text-2xl font-bold text-[#0F172A] sm:text-3xl"
          >
            Checkout canceled
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#475569]">
            No Pro subscription was started. You can return to the plans page
            and try again whenever you are ready.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="flex min-h-12 items-center justify-center rounded-xl bg-[#155EEF] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition hover:bg-[#124FCC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF]"
            >
              Return to plans
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
