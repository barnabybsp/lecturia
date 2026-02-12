"use client"

import { useEffect, useState, useCallback } from "react"
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
  const [conversations, setConversations] = useState<
    { id: string; title: string; updated_at?: string | null }[]
  >([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const handleCourseSelect = (courseId: string, courseName: string) => {
    setActiveCourseId(courseId)
    setActiveCourseName(courseName)
    setActiveConversationId(null)
  }

  const fetchConversations = useCallback(async (courseId: string, signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/conversations?courseId=${courseId}`, { signal })
      if (!response.ok) {
        return
      }
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      console.error('Error fetching conversations:', error)
    }
  }, [])

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId)
  }

  const handleNewConversation = () => {
    setActiveConversationId(null)
  }

  const handleConversationChange = (conversationId: string | null) => {
    setActiveConversationId(conversationId)
    if (activeCourseId) {
      fetchConversations(activeCourseId)
    }
  }

  useEffect(() => {
    if (courses.length === 0) {
      setActiveCourseId(null)
      setActiveCourseName("")
      setActiveConversationId(null)
      return
    }

    if (!activeCourseId || !courses.some((course) => course.id === activeCourseId)) {
      setActiveCourseId(courses[0].id)
      setActiveCourseName(courses[0].name)
      setActiveConversationId(null)
    }
  }, [courses, activeCourseId])

  useEffect(() => {
    if (!activeCourseId) {
      setConversations([])
      return
    }

    const controller = new AbortController()
    fetchConversations(activeCourseId, controller.signal)

    return () => controller.abort()
  }, [activeCourseId, fetchConversations])

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header userName={userName} userEmail={userEmail} variant="student" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeCourseId={activeCourseId}
          courses={courses}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onCourseSelect={handleCourseSelect}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />
        <ChatArea
          activeClass={activeCourseName || "Select a course"}
          courseId={activeCourseId || undefined}
          conversationId={activeConversationId}
          onConversationIdChange={handleConversationChange}
        />
      </div>
    </div>
  )
}
