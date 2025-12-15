"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"
import type { Course } from "@/types/database"

interface StudentDashboardLayoutProps {
  courses: Course[]
  userName?: string
  userEmail?: string
}

export function StudentDashboardLayout({ courses, userName, userEmail }: StudentDashboardLayoutProps) {
  const [activeCourseId, setActiveCourseId] = useState<string | null>(courses[0]?.id || null)
  const [activeCourseName, setActiveCourseName] = useState<string>(courses[0]?.name || "")

  const handleCourseSelect = (courseId: string, courseName: string) => {
    setActiveCourseId(courseId)
    setActiveCourseName(courseName)
  }

  return (
    <div className="flex h-screen flex-col bg-background dark">
      <Header userName={userName} userEmail={userEmail} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeCourseId={activeCourseId} 
          courses={courses} 
          onCourseSelect={handleCourseSelect} 
        />
        <ChatArea 
          activeClass={activeCourseName || "Select a course"} 
          courseId={activeCourseId || undefined}
        />
      </div>
    </div>
  )
}

