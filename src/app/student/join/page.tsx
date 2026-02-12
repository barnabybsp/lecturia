'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { GraduationCap, BookOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        setMessage('Successfully joined course!')
        setTimeout(() => {
          router.push('/student')
        }, 1500)
      } else {
        if (response.status === 401) {
          setMessage('You must be logged in as a student to join a class.')
        } else if (response.status === 404) {
          setMessage('That invite code does not match any class. Copy it from your lecturer and try again.')
        } else {
          setMessage(data.error || 'Failed to join course')
        }
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-chart-2/5 rounded-full blur-3xl" />
      </div>

      <Card className="relative max-w-md w-full p-8 bg-card border shadow-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md mx-auto mb-4">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            Join a Course
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the invite code from your lecturer
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleJoin}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-2">
              Invite Code
            </label>
            <Input
              id="code"
              name="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono text-center text-lg tracking-[0.2em] uppercase"
              placeholder="ABC12345"
            />
          </div>

          {message && (
            <div
              className={cn(
                "p-3 rounded-lg text-sm",
                message.includes('Successfully')
                  ? 'bg-chart-2/10 text-chart-2 border border-chart-2/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              )}
            >
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={joining || !code}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Course'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Your lecturer should have provided you with an invite code or link.
        </p>
      </Card>
    </div>
  )
}

export default function JoinCoursePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <JoinCourseForm />
    </Suspense>
  )
}
