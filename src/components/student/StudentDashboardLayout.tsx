"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"
import { useToast } from "@/lib/hooks/use-toast"
import type { Course } from "@/types/database"

interface StudentDashboardLayoutProps {
  courses: Course[]
  userName?: string
  userEmail?: string
}

export function StudentDashboardLayout({ courses, userName, userEmail }: StudentDashboardLayoutProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [availableCourses, setAvailableCourses] = useState<Course[]>(courses)
  const [activeCourseId, setActiveCourseId] = useState<string | null>(courses[0]?.id || null)
  const [activeCourseName, setActiveCourseName] = useState<string>(courses[0]?.name || "")
  const [conversations, setConversations] = useState<
    { id: string; title: string; updated_at?: string | null }[]
  >([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isLeavingCourseId, setIsLeavingCourseId] = useState<string | null>(null)

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
    setAvailableCourses(courses)
  }, [courses])

  useEffect(() => {
    if (availableCourses.length === 0) {
      setActiveCourseId(null)
      setActiveCourseName("")
      setActiveConversationId(null)
      return
    }

    if (!activeCourseId || !availableCourses.some((course) => course.id === activeCourseId)) {
      setActiveCourseId(availableCourses[0].id)
      setActiveCourseName(availableCourses[0].name)
      setActiveConversationId(null)
    }
  }, [availableCourses, activeCourseId])

  const handleLeaveCourse = async (courseId: string, courseName: string) => {
    const shouldLeave = window.confirm(
      `Leave "${courseName}"? You will lose access to this class and its chat history.`
    )

    if (!shouldLeave) {
      return
    }

    setIsLeavingCourseId(courseId)

    try {
      const response = await fetch("/api/enrollments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast({
          title: "Could not leave class",
          description: data.error || "Please try again.",
          variant: "destructive",
        })
        return
      }

      const updatedCourses = availableCourses.filter((course) => course.id !== courseId)
      setAvailableCourses(updatedCourses)
      setConversations([])
      setActiveConversationId(null)

      if (activeCourseId === courseId) {
        const nextCourse = updatedCourses[0]
        setActiveCourseId(nextCourse?.id || null)
        setActiveCourseName(nextCourse?.name || "")
      }

      toast({
        title: "Class left",
        description: `You left ${courseName}.`,
      })
      router.refresh()
    } catch {
      toast({
        title: "Could not leave class",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLeavingCourseId(null)
    }
  }

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
          courses={availableCourses}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onCourseSelect={handleCourseSelect}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          onLeaveCourse={handleLeaveCourse}
          leavingCourseId={isLeavingCourseId}
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
