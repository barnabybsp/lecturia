"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"

export function DashboardLayout() {
  const [activeClass, setActiveClass] = useState("CS 101")

  return (
    <div className="flex h-screen flex-col bg-background dark">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeClass={activeClass} onClassSelect={setActiveClass} />
        <ChatArea activeClass={activeClass} />
      </div>
    </div>
  )
}
