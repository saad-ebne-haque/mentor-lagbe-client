import Image from "next/image"
import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing / Pro Plans", href: "/pricing" },
  { label: "How It Works / About", href: "/about" },
]

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/your-page",
    icon: <FacebookIcon />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/your-account",
    icon: <InstagramIcon />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/your-company",
    icon: <LinkedInIcon />,
  },
  {
    label: "X",
    href: "https://x.com/your-handle",
    icon: <XBrandIcon />,
  },
]

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6V10H6.7v3h2.9v8h3.9Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="0.75"
        className="fill-current stroke-none"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.78C.8 0 0 .77 0 1.73v20.54C0 23.23.8 24 1.78 24h20.44c.99 0 1.78-.77 1.78-1.73V1.73C24 .77 23.21 0 22.22 0Z" />
    </svg>
  )
}

function XBrandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.969 6.817H1.677l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export default function PublicFooter() {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1.1fr_0.8fr] lg:gap-8">
          <section aria-labelledby="footer-brand-heading">
            <Link
              href="/"
              aria-label="MentorLagbe home"
              className="inline-flex rounded-xl bg-white px-2 py-1"
            >
              <Image
                src="/mentorlagbe-logo.png"
                alt="MentorLagbe"
                width={517}
                height={171}
                className="h-auto w-[200px]"
              />
            </Link>
            <h2
              id="footer-brand-heading"
              className="mt-5 text-lg font-semibold text-white"
            >
              Connecting Students with the Right Mentors.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-[1.6] text-[#CBD5E1]">
              MentorLagbe helps students and families find tutors who fit their
              learning goals.
            </p>
          </section>

          <section aria-labelledby="footer-navigation-heading">
            <h2
              id="footer-navigation-heading"
              className="text-sm font-bold text-white"
            >
              Quick links
            </h2>
            <nav aria-label="Footer navigation" className="mt-4 flex flex-col">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-12 items-center text-sm text-[#CBD5E1] transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14B8A6]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          <section aria-labelledby="footer-contact-heading">
            <h2
              id="footer-contact-heading"
              className="text-sm font-bold text-white"
            >
              Contact
            </h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-[#CBD5E1]">
              <li className="flex min-h-12 items-center gap-3">
                <Mail
                  aria-hidden="true"
                  size={18}
                  className="shrink-0 text-[#14B8A6]"
                />
                <span>support@example.com</span>
              </li>
              <li className="flex min-h-12 items-center gap-3">
                <Phone
                  aria-hidden="true"
                  size={18}
                  className="shrink-0 text-[#14B8A6]"
                />
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex min-h-12 items-center gap-3">
                <MapPin
                  aria-hidden="true"
                  size={18}
                  className="shrink-0 text-[#14B8A6]"
                />
                <span>[Add location details]</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="footer-social-heading">
            <h2
              id="footer-social-heading"
              className="text-sm font-bold text-white"
            >
              Follow us
            </h2>
            <p className="mt-4 text-sm leading-[1.6] text-[#CBD5E1]">
              Social profile links are editable placeholders.
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${link.label} (replace with official profile URL)`}
                    title={`${link.label} profile placeholder`}
                    className="flex size-12 items-center justify-center rounded-full border border-[#334155] text-[#CBD5E1] transition-colors hover:border-[#64748B] hover:bg-[#1E293B] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14B8A6]"
                  >
                    {link.icon}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-10 border-t border-[#1E293B] pt-6">
          <p className="text-sm leading-6 text-[#CBD5E1]">
            © 2026 MentorLagbe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
