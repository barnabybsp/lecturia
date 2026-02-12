import Link from 'next/link'
import type { Metadata } from 'next'

// Page-level metadata for the landing page.
// This overrides the defaults from layout.tsx for this specific page.
// The canonical URL tells search engines "this is THE official URL for this page"
// so they don't treat different URL variations as duplicate content.
export const metadata: Metadata = {
  title: 'Lecturia - AI-Powered Learning From Your Course Materials',
  description:
    'Upload lecture notes, textbooks, and slides. Students chat with AI that answers questions using your course materials. Generate practice exams and study smarter.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Lecturia - AI-Powered Learning From Your Course Materials',
    description:
      'Upload lecture notes and slides. Students chat with AI that understands your coursework. Generate practice exams and study smarter.',
    url: '/',
    type: 'website',
  },
  twitter: {
    title: 'Lecturia - AI-Powered Learning From Your Course Materials',
    description:
      'Upload lecture notes and slides. Students chat with AI that understands your coursework. Generate practice exams and study smarter.',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950">
      {/* Navigation — using <nav> is great for SEO, it tells search engines
          "this is the main navigation" */}
      <nav className="flex items-center justify-between px-8 py-6" aria-label="Main navigation">
        <div className="text-2xl font-bold text-white tracking-tight">
          Lecturia
        </div>
        <Link
          href="/auth/login"
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* The <main> tag tells search engines "this is the primary content of the page".
          There should only be one <main> per page. */}
      <main className="flex flex-col items-center justify-center px-8 pt-20 pb-32">
        {/* Hero Section — wrapped in <header> because it's the introductory content */}
        <header className="max-w-4xl text-center">
          {/* Only ONE h1 per page — this is the most important heading for SEO.
              Search engines use it to understand what the page is about. */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            AI-Powered Learning
            <span className="block text-violet-400">From Your Course Materials</span>
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Upload your lecture notes, textbooks, and slides. Get instant answers,
            generate practice exams, and study smarter with AI that understands your coursework.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-violet-500/25"
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-lg transition-colors border border-white/20"
            >
              Learn More
            </a>
          </div>
        </header>

        {/* Features Section — <section> with an id makes it linkable and tells
            search engines this is a distinct topic area on the page */}
        <section id="features" className="mt-32 w-full max-w-6xl" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-3xl font-bold text-white text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-6" aria-hidden="true">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Upload Materials</h3>
              <p className="text-slate-400">
                Lecturers upload PDFs, Word docs, and slides. The AI processes and understands your course content.
              </p>
            </article>

            <article className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-6" aria-hidden="true">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Ask Questions</h3>
              <p className="text-slate-400">
                Students chat with AI that answers questions using only your course materials. Accurate, relevant responses.
              </p>
            </article>

            <article className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-6" aria-hidden="true">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Generate Practice</h3>
              <p className="text-slate-400">
                Create practice exams, quizzes, and flashcards automatically. Study smarter, not harder.
              </p>
            </article>
          </div>
        </section>

        {/* Roles Section */}
        <section className="mt-32 w-full max-w-4xl" aria-labelledby="roles-heading">
          <h2 id="roles-heading" className="sr-only">Who Lecturia Is For</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <article className="bg-gradient-to-br from-violet-600/20 to-violet-800/20 rounded-2xl p-8 border border-violet-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">For Lecturers</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center gap-3">
                  <span className="text-violet-400" aria-hidden="true">✓</span> Create courses and invite students
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-violet-400" aria-hidden="true">✓</span> Upload any course materials
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-violet-400" aria-hidden="true">✓</span> AI learns from your content
                </li>
              </ul>
            </article>

            <article className="bg-gradient-to-br from-slate-600/20 to-slate-800/20 rounded-2xl p-8 border border-slate-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">For Students</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center gap-3">
                  <span className="text-violet-400" aria-hidden="true">✓</span> Join courses with invite codes
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-violet-400" aria-hidden="true">✓</span> Ask questions 24/7
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-violet-400" aria-hidden="true">✓</span> Generate study materials
                </li>
              </ul>
            </article>
          </div>
        </section>
      </main>

      {/* Footer — <footer> is a semantic tag that tells search engines
          "this is the site footer" */}
      <footer className="border-t border-white/10 py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Lecturia. AI-powered learning.
          </p>
          <Link
            href="/auth/login"
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Sign In →
          </Link>
        </div>
      </footer>
    </div>
  )
}
