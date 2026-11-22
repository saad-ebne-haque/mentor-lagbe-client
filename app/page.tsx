import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import PublicFooter from "@/components/public-footer"
import PublicNavbar from "@/components/public-navbar"

export default function Page() {
  return (
    <>
      <PublicNavbar />
      <main>
        <section className="bg-[#F8FAFC]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-[#155EEF]">
                MentorLagbe · Tuition &amp; Mentorship
              </p>
              <h1 className="mt-4 text-4xl leading-[1.2] font-extrabold tracking-tight text-[#0F172A] sm:text-5xl">
                <span lang="bn">আজই তোমার উপযুক্ত </span>
                <span lang="en" className="text-[#155EEF]">
                  Tutor
                </span>
                <span lang="bn"> অথবা </span>
                <span lang="en">Mentorship Batch</span>
                <span lang="bn"> খুঁজে নাও</span>
              </h1>
              <p
                lang="bn"
                className="mt-5 max-w-xl text-base leading-7 text-[#475569] sm:text-lg sm:leading-8"
              >
                তোমার শেখার লক্ষ্য অনুযায়ী খুঁজে নাও অভিজ্ঞ Tutor এবং উপযুক্ত Mentorship
                Batch। সহজেই Browse করো, পছন্দের Tutor খুঁজে নাও এবং শুরু করো তোমার
                শেখার যাত্রা।
              </p>
              <Link
                href="/tuitions"
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155EEF] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition hover:bg-[#124FCC] hover:shadow-[0_6px_18px_rgba(21,94,239,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155EEF] active:scale-[0.98] sm:w-auto"
              >
                Browse Tuitions
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                <Image
                  src="/mentorlagbe-hero-study.jpg"
                  alt="Students collaborating while studying with laptops"
                  width={1200}
                  height={800}
                  priority
                  className="aspect-[4/3] w-full object-cover"
                  sizes="(max-width: 1023px) 100vw, 46vw"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  )
}
