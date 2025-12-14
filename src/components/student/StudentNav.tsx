'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function StudentNav() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/student" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">Lecturia</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/student"
                className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                My Courses
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/student/join"
              className="text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Join Course
            </Link>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

