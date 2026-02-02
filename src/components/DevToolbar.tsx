'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DevToolbar() {
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg p-3 border border-gray-700">
        <div className="text-xs font-semibold mb-2 text-gray-400">DEV TOOLBAR</div>
        <div className="flex flex-col gap-2">
          <Link
            href="/student"
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              pathname?.startsWith('/student')
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Student View
          </Link>
          <Link
            href="/lecturer"
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              pathname?.startsWith('/lecturer')
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Lecturer View
          </Link>
          <Link
            href="/"
            className="px-3 py-1.5 text-sm rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Landing Page
          </Link>
        </div>
      </div>
    </div>
  )
}




