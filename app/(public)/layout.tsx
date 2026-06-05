import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50" style={{ boxShadow: '0 1px 0 oklch(0.882 0.017 145)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-heading text-forest text-2xl sm:text-3xl leading-none tracking-tight transition-opacity group-hover:opacity-80">
              DigitalReceipt.ng
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-1.5">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm bg-forest text-white rounded-lg font-medium hover:bg-forest-bright transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 sm:px-4 py-2 text-sm text-ink-muted hover:text-forest transition-colors rounded-lg hover:bg-forest-light"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm bg-forest text-white rounded-lg font-medium hover:bg-forest-bright transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer style={{ background: 'oklch(0.14 0.050 145)' }}>
        <div className="max-w-5xl mx-auto px-6 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row gap-8 md:gap-0 md:items-start md:justify-between">
            {/* Brand */}
            <div className="space-y-2">
              <span className="block font-heading text-white text-2xl leading-none tracking-tight">DigitalReceipt.ng</span>
              <p className="text-xs text-white/40 max-w-[200px] leading-relaxed">Nigeria&apos;s receipt verification infrastructure</p>
            </div>

            {/* Nav links */}
            <div className="flex flex-wrap gap-x-8 gap-y-2.5 text-sm">
              <Link href="/" className="text-white/45 hover:text-white/75 transition-colors">Home</Link>
              <Link href="/verify" className="text-white/45 hover:text-white/75 transition-colors">Verify</Link>
              <Link href="/generate" className="text-white/45 hover:text-white/75 transition-colors">Generate</Link>
              <Link href="/auth/login" className="text-white/45 hover:text-white/75 transition-colors">Sign in</Link>
              <Link href="/auth/register" className="text-white/45 hover:text-white/75 transition-colors">Register</Link>
            </div>

            {/* Copyright */}
            <p className="text-xs text-white/30 md:text-right leading-relaxed">
              © 2026 DigitalReceipt.ng<br />
              All rights reserved
            </p>
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid oklch(1 0 0 / 0.07)' }}>
            <p className="text-xs text-white/25">
              DigitalReceipt.ng is not affiliated with any government agency. Receipt verification is provided as a value-added service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
