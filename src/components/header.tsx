"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GraduationCap, LogOut, User, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter } from "next/navigation"

interface HeaderProps {
  userName?: string
  userEmail?: string
  variant?: "student" | "lecturer"
}

export function Header({ userName, userEmail, variant = "student" }: HeaderProps) {
  const [initials, setInitials] = useState("")
  const { signOut } = useAuth()
  const router = useRouter()

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

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6 bg-card shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-display font-semibold text-foreground tracking-tight">Lecturia</span>
          <span className="text-xs text-muted-foreground capitalize">{variant} Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-sm font-medium text-muted-foreground hidden sm:block">
            Welcome, <span className="text-foreground">{userName}</span>
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full ring-2 ring-border hover:ring-primary/50 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName || "User"}</p>
                {userEmail && (
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
