"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import { useEffect, useState } from "react"

interface HeaderProps {
  userName?: string
  userEmail?: string
}

export function Header({ userName, userEmail }: HeaderProps) {
  const [initials, setInitials] = useState("")

  useEffect(() => {
    if (userName) {
      const names = userName.split(" ")
      if (names.length >= 2) {
        setInitials(`${names[0][0]}${names[names.length - 1][0]}`.toUpperCase())
      } else if (names.length === 1) {
        setInitials(names[0][0].toUpperCase())
      }
    } else if (userEmail) {
      setInitials(userEmail[0].toUpperCase())
    }
  }, [userName, userEmail])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6 bg-card-foreground">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-700">
          <GraduationCap className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-semibold text-card">{"Lecturia"}</span>
      </div>

      <div className="flex items-center gap-2">
        {userName && (
          <span className="text-sm font-medium text-background" style={{ color: 'var(--background)' }}>Welcome {userName}</span>
        )}
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage className="bg-violet-700" src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback className="bg-primary text-primary-foreground border border-black" style={{ borderWidth: '1px', borderColor: 'rgba(0, 0, 0, 1)' }}>{initials || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  )
}
