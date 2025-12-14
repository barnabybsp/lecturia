'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'

function JoinCourseForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const inviteCode = searchParams.get('code')
    if (inviteCode) {
      setCode(inviteCode)
    }
  }, [searchParams])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoining(true)
    setMessage('')

    try {
      const response = await fetch('/api/invites/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Successfully joined course!')
        setTimeout(() => {
          router.push('/student')
        }, 1500)
      } else {
        setMessage(data.error || 'Failed to join course')
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Join Course
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the invite code to join a course
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleJoin}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Invite Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm uppercase"
              placeholder="ABC12345"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.includes('Successfully')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={joining || !code}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? 'Joining...' : 'Join Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function JoinCoursePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <JoinCourseForm />
    </Suspense>
  )
}

