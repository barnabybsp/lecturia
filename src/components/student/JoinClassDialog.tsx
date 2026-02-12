"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/use-auth"

interface JoinClassDialogProps {
  trigger: React.ReactNode
  onJoined?: () => void
}

export function JoinClassDialog({ trigger, onJoined }: JoinClassDialogProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [joinMessage, setJoinMessage] = useState<string | null>(null)

  const resetJoinState = () => {
    setInviteCode("")
    setJoinMessage(null)
    setIsJoining(false)
  }

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault()
    setJoinMessage(null)

    if (authLoading) {
      return
    }

    if (!user) {
      router.push("/auth/login")
      return
    }

    if (!inviteCode.trim()) {
      setJoinMessage("Invite code is required.")
      return
    }

    setIsJoining(true)

    try {
      const response = await fetch("/api/invites/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401) {
          setJoinMessage("You must be logged in as a student to join a class.")
        } else if (response.status === 404) {
          setJoinMessage("That invite code does not match any class. Copy it from your lecturer and try again.")
        } else {
          setJoinMessage(data.error || "Failed to join class.")
        }
        return
      }

      setJoinMessage("Joined successfully.")
      setIsJoinOpen(false)
      resetJoinState()
      router.refresh()
      onJoined?.()
    } catch (error) {
      setJoinMessage("Something went wrong. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Dialog
      open={isJoinOpen}
      onOpenChange={(open) => {
        setIsJoinOpen(open)
        if (!open) {
          resetJoinState()
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Join a Class</DialogTitle>
          <DialogDescription>
            Enter the invite code provided by your lecturer to join their class.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <Input
              id="invite-code"
              name="invite-code"
              placeholder="Enter code (e.g., ABC12345)"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              autoComplete="off"
              className="font-mono text-center text-lg tracking-widest"
            />
          </div>
          {joinMessage && (
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                joinMessage.toLowerCase().includes("successfully")
                  ? "bg-chart-2/10 text-chart-2 border border-chart-2/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20",
              )}
            >
              {joinMessage}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isJoining || !inviteCode.trim()}
          >
            {isJoining ? "Joining..." : "Join Class"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
