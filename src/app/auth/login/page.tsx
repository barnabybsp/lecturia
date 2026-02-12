'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, BookOpen, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'lecturer' | 'student'>('student')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin'
      const body = isSignUp
        ? JSON.stringify({ email, password, role })
        : JSON.stringify({ email, password })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        credentials: 'include',
      })

      const data = await response.json()

      if (response.status >= 400) {
        setMessage(data.error || 'Something went wrong')
        setLoading(false)
      } else {
        if (isSignUp) {
          setMessage('Account created! Please check your email to verify your account before signing in.')
          setIsSignUp(false)
          setPassword('')
          setLoading(false)
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
      setLoading(false)
    }
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
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-powered learning assistance for your courses
          </p>
        </div>

        {/* Toggle between Sign In and Sign Up */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false)
              setMessage('')
            }}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              !isSignUp
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true)
              setMessage('')
            }}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              isSignUp
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Sign Up
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                minLength={6}
                placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Role selection - only shown during Sign Up */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    role === 'student'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <BookOpen className={cn(
                    "h-6 w-6",
                    role === 'student' ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    role === 'student' ? 'text-primary' : 'text-foreground'
                  )}>
                    Student
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('lecturer')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    role === 'lecturer'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Users className={cn(
                    "h-6 w-6",
                    role === 'lecturer' ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    role === 'lecturer' ? 'text-primary' : 'text-foreground'
                  )}>
                    Lecturer
                  </span>
                </button>
              </div>
            </div>
          )}

          {message && (
            <div
              className={cn(
                "p-3 rounded-lg text-sm",
                message.includes('check your email') || message.includes('Account created')
                  ? 'bg-chart-2/10 text-chart-2 border border-chart-2/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              )}
            >
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading
              ? (isSignUp ? 'Creating account...' : 'Signing in...')
              : (isSignUp ? 'Create account' : 'Sign in')
            }
          </Button>
        </form>

        {!isSignUp && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true)
                setMessage('')
              }}
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        )}
      </Card>
    </div>
  )
}
